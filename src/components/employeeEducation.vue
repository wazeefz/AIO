<!-- components/EducationSection.vue -->
<template>
  <div class="education-section">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">
        <v-icon color="#d9c6a5" class="mr-2">mdi-school</v-icon>
        Education
      </h3>
      <v-btn
        color="#d9c6a5"
        variant="text"
        prepend-icon="mdi-plus"
        @click="addEducation"
      >
        Add Education
      </v-btn>
    </div>

    <v-expand-transition group>
      <v-card
        v-for="(edu, index) in modelValue"
        :key="index"
        class="mb-3"
        variant="outlined"
      >
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                {{ edu.degree }}
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
                color="#d9c6a5"
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
    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title style="background-color: #d9c6a5" class="text-white">
          {{ editingIndex === -1 ? 'Add Education' : 'Edit Education' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="editingEducation.degree"
              label="Degree/Certification"
              :rules="[(v) => !!v || 'Degree is required']"
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
            @click="showDialog = false"
            style="border-color: #d9c6a5; color: #d9c6a5"
          >
            Cancel
          </v-btn>
          <v-btn
            color="#d9c6a5"
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
import { ref, reactive } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const form = ref(null)
const showDialog = ref(false)
const isFormValid = ref(false)
const editingIndex = ref(-1)
const editingEducation = reactive({
  degree: '',
  institution: '',
  year: '',
})

const addEducation = () => {
  editingIndex.value = -1
  editingEducation.degree = ''
  editingEducation.institution = ''
  editingEducation.year = ''
  showDialog.value = true
}

const editEducation = (index) => {
  editingIndex.value = index
  const edu = props.modelValue[index]
  editingEducation.degree = edu.degree
  editingEducation.institution = edu.institution
  editingEducation.year = edu.year
  showDialog.value = true
}

const saveEducation = () => {
  if (!isFormValid.value) return

  const newEducation = {
    degree: editingEducation.degree,
    institution: editingEducation.institution,
    year: editingEducation.year,
  }

  const updatedEducation = [...props.modelValue]

  if (editingIndex.value === -1) {
    updatedEducation.push(newEducation)
  } else {
    updatedEducation[editingIndex.value] = newEducation
  }

  emit('update:modelValue', updatedEducation)
  showDialog.value = false
}

const removeEducation = (index) => {
  if (confirm('Are you sure you want to remove this education entry?')) {
    const updatedEducation = props.modelValue.filter((_, i) => i !== index)
    emit('update:modelValue', updatedEducation)
  }
}
</script>

<style>
:root {
  --primary-color: #d9c6a5;
}

/* Education section styles */
.education-section {
  transition: all 0.3s ease;
}

.education-section .v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.education-section .v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

/* Dialog styles */
.education-section .v-dialog .v-card-title {
  padding: 16px;
}

.education-section .v-dialog .v-card-actions {
  padding: 16px;
}

/* Form field styles */
.education-section .v-text-field {
  margin-bottom: 16px;
}

/* Custom styles for focused state */
:deep(.v-field--focused) {
  --v-field-border-color: var(--primary-color) !important;
}

/* Custom styles for buttons */
.education-section .v-btn {
  text-transform: none;
}

:deep(.v-btn--variant-outlined) {
  border-color: var(--primary-color) !important;
  color: var(--primary-color) !important;
}

:deep(.v-btn--variant-text) {
  color: var(--primary-color) !important;
}

/* Custom styles for text fields */
:deep(.v-input--is-focused) {
  --v-field-border-color: var(--primary-color) !important;
}

/* Custom styles for dialog */
:deep(.v-dialog .v-card-title) {
  background-color: var(--primary-color) !important;
}
</style>
