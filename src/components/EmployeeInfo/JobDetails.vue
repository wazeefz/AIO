<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 px-4 pt-4">
      <v-icon color="#B1A184" class="mr-2">mdi-briefcase-outline</v-icon>
      Job Details
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.jobTitle"
            @update:model-value="updateFormData('jobTitle', $event)"
            label="Job Title"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-card-account-details-outline</v-icon>
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="localFormData.jobPosition"
            @update:model-value="updateFormData('jobPosition', $event)"
            :items="positionLevels"
            label="Position Level"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-stairs</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="localFormData.department"
            @update:model-value="updateFormData('department', $event)"
            :items="departments"
            label="Department"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-domain</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.hireDate"
            @update:model-value="updateFormData('hireDate', $event)"
            label="Hire Date"
            type="date"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-calendar-check</v-icon>
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="localFormData.availabilityStatus"
            @update:model-value="updateFormData('availabilityStatus', $event)"
            :items="availabilityStatuses"
            label="Availability Status"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-clock-outline</v-icon>
            </template>
          </v-select>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <h3 class="text-subtitle-1 mb-4">
        <v-icon color="#B1A184" class="mr-2">mdi-briefcase-clock</v-icon>
        Employment Type
      </h3>

      <v-radio-group
        v-model="displayEmploymentType"
        @update:model-value="updateEmploymentType"
        mandatory
        class="mb-4"
      >
        <v-radio label="Full Time" value="fullTime"></v-radio>
        <v-radio label="Part Time" value="partTime"></v-radio>
        <v-radio label="Contract" value="contract"></v-radio>
      </v-radio-group>

      <!-- Duration field only for part-time and contract -->
      <v-expand-transition>
        <div v-if="displayEmploymentType !== 'fullTime'">
          <v-text-field
            v-model="localFormData.contractDuration"
            @update:model-value="updateFormData('contractDuration', $event)"
            :label="getDurationLabel"
            type="number"
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || `${getDurationLabel} is required`]"
            class="mb-4"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-calendar-clock</v-icon>
            </template>
          </v-text-field>
        </div>
      </v-expand-transition>

      <!-- Career preferences field -->
      <v-textarea
        v-model="localFormData.careerPreferences"
        @update:model-value="updateFormData('careerPreferences', $event)"
        label="Career Preferences"
        variant="outlined"
        density="comfortable"
        rows="3"
        class="mt-3"
        hint="Add any information about career goals and preferences"
        persistent-hint
      ></v-textarea>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      jobTitle: '',
      jobPosition: '',
      department: '',
      hireDate: '',
      employmentType: 'fullTime',
      contractDuration: '',
      availabilityStatus: '',
      careerPreferences: '',
    }),
  },
  rules: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:model-value'])

const positionLevels = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive',
]

const departments = [
  'Construction',
  'Engineering',
  'Infrastructure',
  'Gamuda Excellence Transformation',
  'Design & Innovation',
  'Project Management',
  'Sustainability',
  'Quality Assurance',
  'Safety & Compliance',
  'R&D',
]

const availabilityStatuses = [
  'Available',
  'Partially Available',
  'Unavailable',
  'On Leave',
  'On Project',
]

// Employment type mapping constants
const EMPLOYMENT_TYPE_MAP = {
  fullTime: 'Full Time',
  partTime: 'Part Time',
  contract: 'Contract',
}

const EMPLOYMENT_TYPE_MAP_REVERSE = {
  'Full Time': 'fullTime',
  'Part Time': 'partTime',
  Contract: 'contract',
}

// Local form data
const localFormData = ref({
  jobTitle: '',
  jobPosition: '',
  department: '',
  hireDate: '',
  employmentType: 'Full Time', // Store backend format
  contractDuration: '',
  availabilityStatus: '',
  careerPreferences: '',
})

// Display value for employment type (frontend format)
const displayEmploymentType = ref('fullTime')

