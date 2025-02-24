<template>
  <v-container fluid class="form-container">
    <!-- Header Section -->
    <HeaderSection
      :is-submitting="isSubmitting"
      :is-edit-mode="isEditMode"
      @back="handleBack"
      @submit="handleSubmit"
    />

    <!-- Scroll to top button -->
    <v-btn
      v-show="showScrollButton"
      icon="mdi-arrow-up"
      color="#B1A184"
      size="large"
      class="scroll-to-top"
      @click="scrollToTop"
      elevation="2"
    >
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>

    <v-row>
      <!-- Left Sidebar -->
      <v-col cols="12" md="3">
        <SidebarSection
          v-model="formData"
          :uploaded-cv="uploadedCV"
          :completion-progress="completionProgress"
          @preview="showPreview = true"
          @back="handleBack"
        />
      </v-col>

      <!-- Main Form Content -->
      <v-col cols="12" md="9">
        <h2 class="text-h4 mb-8" style="color: #b1a184">
          {{
            isEditMode ? 'Edit Employee Information' : 'Employee Information'
          }}
        </h2>

        <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
          <PersonalInfoSection
            v-model="formData"
            :rules="rules"
            @update:model-value="updateFormData"
          />

          <LocationSection
            v-model="formData"
            :rules="rules"
            @update:model-value="updateFormData"
          />

          <ProfessionalSummarySection
            v-model="formData"
            :rules="rules"
            @update:model-value="updateFormData"
          />

          <v-card class="mb-4">
            <v-card-text>
              <ExperienceSection
                :model-value="formData.experiences"
                @update:model-value="updateExperiences"
              />
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-text>
              <CertificationSection
                :model-value="formData.certifications"
                @update:model-value="updateCertifications"
              />
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-text>
              <EducationSection
                :model-value="formData.education"
                @update:model-value="updateEducation"
              />
            </v-card-text>
          </v-card>

          <SkillsSection
            :model-value="{ skills: formData.skills }"
            :rules="rules"
            @update:model-value="updateSkills"
          />

          <JobDetailsSection
            v-model="formData"
            :rules="rules"
            @update:model-value="updateFormData"
          />

          <Salary
            v-model="formData"
            :rules="rules"
            @update:model-value="updateFormData"
          />
        </v-form>
      </v-col>
    </v-row>

    <!-- Confirm Back Dialog -->
    <v-dialog v-model="showBackDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Unsaved Changes</v-card-title>
        <v-card-text>
          Are you sure you want to go back? Your progress will be lost.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            color="grey-darken-1"
            @click="showBackDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn variant="text" color="error" @click="confirmBack">
            Go Back
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeaderSection from './HeaderSection.vue'
import SidebarSection from './Sidebar.vue'
import PersonalInfoSection from './PersonalInfo.vue'
import LocationSection from './LocationSection.vue'
import ProfessionalSummarySection from './ProfessionalSummary.vue'
import SkillsSection from './SkillsSection.vue'
import JobDetailsSection from './JobDetails.vue'
import Salary from './SalarySection.vue'
import EducationSection from './EmployeeEducation.vue'
import ExperienceSection from './JobExperience.vue'
import CertificationSection from './ProfessionalCert.vue'

const router = useRouter()

// Form refs and state
const form = ref(null)
const isValid = ref(false)
const isSubmitting = ref(false)
const showScrollButton = ref(false)
const showBackDialog = ref(false)
const isEditMode = ref(false)
const saveTimeout = ref(null)

// Debounce utility
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// Initialize form data
const formData = reactive({
  // Personal Info
  profilePic: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  maritalStatus: '',

  // Location
  currentCountry: '',
  currentCity: '',
  willingToRelocate: false,
  relocationPreferences: [],

  // Professional Summary
  summary: '',
  experience: '',

  // Skills
  skills: [],

  // Arrays for sections
  education: [],
  experiences: [],
  certifications: [],

  // Job Details
  jobTitle: '',
  jobPosition: '',
  department: '',
  employmentType: 'fullTime',
  contractDuration: '',
  employmentRemarks: '',

  // Salary
  salary: '',
})

// Validation rules
const rules = {
  required: (v) => !!v || 'This field is required',
  skills: (v) => {
    if (Array.isArray(v)) {
      return v.length > 0 || 'At least one item is required'
    }
    return !!v || 'This field is required'
  },
  email: (v) => /.+@.+\..+/.test(v) || 'Invalid email format',
  phone: (v) => /^[0-9()+\-\s]{8,}$/.test(v) || 'Invalid phone number',
  age: (v) => (v >= 18 && v <= 100) || 'Age must be between 18 and 100',
  experience: (v) => {
    const age = parseInt(formData.age)
    return v <= age - 18 || 'Experience cannot exceed working years'
  },
  salary: (v) => {
    if (!v) return true
    // Allow numbers with commas and up to 2 decimal places
    const regex = /^[\d,]+(\.\d{0,2})?$/
    return regex.test(v) || 'Invalid salary format'
  },
  dateFormat: (v) => {
    if (!v) return true
    const regex = /^\d{4}\/\d{2}\/\d{2}$/
    if (!regex.test(v)) return 'Use format YYYY/MM/DD'

    const [year, month, day] = v.split('/')
    const date = new Date(year, month - 1, day)

    if (
      date.getFullYear() !== parseInt(year) ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)
    ) {
      return 'Invalid date'
    }

    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() - 18)

    if (date > maxDate) return 'Must be at least 18 years old'
    if (date < new Date('1923-01-01')) return 'Invalid date range'

    return true
  },
}

// Methods for updating form data
const updateFormData = (newData) => {
  Object.assign(formData, newData)
  saveFormData()
}

