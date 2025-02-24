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
                {{ edu.education }}
              </div>
              <div class="text-subtitle-2 text-grey">
                {{ edu.institution }}
              </div>
              <div class="text-caption">{{ edu.year }}</div>
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
            <v-text-field
              v-model="editingEducation.education"
              label="Education/Certification"
              :rules="[(v) => !!v || 'Education Type is required']"
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

            <v-text-field
              v-model="editingEducation.year"
              label="Year"
              type="number"
              :rules="[
                (v) => !!v || 'Year is required',
                (v) => (v && v <= new Date().getFullYear()) || 'Invalid year',
                (v) => (v && v >= 1950) || 'Year must be after 1950',
              ]"
              variant="outlined"
              density="comfortable"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="closeDialog"
            style="border-color: #b1a184; color: #b1a184"
          >
            Cancel
          </v-btn>
          <v-btn
            color="#B1A184"
            :disabled="!isFormValid"
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
import { ref, reactive, watch } from 'vue'

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

// Local state management
const localEducation = ref([...props.modelValue])

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localEducation.value = [...newValue]
  },
  { deep: true }
)

const editingEducation = reactive({
  education: '',
  institution: '',
  year: '',
})

const resetForm = () => {
  Object.assign(editingEducation, {
    education: '',
    institution: '',
    year: '',
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

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const saveEducation = () => {
  if (!isFormValid.value) return

  const newEducation = { ...editingEducation }
  const updatedEducation = [...localEducation.value]

  if (editingIndex.value === -1) {
    updatedEducation.push(newEducation)
  } else {
    updatedEducation[editingIndex.value] = newEducation
  }

  // Sort education entries by year in descending order
  updatedEducation.sort((a, b) => b.year - a.year)

  localEducation.value = updatedEducation
  emit('update:model-value', updatedEducation)
  closeDialog()
}

const removeEducation = (index) => {
  if (confirm('Are you sure you want to remove this education entry?')) {
    const updatedEducation = localEducation.value.filter((_, i) => i !== index)
    localEducation.value = updatedEducation
    emit('update:model-value', updatedEducation)
  }
}
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
</style>