// Convert backend format to frontend format for display
const updateDisplayEmploymentType = () => {
  displayEmploymentType.value =
    EMPLOYMENT_TYPE_MAP_REVERSE[localFormData.value.employmentType] ||
    'fullTime'
}

// Update employment type from radio buttons
const updateEmploymentType = (value) => {
  // Update display value
  displayEmploymentType.value = value

  // Update local form data with backend format
  const backendFormat = EMPLOYMENT_TYPE_MAP[value] || 'Full Time'
  localFormData.value.employmentType = backendFormat

  // Clear contract duration if switching to full time
  if (value === 'fullTime') {
    localFormData.value.contractDuration = ''
  }

  // Force emit update for all fields
  const dataToEmit = JSON.parse(JSON.stringify(localFormData.value))

  // Add a timestamp to ensure the parent component detects a change
  dataToEmit._timestamp = Date.now()

  // Emit update immediately
  console.log(
    'Emitting employment type update with data:',
    JSON.stringify(dataToEmit)
  )
  emit('update:model-value', dataToEmit)
}

// Initialize component
onMounted(() => {
  // Initialize display employment type from props
  updateDisplayEmploymentType()
  console.log(
    'JobDetails mounted with employment type:',
    localFormData.value.employmentType
  )
})

// Watch for external changes
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) return

    console.log('JobDetails received new props:', newVal)

    // Only update if values are actually different
    const newFormData = {
      jobTitle: newVal.jobTitle || '',
      jobPosition: newVal.jobPosition || '',
      department: newVal.department || '',
      hireDate: newVal.hireDate || '',
      employmentType: newVal.employmentType || 'Full Time',
      contractDuration: newVal.contractDuration || '',
      availabilityStatus: newVal.availabilityStatus || '',
      careerPreferences: newVal.careerPreferences || '',
    }

    // Deep compare current and new values
    const hasChanges = Object.keys(newFormData).some((key) => {
      const currentVal = localFormData.value[key]
      const newVal = newFormData[key]
      return JSON.stringify(currentVal) !== JSON.stringify(newVal)
    })

    if (hasChanges) {
      console.log('JobDetails updating local form data:', newFormData)
      Object.assign(localFormData.value, newFormData)
      // Update display employment type
      updateDisplayEmploymentType()
    }
  },
  { immediate: true, deep: true }
)

const updateFormData = (field, value) => {
  // Update local value
  localFormData.value[field] = value

  // Log the update for debugging
  console.log(`JobDetails updating ${field}:`, value)
  console.log('Current localFormData:', JSON.stringify(localFormData.value))

  // Force emit update for all fields
  const dataToEmit = JSON.parse(JSON.stringify(localFormData.value))

  // Add a timestamp to ensure the parent component detects a change
  dataToEmit._timestamp = Date.now()

  // Emit update immediately without debounce
  console.log('Emitting update with data:', JSON.stringify(dataToEmit))
  emit('update:model-value', dataToEmit)
}

// Cleanup
onBeforeUnmount(() => {
  if (updateFormData.timeout) {
    clearTimeout(updateFormData.timeout)
  }
})

// Define the computed property properly
const getDurationLabel = computed(() => {
  if (!displayEmploymentType.value) return 'Duration (months)'
  return displayEmploymentType.value === 'contract'
    ? 'Contract Duration (months)'
    : 'Part Time Duration (months)'
})
</script>

<style scoped>
:deep(.v-radio) {
  margin-bottom: 8px;
}

:deep(.v-radio-group) {
  margin-top: -8px;
}

.text-subtitle-1 {
  display: flex;
  align-items: center;
  color: var(--v-theme-on-surface);
}

:deep(.v-field--focused) {
  --v-field-border-color: #b1a184 !important;
}

:deep(.v-input--is-focused) {
  --v-field-border-color: #b1a184 !important;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-textarea .v-field__input) {
  min-height: 80px !important;
}

:deep(.v-select__selection) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
