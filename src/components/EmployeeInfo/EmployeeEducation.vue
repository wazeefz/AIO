<template>
  <div class="education-section">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">
        <v-icon color="#B1A184" class="mr-2">mdi-school</v-icon>
        Education
      </h3>
      <v-btn
        color="#B1A184"
        variant="text"
        prepend-icon="mdi-plus"
        @click="addEducation"
      >
        Add Education
      </v-btn>
    </div>

    <v-expand-transition group>
      <v-card
        v-for="(edu, index) in localEducation"
        :key="index"
        class="mb-3"
        variant="outlined"
      >
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                {{ edu.level }}
                <span v-if="edu.field"> in {{ edu.field }}</span>
              </div>
              <div class="text-subtitle-2 text-grey">
                {{ edu.institution }}
              </div>
              <div class="text-caption">
                {{
                  formatDate(edu.startDate)
                    ? formatDate(edu.startDate) + ' - '
                    : ''
                }}{{ formatDate(edu.endDate) }}
              </div>
            </div>
            <div>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                density="comfortable"
                color="#B1A184"
                @click="editEducation(index)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                density="comfortable"
                @click="removeEducation(index)"
              />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- Education Dialog -->
    <v-dialog v-model="showDialog" max-width="500" persistent>
      <v-card>
        <v-card-title style="background-color: #b1a184" class="text-white">
          {{ editingIndex === -1 ? 'Add Education' : 'Edit Education' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="isFormValid">
            <v-combobox
              v-model="editingEducation.level"
              :items="level"
              label="Qualification Type"
              :rules="[(v) => !!v || 'Qualification type is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-combobox
              v-model="editingEducation.field"
              :items="field"
              label="Field of Study (Optional)"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-text-field
              v-model="editingEducation.institution"
              label="Institution"
              :rules="[(v) => !!v || 'Institution is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <div class="d-flex gap-4">
              <v-text-field
                v-model="editingEducation.startDate"
                label="Start Date (Optional)"
                type="date"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />

              <v-text-field
                v-model="editingEducation.endDate"
                label="End Date"
                type="date"
                :rules="[(v) => !!v || 'End date is required', validateEndDate]"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="closeDialog"
            style="border-color: #b1a184; color: #b1a184"
            :disabled="loading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="#B1A184"
            :disabled="!isFormValid || loading"
            :loading="loading"
            @click="saveEducation"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
    default: () => [],
  },
})

const emit = defineEmits(['update:model-value'])

const form = ref(null)
const showDialog = ref(false)
const isFormValid = ref(false)
const editingIndex = ref(-1)
const loading = ref(false)

// Local state management
const localEducation = ref([...props.modelValue])

const level = [
  "Bachelor's Degree",
  "Master's Degree",
  'Ph.D.',
  'Diploma',
  'High School Diploma',
  "Associate's Degree",
]

const field = [
  'Computer Science',
  'Information Technology',
  'Business Administration',
  'Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Psychology',
  'Education',
  'Arts',
]

const editingEducation = reactive({
  level: '',
  field: '',
  institution: '',
  startDate: '',
  endDate: '',
})

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localEducation.value = [...newValue]
  },
  { deep: true }
)

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const validateEndDate = (v) => {
  if (!v) return 'End date is required'
  if (editingEducation.startDate && v < editingEducation.startDate) {
    return 'End date must be after start date'
  }
  return true
}

const resetForm = () => {
  Object.assign(editingEducation, {
    level: '',
    field: '',
    institution: '',
    startDate: '',
    endDate: '',
  })
  if (form.value) {
    form.value.reset()
  }
  isFormValid.value = false
}

const addEducation = () => {
  editingIndex.value = -1
  resetForm()
  showDialog.value = true
}

const editEducation = (index) => {
  editingIndex.value = index
  const edu = localEducation.value[index]
  Object.assign(editingEducation, { ...edu })
  showDialog.value = true
}

const closeDialog = async () => {
  try {
    showDialog.value = false
    await new Promise((resolve) => setTimeout(resolve, 300))
    resetForm()
  } catch (error) {
    console.error('Error closing dialog:', error)
  }
}

const saveEducation = async () => {
  if (!isFormValid.value || loading.value) return

  try {
    loading.value = true
    const newEducation = { ...editingEducation }
    const updatedEducation = [...localEducation.value]

    if (editingIndex.value === -1) {
      updatedEducation.push(newEducation)
    } else {
      updatedEducation[editingIndex.value] = newEducation
    }

    // Sort education entries by end date in descending order
    updatedEducation.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))

    localEducation.value = updatedEducation
    emit('update:model-value', updatedEducation)
    await closeDialog()
  } catch (error) {
    console.error('Error saving education:', error)
  } finally {
    loading.value = false
  }
}

const removeEducation = (index) => {
  if (confirm('Are you sure you want to remove this education entry?')) {
    const updatedEducation = localEducation.value.filter((_, i) => i !== index)
    localEducation.value = updatedEducation
    emit('update:model-value', updatedEducation)
  }
}

// Cleanup
onBeforeUnmount(() => {
  showDialog.value = false
})
</script>

<style scoped>
:deep(.education-section) {
  transition: all 0.3s ease;
}

:deep(.v-card) {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-dialog .v-card-title) {
  padding: 16px;
}

:deep(.v-dialog .v-card-actions) {
  padding: 16px;
}

:deep(.v-text-field) {
  margin-bottom: 16px;
}

:deep(.v-field--focused) {
  --v-field-border-color: #b1a184 !important;
}

:deep(.v-btn) {
  text-transform: none;
}

:deep(.v-btn--variant-outlined) {
  border-color: #b1a184 !important;
  color: #b1a184 !important;
}

:deep(.v-btn--variant-text) {
  color: #b1a184 !important;
}

:deep(.v-input--is-focused) {
  --v-field-border-color: #b1a184 !important;
}

:deep(.v-dialog .v-card-title) {
  background-color: #b1a184 !important;
}

:deep(.v-combobox) {
  margin-bottom: 16px;
}

.gap-4 {
  gap: 16px;
}

@media (max-width: 600px) {
  .d-flex.gap-4 {
    flex-direction: column;
    gap: 16px;
  }

  :deep(.v-dialog) {
    margin: 16px;
    width: calc(100% - 32px);
  }
}
</style>
