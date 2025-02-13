<template>
  <div class="profile-card-container">
    <!-- Team Lead Badge -->
    <div v-if="result.isTeamLead" class="team-lead-badge">
      <v-tooltip text="Team Lead">
        <template v-slot:activator="{ props }">
          <v-icon
            v-bind="props"
            icon="mdi-account-multiple"
            color="white"
            size="20"
          ></v-icon>
        </template>
      </v-tooltip>
    </div>
    <!-- Remove Button with confirmation dialog -->
    <v-btn
      v-if="isEditing && !selectable"
      icon="mdi-close"
      variant="text"
      size="small"
      class="cancel-button"
      @click.stop="confirmRemove"
    >
    </v-btn>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="300">
      <v-card>
        <v-card-title class="text-h6"> Confirm Removal </v-card-title>
        <v-card-text> Are you sure you want to remove this item? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" text @click="confirmAndRemove"> Remove </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Card -->
    <v-card
      class="mb-4 profile-card cursor-pointer"
      @click="openModal"
      color="#c2b7a4"
      rounded="lg"
    >
      <v-card-text class="pa-6">
        <div class="d-flex">
          <!-- Profile Image -->
          <div class="profile-image-container mr-4">
            <v-avatar size="80">
              <v-img
                :src="result.avatar"
                :alt="result.name"
                cover
                class="profile-image"
              ></v-img>
            </v-avatar>
          </div>

          <!-- Profile Info -->
          <div class="profile-info">
            <slot name="card-header" :result="result">
              <div class="text-h5 font-weight-medium text-white mt-1">
                {{ result.name }}
              </div>
              <v-divider
                class="my-4"
                bg-color="white"
                thickness="2"
              ></v-divider>
              <div class="text-subtitle-1 text-white mb-2">
                {{ result.title }}
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="white" class="mr-1"
                  >mdi-currency-usd</v-icon
                >
                <span class="text-white">{{ result.salary }} </span>
              </div>
              <div class="text-subtitle-2 text-white mb-4">
                Department: {{ result.department }}
              </div>
            </slot>
          </div>
        </div>

        <!-- Skills Slot -->
        <slot name="skills" :skills="skillChips">
          <div
            ref="skillsContainer"
            class="d-flex flex-wrap gap-2 skills-container"
          >
            <template
              v-for="(skill, index) in visibleSkills"
              :key="skill.label"
            >
              <v-chip
                ref="skillChips"
                variant="elevated"
                class="mr-2 mb-2 skill-chip"
                color="#2d2d2d"
                text-color="white"
              >
                {{ skill.label }}
              </v-chip>
            </template>
            <v-chip
              v-if="hiddenSkillsCount > 0"
              ref="overflowChip"
              variant="elevated"
              class="mr-2 mb-2 overflow-chip"
              color="#2d2d2d"
              text-color="white"
            >
              +{{ hiddenSkillsCount }}
            </v-chip>
          </div>
        </slot>
      </v-card-text>
    </v-card>

    <!-- Modal -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <!-- Modal Header Slot -->
        <slot name="modal-header" :result="result" :close="closeModal">
          <div class="d-flex align-center justify-space-between pa-4">
            <v-card-title class="text-h5 pa-0">
              {{ result.name }}
            </v-card-title>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="closeModal"
            ></v-btn>
          </div>
        </slot>

        <v-card-text>
          <slot name="modal-content" :result="result" :skills="skillChips">
            <div class="mt-4">
              <h3 class="text-h6 mt-4">Title</h3>
              <p>{{ result.title }}</p>

              <h3 class="text-h6 mt-4">Department</h3>
              <p>{{ result.department }}</p>

              <h3 class="text-h6 mt-4">Employment Type</h3>
              <p>{{ result.employment }}</p>

              <h3 class="text-h6 mt-4">Salary</h3>
              <p>{{ result.salary }}</p>

              <h3 class="text-h6 mt-4">Skills</h3>
              <base-chips :chips="skillChipsData" :use-color-mapping="true" />
            </div>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <slot name="modal-actions" :close="closeModal" :result="result">
            <!-- Check if it's being called by addProfileModal -->
            <template v-if="isAddMode">
              <v-btn color="error" @click="closeModal">Cancel</v-btn>
              <v-btn color="primary" @click="handleConfirmAdd">Confirm</v-btn>
            </template>
            <!-- Default close button for normal view -->
            <template v-else>
              <v-btn color="primary" variant="text" @click="closeModal">
                Close
              </v-btn>
            </template>
          </slot>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import BaseChips from '@/components/Chips.vue'
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  isAddMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'modal-opened',
  'modal-closed',
  'remove-profile',
  'confirm-add-profile',
])
const showModal = ref(false)
const showConfirmDialog = ref(false)
const visibleCount = ref(props.result.skills.length)
const skillsContainer = ref(null)
const skillChips = ref([])
const resizeObserver = ref(null)

