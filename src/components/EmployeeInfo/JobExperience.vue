<template>
  <div class="experience-section">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">
        <v-icon color="#B1A184" class="mr-2">mdi-briefcase</v-icon>
        Professional Experience
      </h3>
      <v-btn
        color="#B1A184"
        variant="text"
        prepend-icon="mdi-plus"
        @click="addExperience"
      >
        Add Experience
      </v-btn>
    </div>

    <v-expand-transition group>
      <v-card
        v-for="(exp, index) in localExperiences"
        :key="index"
        class="mb-3"
        variant="outlined"
      >
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                {{ exp.position }}
              </div>
              <div class="text-subtitle-2 text-grey">
                {{ exp.company }} • {{ exp.employmentType }}
              </div>
              <div class="text-caption">
                {{ exp.location }} • {{ formatDate(exp.startDate) }} -
                {{
                  exp.endDate === 'Present'
                    ? 'Present'
                    : formatDate(exp.endDate)
                }}
              </div>
              <div v-if="exp.description" class="text-body-2 mt-2">
                {{ exp.description }}
              </div>
              <div v-if="exp.achievements" class="text-body-2 mt-2">
                <strong>Key Achievements:</strong>
                <div>{{ exp.achievements }}</div>
              </div>
            </div>
            <div>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                density="comfortable"
                color="#B1A184"
                @click="editExperience(index)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                density="comfortable"
                @click="removeExperience(index)"
              />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- Experience Dialog -->
    <v-dialog v-model="showDialog" max-width="600" persistent>
      <v-card>
        <v-card-title style="background-color: #b1a184" class="text-white">
          {{ editingIndex === -1 ? 'Add Experience' : 'Edit Experience' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="editingExperience.position"
              label="Position"
              :rules="[(v) => !!v || 'Position is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-text-field
              v-model="editingExperience.company"
              label="Company"
              :rules="[(v) => !!v || 'Company is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-select
              v-model="editingExperience.employmentType"
              :items="employmentTypes"
              label="Employment Type"
              :rules="[(v) => !!v || 'Employment type is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-text-field
              v-model="editingExperience.location"
              label="Location"
              :rules="[(v) => !!v || 'Location is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <div class="d-flex gap-4">
              <v-text-field
                v-model="editingExperience.startDate"
                label="Start Date"
                type="date"
                :rules="[(v) => !!v || 'Start date is required']"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />

              <v-text-field
                v-model="editingExperience.endDate"
                label="End Date"
                type="date"
                variant="outlined"
                density="comfortable"
                :rules="[(v) => !!v || 'End date is required', validateEndDate]"
                class="mb-4"
              />
            </div>

            <v-textarea
              v-model="editingExperience.description"
              label="Description (Optional)"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-4"
            />

            <v-textarea
              v-model="editingExperience.achievements"
              label="Key Achievements (Optional)"
              variant="outlined"
              density="comfortable"
              rows="3"
            />
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
            @click="saveExperience"
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
const localExperiences = ref([...props.modelValue])

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Freelance',
]

const editingExperience = reactive({
  position: '',
  company: '',
  employmentType: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  achievements: '',
})

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localExperiences.value = [...newValue]
  },
  { deep: true }
)

const resetForm = () => {
  Object.assign(editingExperience, {
    position: '',
    company: '',
    employmentType: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    achievements: '',
  })
  if (form.value) {
    form.value.reset()
  }
  isFormValid.value = false
}

const addExperience = () => {
  editingIndex.value = -1
  resetForm()
  showDialog.value = true
}

const editExperience = (index) => {
  editingIndex.value = index
  const exp = localExperiences.value[index]
  Object.assign(editingExperience, { ...exp })
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

const saveExperience = async () => {
  if (!isFormValid.value || loading.value) return

  try {
    loading.value = true
    const newExperience = { ...editingExperience }
    const updatedExperiences = [...localExperiences.value]

    if (editingIndex.value === -1) {
      updatedExperiences.push(newExperience)
    } else {
      updatedExperiences[editingIndex.value] = newExperience
    }

    localExperiences.value = updatedExperiences
    emit('update:model-value', updatedExperiences)
    await closeDialog()
  } catch (error) {
    console.error('Error saving experience:', error)
  } finally {
    loading.value = false
  }
}

const removeExperience = (index) => {
  if (confirm('Are you sure you want to remove this experience entry?')) {
    const updatedExperiences = localExperiences.value.filter(
      (_, i) => i !== index
    )
    localExperiences.value = updatedExperiences
    emit('update:model-value', updatedExperiences)
  }
}

const formatDate = (dateString) => {
  if (!dateString || dateString === 'Present') return dateString
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
  return v > editingExperience.startDate || 'End date must be after start date'
}

// Cleanup
onBeforeUnmount(() => {
  showDialog.value = false
})
</script>

<style scoped>
:deep(.experience-section) {
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

:deep(.v-select) {
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
