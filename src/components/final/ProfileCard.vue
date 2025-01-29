<template>
  <div class="profile-card-container">
    <!-- Remove Button with confirmation dialog -->
    <v-btn
      v-if="isEditing"
      icon
      color="error"
      class="remove-button"
      @click.stop="confirmRemove"
    >
      <v-icon>mdi-close</v-icon>
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
        <!-- Card Header Slot -->
        <slot name="card-header" :result="result">
          <v-card-title class="text-h5 font-weight-medium pa-0 text-white mb-1">
            {{ result.title }}
          </v-card-title>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.department }}
          </v-card-subtitle>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.salary }}
          </v-card-subtitle>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.employment }}
          </v-card-subtitle>
        </slot>

        <!-- Skills Slot -->
        <slot name="skills" :skills="skillChips">
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="skill in skillChips"
              :key="skill.label"
              variant="elevated"
              class="mr-2 mb-2"
              color="#2d2d2d"
              text-color="white"
            >
              {{ skill.label }}
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
              {{ result.title }}
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
            <!-- Default modal content -->
            <div class="mt-4">
              <h3 class="text-h6 mt-4">Department</h3>
              <p>{{ result.department }}</p>

              <h3 class="text-h6 mt-4">Salary</h3>
              <p>{{ result.salary }}</p>

              <h3 class="text-h6 mt-4">Employment Type</h3>
              <p>{{ result.employment }}</p>

              <h3 class="text-h6 mt-4">Required Skills</h3>
              <base-chips :chips="skillChips" :use-color-mapping="true" />
            </div>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <slot name="modal-actions" :close="closeModal" :result="result">
            <!-- Default actions -->
            <v-btn color="primary" variant="text" @click="closeModal">
              Close
            </v-btn>
          </slot>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import BaseChips from '@/components/Chips.vue'
import { ref, computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['modal-opened', 'modal-closed', 'remove-item'])
const showModal = ref(false)
const showConfirmDialog = ref(false)

const skillChips = computed(() => {
  return props.result.skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})

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
  emit('remove-profile', props.result.id) // Emit the memberId to remove
}
</script>

<style scoped>
.profile-card-container {
  position: relative;
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
</style>
