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
                {{ exp.company }}
              </div>
              <div class="text-caption">{{ exp.duration }}</div>
              <div class="text-body-2 mt-2">{{ exp.responsibilities }}</div>
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
    <v-dialog v-model="showDialog" max-width="500" persistent>
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

            <v-text-field
              v-model="editingExperience.duration"
              label="Duration (e.g., Jan 2020 - Present)"
              :rules="[(v) => !!v || 'Duration is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-textarea
              v-model="editingExperience.responsibilities"
              label="Responsibilities"
              :rules="[(v) => !!v || 'Responsibilities are required']"
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
          >
            Cancel
          </v-btn>
          <v-btn
            color="#B1A184"
            :disabled="!isFormValid"
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
import { ref, reactive, computed, watch } from 'vue'

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
const localExperiences = ref([...props.modelValue])

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localExperiences.value = [...newValue]
  },
  { deep: true }
)

const editingExperience = reactive({
  position: '',
  company: '',
  duration: '',
  responsibilities: '',
})

const resetForm = () => {
  Object.assign(editingExperience, {
    position: '',
    company: '',
    duration: '',
    responsibilities: '',
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

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const saveExperience = () => {
  if (!isFormValid.value) return

  const newExperience = { ...editingExperience }
  const updatedExperiences = [...localExperiences.value]

  if (editingIndex.value === -1) {
    updatedExperiences.push(newExperience)
  } else {
    updatedExperiences[editingIndex.value] = newExperience
  }

  localExperiences.value = updatedExperiences
  emit('update:model-value', updatedExperiences)
  closeDialog()
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
</style>