const updateExperiences = (value) => {
  formData.experiences = [...value]
  saveFormData()
}

const updateCertifications = (value) => {
  formData.certifications = [...value]
  saveFormData()
}

const updateEducation = (value) => {
  formData.education = [...value]
  saveFormData()
}

const updateSkills = (newValue) => {
  if (Array.isArray(newValue.skills)) {
    formData.skills = [...newValue.skills]
    saveFormData()
  }
}

// Save form data with debounce
const saveFormData = debounce(() => {
  try {
    const dataToSave = {
      ...formData,
      experiences: [...formData.experiences],
      certifications: [...formData.certifications],
      education: [...formData.education],
      skills: Array.isArray(formData.skills) ? [...formData.skills] : [],
      relocationPreferences: [...formData.relocationPreferences],
    }
    localStorage.setItem('employeeFormData', JSON.stringify(dataToSave))
    console.log('Form data saved:', dataToSave)
  } catch (error) {
    console.error('Error saving form data:', error)
  }
}, 500)

const completionProgress = computed(() => {
  let total = 0
  let completed = 0

  const requiredFields = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'dateOfBirth',
    'age',
    'gender',
    'maritalStatus',
    'currentCountry',
    'currentCity',
    'salary',
    'jobTitle',
    'jobPosition',
    'employmentType',
  ]

  total += requiredFields.length
  completed += requiredFields.filter((field) => !!formData[field]).length

  // Check arrays and special fields
  const arrayFields = {
    skills: formData.skills,
    education: formData.education,
    experiences: formData.experiences,
    certifications: formData.certifications,
  }

  Object.values(arrayFields).forEach((array) => {
    total++
    if (Array.isArray(array) && array.length > 0) {
      completed++
    }
  })

  // Check profile picture
  if (formData.profilePic) completed++
  total++

  // Check relocation preferences
  if (formData.willingToRelocate) {
    total++
    if (
      Array.isArray(formData.relocationPreferences) &&
      formData.relocationPreferences.length > 0
    ) {
      completed++
    }
  }

  // Check employment type additional fields
  if (formData.employmentType !== 'fullTime') {
    total++
    if (formData.contractDuration) completed++
  }

  return Math.min((completed / total) * 100, 100)
})

// Form handling methods
const validateForm = async () => {
  if (!form.value) return false
  const isFormValid = await form.value.validate()

  // Validate array fields
  const requiredArrays = {
    experiences: 'work experience',
    certifications: 'professional certification',
    education: 'education details',
    skills: 'skills',
  }

  const missingArrays = Object.entries(requiredArrays)
    .filter(([key]) => !formData[key]?.length)
    .map(([, label]) => label)

  if (missingArrays.length > 0) {
    alert(`Please add at least one ${missingArrays.join(', ')}.`)
    return false
  }

  return isFormValid
}

const handleBack = () => {
  if (Object.keys(formData).some((key) => !!formData[key])) {
    showBackDialog.value = true
  } else {
    confirmBack()
  }
}

const confirmBack = () => {
  showBackDialog.value = false
  localStorage.removeItem('employeeFormData')
  router.push('/upload-cv')
}

const scrollToTop = () => {
  const container = document.querySelector('.form-container')
  if (container) {
    container.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

const handleScroll = () => {
  const container = document.querySelector('.form-container')
  if (container) {
    showScrollButton.value = container.scrollTop > 300
  }
}

const handleSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) return

  try {
    isSubmitting.value = true
    console.log('Submitting form data:', formData)

    // Clear saved form data after successful submission
    localStorage.removeItem('employeeFormData')

    router.push('/upload-cv/bulk-employee-info')
  } catch (error) {
    console.error('Form submission error:', error)
    alert('An error occurred while submitting the form. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  const savedData = localStorage.getItem('employeeFormData')
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData)

      // Initialize arrays first
      formData.experiences = Array.isArray(parsedData.experiences)
        ? [...parsedData.experiences]
        : []
      formData.certifications = Array.isArray(parsedData.certifications)
        ? [...parsedData.certifications]
        : []
      formData.education = Array.isArray(parsedData.education)
        ? [...parsedData.education]
        : []
      formData.skills = Array.isArray(parsedData.skills)
        ? [...parsedData.skills]
        : []
      formData.relocationPreferences = Array.isArray(
        parsedData.relocationPreferences
      )
        ? [...parsedData.relocationPreferences]
        : []

      // Then assign other fields
      Object.keys(parsedData).forEach((key) => {
        if (
          ![
            'experiences',
            'certifications',
            'education',
            'skills',
            'relocationPreferences',
          ].includes(key)
        ) {
          formData[key] = parsedData[key]
        }
      })

      console.log('Loaded form data:', formData)
    } catch (error) {
      console.error('Error loading saved form data:', error)
    }
  }

  const container = document.querySelector('.form-container')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})

onBeforeUnmount(() => {
  const container = document.querySelector('.form-container')
  if (container) {
    container.removeEventListener('scroll', handleScroll)
  }
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value)
  }
})
</script>

<style scoped>
.form-container {
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding-bottom: 100px;
  position: relative;
}

.scroll-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
}

.scroll-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Scrollbar styles */
.form-container::-webkit-scrollbar {
  width: 8px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #b1a184;
  border-radius: 4px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #9a8b70;
}

.form-container {
  scrollbar-width: thin;
  scrollbar-color: #b1a184 #f1f1f1;
}

:deep(.v-card) {
  border-radius: 8px;
}

:deep(.v-btn) {
  text-transform: none;
}

@media (max-width: 960px) {
  .fixed-header {
    padding: 12px;
  }
}
</style>
