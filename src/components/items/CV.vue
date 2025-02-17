<template>
  <!-- CV Preview -->
  <v-expansion-panels class="cv-preview-panel mt-6">
    <v-expansion-panel>
      <v-expansion-panel-title>
        <v-row no-gutters>
          <v-col cols="2">
            <v-icon icon="mdi-file-document" color="#d9c6a5"></v-icon>
          </v-col>
          <v-col cols="10">Uploaded CV</v-col>
        </v-row>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div v-if="cvData" class="mb-3">
          <div class="d-flex align-center mb-2">
            <v-icon
              :icon="
                cvData.fileName.endsWith('.pdf')
                  ? 'mdi-file-pdf-box'
                  : 'mdi-file-document'
              "
              color="#d9c6a5"
              class="mr-2"
            ></v-icon>
            <div>
              <div class="text-subtitle-2">
                {{ cvData.fileName }}
              </div>
              <div class="text-caption text-grey">
                {{ formatFileSize(cvData.fileSize) }}
              </div>
            </div>
          </div>
          <v-btn
            block
            variant="outlined"
            prepend-icon="mdi-eye"
            @click="previewCV"
            class="mb-2"
          >
            Preview CV
          </v-btn>
          <v-btn
            block
            variant="outlined"
            color="#d9c6a5"
            prepend-icon="mdi-upload"
            @click="goBack"
          >
            Upload Different CV
          </v-btn>
        </div>
        <div v-else>
          <v-btn
            block
            variant="outlined"
            color="#d9c6a5"
            prepend-icon="mdi-upload"
            @click="goBack"
          >
            Upload CV First
          </v-btn>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
  <!-- CV Preview Dialog -->
  <v-dialog v-model="showCVPreview" max-width="800">
    <v-card>
      <v-toolbar color="#d9c6a5">
        <v-toolbar-title class="text-white">CV Preview</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="showCVPreview = false"
        ></v-btn>
      </v-toolbar>
      <v-card-text class="pa-0">
        <iframe
          v-if="cvPreviewUrl"
          :src="cvPreviewUrl"
          class="cv-preview-frame"
          frameborder="0"
        ></iframe>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import ProfilePictureEditor from '@/components/profilePictureEditor'
import EducationSection from '@/components/employeeEducation'
import CV from './CV.vue'

// Form refs
const employeeForm = ref(null)

// Dialog states
const showSuccessDialog = ref(false)
const showCVPreview = ref(false)

// Form states
const isFormValid = ref(false)
const isSubmitting = ref(false)

// CV handling
const cvData = ref(null)
const cvPreviewUrl = ref(null)

// Employee data
const employeeData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  employmentType: 'fullTime',
  contractDuration: '',
  employmentRemarks: '',
  bio: '',
  profilePicture: null,
  skills: [],
  education: [],
})

// Options
const departments = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
]

const suggestedSkills = [
  'JavaScript',
  'Python',
  'React',
  'Vue.js',
  'Project Management',
  'Marketing',
  'Sales',
  'Communication',
  'Leadership',
]

// Validation Rules
const nameRules = [
  (v) => !!v || 'Name is required',
  (v) => v?.length <= 50 || 'Name must be less than 50 characters',
]

const emailRules = [
  (v) => !!v || 'Email is required',
  (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const phoneRules = [
  (v) => !v || /^\+?[\d\s-]+$/.test(v) || 'Phone number must be valid',
]

// Computed Properties
const completionProgress = computed(() => {
  let total = 0
  let completed = 0

  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'position',
    'department',
    'employmentType',
    'bio',
  ]
  total += requiredFields.length
  completed += requiredFields.filter((field) => !!employeeData[field]).length

  if (employeeData.employmentType !== 'fullTime') {
    total++
    if (employeeData.contractDuration) completed++
  }

  if (employeeData.profilePicture) completed++
  if (employeeData.skills.length > 0) completed++
  if (employeeData.education.length > 0) completed++
  total += 4

  return (completed / total) * 100
})

const getDurationLabel = computed(() => {
  return employeeData.employmentType === 'contract'
    ? 'Contract Duration (months)'
    : 'Part Time Duration (months)'
})

// Lifecycle Hooks
onMounted(() => {
  // Load CV data from localStorage
  const storedCVData = localStorage.getItem('cvData')
  const storedPreviewUrl = localStorage.getItem('cvPreviewUrl')

  if (storedCVData && storedPreviewUrl) {
    cvData.value = JSON.parse(storedCVData)
    cvPreviewUrl.value = storedPreviewUrl
  }
})

onBeforeUnmount(() => {
  if (cvPreviewUrl.value) {
    URL.revokeObjectURL(cvPreviewUrl.value)
  }
})

// Methods
const handleProfilePicChange = (file) => {
  employeeData.profilePicture = file
}

const previewCV = () => {
  if (cvPreviewUrl.value) {
    showCVPreview.value = true
  }
}

const goBack = () => {
  if (
    confirm(
      'Are you sure you want to upload a different CV? Your current progress will be lost.'
    )
  ) {
    localStorage.removeItem('cvData')
    localStorage.removeItem('cvPreviewUrl')
    window.location.href = '/upload-cv'
  }
}

const submitForm = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  try {
    const formData = new FormData()

    // Append all employee data to formData
    Object.entries(employeeData).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value, value.name)
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (value !== null && value !== undefined) {
        formData.append(key, value)
      }
    })

    // Append CV data if available
    if (cvData.value) {
      formData.append('cvFileName', cvData.value.fileName)
      formData.append('cvFileSize', cvData.value.fileSize)
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('Submitting employee data:', formData)
    showSuccessDialog.value = true
  } catch (error) {
    console.error('Failed to submit form:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleComplete = () => {
  showSuccessDialog.value = false
  localStorage.removeItem('cvData')
  localStorage.removeItem('cvPreviewUrl')
  window.location.href = '/'
}

// Utility Functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
</script>
