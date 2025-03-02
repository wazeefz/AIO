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

        <!-- Add Join Date field -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.joinDate"
            @update:model-value="updateFormData('joinDate', $event)"
            label="Join Date"
            type="date"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-calendar</v-icon>
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <v-divider class="my-4"></v-divider>

      <h3 class="text-subtitle-1 mb-4">
        <v-icon color="#B1A184" class="mr-2">mdi-briefcase-clock</v-icon>
        Employment Type
      </h3>

      <v-radio-group
        v-model="localFormData.employmentType"
        @update:model-value="updateFormData('employmentType', $event)"
        mandatory
        class="mb-4"
      >
        <v-radio label="Full Time" value="fullTime"></v-radio>
        <v-radio label="Part Time" value="partTime"></v-radio>
        <v-radio label="Contract" value="contract"></v-radio>
      </v-radio-group>

      <!-- Duration field only for part-time and contract -->
      <v-expand-transition>
        <div v-if="localFormData.employmentType !== 'fullTime'">
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

      <!-- Remarks field for all employment types -->
      <v-textarea
        v-model="localFormData.employmentRemarks"
        @update:model-value="updateFormData('employmentRemarks', $event)"
        label="Remarks/Career Preference (Optional)"
        variant="outlined"
        density="comfortable"
        rows="2"
        class="mt-3"
        hint="Add any additional information about the employment arrangement"
        persistent-hint
      ></v-textarea>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      jobTitle: '',
      jobPosition: '',
      department: '',
      joinDate: '',
      employmentType: 'fullTime',
      contractDuration: '',
      employmentRemarks: '',
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

// Local form data
const localFormData = ref({
  jobTitle: '',
  jobPosition: '',
  department: '',
  joinDate: '',
  employmentType: 'fullTime',
  contractDuration: '',
  employmentRemarks: '',
})

// Watch for external changes
watch(
  () => props.modelValue,
  (newVal) => {
    localFormData.value = {
      jobTitle: newVal.jobTitle || '',
      jobPosition: newVal.jobPosition || '',
      department: newVal.department || '',
      joinDate: newVal.joinDate || '',
      employmentType: newVal.employmentType || 'fullTime',
      contractDuration: newVal.contractDuration || '',
      employmentRemarks: newVal.employmentRemarks || '',
    }
  },
  { immediate: true, deep: true }
)

const updateFormData = (field, value) => {
  localFormData.value[field] = value

  // Only clear duration when switching to full time
  if (field === 'employmentType' && value === 'fullTime') {
    localFormData.value.contractDuration = ''
  }

  emit('update:model-value', {
    ...props.modelValue,
    ...localFormData.value,
  })
}

const getDurationLabel = computed(() => {
  return localFormData.value.employmentType === 'contract'
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