// Data for skills is here
const skillChipsData = computed(() => {
  return props.result.skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})

const visibleSkills = computed(() => {
  return skillChipsData.value.slice(0, visibleCount.value)
})

const hiddenSkillsCount = computed(() => {
  return Math.max(0, skillChipsData.value.length - visibleCount.value)
})

const calculateVisibleChips = async () => {
  if (!skillsContainer.value) return

  const containerWidth = skillsContainer.value.offsetWidth
  const chipMargin = 8 // margin-right + margin-bottom
  const chipGap = 8 // gap between chips

  // Reset to show all chips initially
  visibleCount.value = skillChipsData.value.length
  await nextTick()

  // Get all chip elements including the overflow chip
  const chipElements = skillsContainer.value.querySelectorAll(
    '.skill-chip, .overflow-chip'
  )
  let currentRowWidth = 0
  let currentRow = 1
  let maxRows = 1 // Maximum number of rows allowed
  let lastVisibleIndex = skillChipsData.value.length

  for (let i = 0; i < chipElements.length; i++) {
    const chip = chipElements[i]
    const chipWidth = chip.offsetWidth + chipMargin + chipGap

    if (currentRowWidth + chipWidth > containerWidth) {
      currentRow++
      currentRowWidth = chipWidth
    } else {
      currentRowWidth += chipWidth
    }

    if (currentRow > maxRows) {
      lastVisibleIndex = i - 1
      break
    }
  }

  // Adjust visible count to ensure overflow chip fits
  if (lastVisibleIndex < skillChipsData.value.length) {
    // Reserve space for overflow chip
    visibleCount.value = Math.max(1, lastVisibleIndex)
  }
}

// Initialize resize observer
onMounted(() => {
  if (skillsContainer.value) {
    resizeObserver.value = new ResizeObserver(() => {
      calculateVisibleChips()
    })
    resizeObserver.value.observe(skillsContainer.value)
  }
  calculateVisibleChips()
})

// Cleanup
onBeforeUnmount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
  }
})

// Watch for changes in skills data
watch(
  () => props.result.skills,
  () => {
    calculateVisibleChips()
  },
  { deep: true }
)

const openModal = () => {
  showModal.value = true
  emit('modal-opened', props.result)
}

const closeModal = () => {
  showModal.value = false
  emit('modal-closed')
}

const confirmRemove = (event) => {
  event.stopPropagation()
  showConfirmDialog.value = true
}

const confirmAndRemove = () => {
  showConfirmDialog.value = false
  emit('remove-profile', props.result.id)
}

const handleConfirmAdd = () => {
  emit('confirm-add-profile', props.result)
  closeModal()
}
</script>

<style scoped>
.profile-card-container {
  position: relative;
}

.selection-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.profile-card.selected {
  opacity: 0.7;
  transform: scale(0.98);
}

.remove-button {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 2;
  background-color: #ff5252;
  border: 2px solid white;
  transition: transform 0.2s ease;
}

.remove-button:hover {
  transform: scale(1.1);
}

.profile-card {
  position: relative;
  overflow: hidden;
  --ring-color: rgba(255, 255, 255, 0.05);
}

.cancel-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

/* First ring */
.profile-card::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Second ring */
.profile-card::after {
  content: '';
  position: absolute;
  top: -150px;
  right: -150px;
  width: 400px;
  height: 400px;
  border: 2px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

/* Third ring */
.profile-card .v-card-text::before {
  content: '';
  position: absolute;
  top: -200px;
  right: -200px;
  width: 500px;
  height: 500px;
  border: 2px solid var(--ring-color);
  border-radius: 50%;
}

/* Fourth ring */
.profile-card .v-card-text::after {
  content: '';
  position: absolute;
  top: -250px;
  right: -250px;
  width: 600px;
  height: 600px;
  border: 2px solid var(--ring-color);
  border-radius: 50%;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.gap-2 {
  gap: 0.5rem;
}

.skills-container {
  max-width: 100%;
  min-height: 32px;
  position: relative;
  overflow: hidden;
}

.skill-chip {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.overflow-chip {
  min-width: 45px;
  text-align: center;
}
</style>
