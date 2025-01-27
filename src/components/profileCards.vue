<template>
  <div class="profile-card-container">
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
        <v-card-title class="text-h6">Confirm Removal</v-card-title>
        <v-card-text>
          Are you sure you want to remove this team member?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" text @click="confirmAndRemove">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Selection Checkbox -->
    <v-checkbox
      v-if="selectable"
      :model-value="isSelected"
      @update:model-value="toggleSelection"
      class="selection-checkbox"
      color="primary"
    ></v-checkbox>

    <!-- Card -->
    <v-card
      class="mb-4 profile-card cursor-pointer"
      :class="{ selected: selectable && isSelected }"
      @click="handleClick"
      color="#c2b7a4"
      rounded="lg"
    >
      <v-card-text class="pa-6">
        <!-- Card Header -->
        <slot name="card-header" :result="result">
          <v-card-title class="text-h5 font-weight-medium pa-0 text-white mb-1">
            {{ result.name }}
          </v-card-title>
          <v-card-subtitle class="pa-0 text-white mb-2">
            {{ result.title }}
          </v-card-subtitle>
          <v-card-subtitle class="pa-0 text-white mb-2">
            {{ result.department }}
          </v-card-subtitle>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.salary }}
          </v-card-subtitle>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.employment }}
          </v-card-subtitle>
        </slot>

        <!-- Skills -->
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

    <!-- Details Modal -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
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
              <base-chips :chips="skillChips" :use-color-mapping="true" />
            </div>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <slot name="modal-actions" :close="closeModal" :result="result">
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
  selectable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'modal-opened',
  'modal-closed',
  'remove-profile',
  'select-employee',
  'add', // Added from old code
])

const showModal = ref(false)
const showConfirmDialog = ref(false)
const isSelected = ref(false)

const skillChips = computed(() => {
  return props.result.skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})

const openModal = () => {
  if (!props.selectable) {
    showModal.value = true
    emit('modal-opened', props.result)
  }
}

const closeModal = () => {
  showModal.value = false
  emit('modal-closed')
}

const handleClick = () => {
  if (props.selectable) {
    toggleSelection(!isSelected.value)
  } else {
    openModal()
  }
}

const toggleSelection = (value) => {
  isSelected.value = value
  emit('select-employee', props.result, value)
}

const confirmRemove = (event) => {
  event.stopPropagation()
  showConfirmDialog.value = true
}

const confirmAndRemove = () => {
  showConfirmDialog.value = false
  emit('remove-profile', props.result.id)
}

// Added from old code
const handleAdd = () => {
  emit('add')
}
</script>

<style scoped>
/* Include all styles from the new code */
</style>
