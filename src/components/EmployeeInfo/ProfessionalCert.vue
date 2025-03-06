<template>
  <div class="certification-section">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">
        <v-icon color="#B1A184" class="mr-2">mdi-certificate</v-icon>
        Professional Certifications
      </h3>
      <v-btn
        color="#B1A184"
        variant="text"
        prepend-icon="mdi-plus"
        @click="addCertification"
      >
        Add Certification
      </v-btn>
    </div>

    <v-expand-transition group>
      <v-card
        v-for="(cert, index) in localCertifications"
        :key="index"
        class="mb-3"
        variant="outlined"
      >
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div>
              <div class="text-subtitle-1 font-weight-medium">
                {{ cert.name }}
              </div>
              <div class="text-subtitle-2 text-grey">
                {{ cert.issuingOrganization }}
              </div>
              <div class="text-caption">
                Issued: {{ formatDate(cert.issueDate) }} |
                {{
                  cert.expiryDate
                    ? `Expires: ${formatDate(cert.expiryDate)}`
                    : 'No Expiration'
                }}
              </div>
              <div class="text-caption" v-if="cert.credentialId">
                Credential ID: {{ cert.credentialId }}
              </div>
            </div>
            <div>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                density="comfortable"
                color="#B1A184"
                @click="editCertification(index)"
              />
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                density="comfortable"
                @click="removeCertification(index)"
              />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-expand-transition>

    <!-- Certification Dialog -->
    <v-dialog v-model="showDialog" max-width="500" persistent>
      <v-card>
        <v-card-title style="background-color: #b1a184" class="text-white">
          {{ editingIndex === -1 ? 'Add Certification' : 'Edit Certification' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="isFormValid">
            <v-text-field
              v-model="editingCertification.name"
              label="Certification Name"
              :rules="[(v) => !!v || 'Certification name is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-text-field
              v-model="editingCertification.issuingOrganization"
              label="Issuing Organization"
              :rules="[(v) => !!v || 'Issuing organization is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-text-field
              v-model="editingCertification.credentialId"
              label="Credential ID (Optional)"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-text-field
              v-model="editingCertification.issueDate"
              label="Issue Date"
              type="date"
              :rules="[(v) => !!v || 'Issue date is required']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            />

            <v-checkbox
              v-model="editingCertification.hasExpiry"
              label="Has Expiration Date"
              color="#B1A184"
              hide-details
              class="mb-4"
            />

            <v-text-field
              v-if="editingCertification.hasExpiry"
              v-model="editingCertification.expiryDate"
              label="Expiry Date"
              type="date"
              :rules="[
                (v) =>
                  !editingCertification.hasExpiry ||
                  !!v ||
                  'Expiry date is required',
                validateExpiryDate,
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
            @click="saveCertification"
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
const localCertifications = ref([...props.modelValue])

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localCertifications.value = [...newValue]
  },
  { deep: true }
)

const editingCertification = reactive({
  name: '',
  issuingOrganization: '',
  credentialId: '',
  issueDate: '',
  hasExpiry: false,
  expiryDate: '',
})

// Watch for hasExpiry changes
watch(
  () => editingCertification.hasExpiry,
  (newValue) => {
    if (!newValue) {
      editingCertification.expiryDate = ''
    }
  }
)

const resetForm = () => {
  Object.assign(editingCertification, {
    name: '',
    issuingOrganization: '',
    credentialId: '',
    issueDate: '',
    hasExpiry: false,
    expiryDate: '',
  })
  if (form.value) {
    form.value.reset()
  }
  isFormValid.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const validateExpiryDate = (v) => {
  if (!editingCertification.hasExpiry || !v) return true
  return (
    v > editingCertification.issueDate || 'Expiry date must be after issue date'
  )
}

const addCertification = () => {
  editingIndex.value = -1
  resetForm()
  showDialog.value = true
}

const editCertification = (index) => {
  editingIndex.value = index
  const cert = localCertifications.value[index]
  Object.assign(editingCertification, {
    name: cert.name,
    issuingOrganization: cert.issuingOrganization,
    credentialId: cert.credentialId || '',
    issueDate: cert.issueDate,
    hasExpiry: !!cert.expiryDate,
    expiryDate: cert.expiryDate || '',
  })
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  resetForm()
}

const saveCertification = () => {
  if (!isFormValid.value) return

  const newCertification = {
    name: editingCertification.name,
    issuingOrganization: editingCertification.issuingOrganization,
    credentialId: editingCertification.credentialId || null,
    issueDate: editingCertification.issueDate,
    expiryDate: editingCertification.hasExpiry
      ? editingCertification.expiryDate
      : null,
    // Add these fields for backend compatibility
    issuing_organization: editingCertification.issuingOrganization,
    credential_id: editingCertification.credentialId || null,
    issue_date: editingCertification.issueDate,
    expiry_date: editingCertification.hasExpiry
      ? editingCertification.expiryDate
      : null,
  }

  const updatedCertifications = [...localCertifications.value]

  if (editingIndex.value === -1) {
    updatedCertifications.push(newCertification)
  } else {
    updatedCertifications[editingIndex.value] = newCertification
  }

  localCertifications.value = updatedCertifications
  emit('update:model-value', updatedCertifications)
  closeDialog()
}

const removeCertification = (index) => {
  if (confirm('Are you sure you want to remove this certification?')) {
    const updatedCertifications = localCertifications.value.filter(
      (_, i) => i !== index
    )
    localCertifications.value = updatedCertifications
    emit('update:model-value', updatedCertifications)
  }
}
</script>

<style scoped>
:deep(.certification-section) {
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

:deep(
    .v-checkbox
      .v-selection-control__input:hover
      > .v-selection-control__wrapper
  ) {
  background: rgba(177, 161, 132, 0.04);
}

:deep(
    .v-checkbox
      .v-selection-control__input
      > .v-selection-control__wrapper.v-selection-control__wrapper--active
  ) {
  color: #b1a184 !important;
}
</style>
