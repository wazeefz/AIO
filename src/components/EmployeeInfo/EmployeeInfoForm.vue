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
        <v-card class="sidebar-card" elevation="2">
          <SidebarSection
            v-model="formData"
            :uploaded-cv="uploadedCV"
            :completion-progress="completionProgress"
            :sections="sections"
            :expanded-panels="expandedPanels"
            @preview="showPreview = true"
            @back="handleBack"
            @expand-all="expandAll"
            @collapse-all="collapseAll"
            @section-click="scrollToSection"
          />
        </v-card>
      </v-col>
      <!-- Main Form Content -->
      <v-col cols="12" md="9">
        <h2 class="text-h4 mb-8" style="color: #b1a184">
          {{
            isEditMode ? 'Edit Employee Information' : 'Employee Information'
          }}
        </h2>

        <v-form ref="form" v-model="isValid" @submit.prevent="handleSubmit">
          <v-expansion-panels v-model="expandedPanels.personalInfo">
            <v-expansion-panel>
              <v-expansion-panel-title
                >Personal Information</v-expansion-panel-title
              >
              <v-expansion-panel-text>
                <PersonalInfoSection
                  v-model="formData"
                  :rules="rules"
                  @update:model-value="updateFormData"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.location">
            <v-expansion-panel>
              <v-expansion-panel-title>Location</v-expansion-panel-title>
              <v-expansion-panel-text>
                <LocationSection
                  v-model="formData"
                  :rules="rules"
                  @update:model-value="updateFormData"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.professionalSummary">
            <v-expansion-panel>
              <v-expansion-panel-title
                >Professional Summary</v-expansion-panel-title
              >
              <v-expansion-panel-text>
                <ProfessionalSummarySection
                  v-model="formData"
                  :rules="rules"
                  @update:model-value="updateFormData"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.experience">
            <v-expansion-panel>
              <v-expansion-panel-title>Experience</v-expansion-panel-title>
              <v-expansion-panel-text>
                <ExperienceSection
                  :model-value="formData.experiences"
                  @update:model-value="updateExperiences"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.certification">
            <v-expansion-panel>
              <v-expansion-panel-title>Certification</v-expansion-panel-title>
              <v-expansion-panel-text>
                <CertificationSection
                  :model-value="formData.certifications"
                  @update:model-value="updateCertifications"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.education">
            <v-expansion-panel>
              <v-expansion-panel-title>Education</v-expansion-panel-title>
              <v-expansion-panel-text>
                <EducationSection
                  :model-value="formData.education"
                  @update:model-value="updateEducation"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.skills">
            <v-expansion-panel>
              <v-expansion-panel-title>Skills</v-expansion-panel-title>
              <v-expansion-panel-text>
                <SkillsSection
                  :model-value="{
                    skills: formData.skills,
                    skillDetails: formData.skillDetails,
                  }"
                  :rules="rules"
                  @update:model-value="updateSkills"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.jobDetails">
            <v-expansion-panel>
              <v-expansion-panel-title>Job Details</v-expansion-panel-title>
              <v-expansion-panel-text>
                <JobDetailsSection
                  v-model="formData"
                  :rules="rules"
                  @update:model-value="updateFormData"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.salary">
            <v-expansion-panel>
              <v-expansion-panel-title>Salary</v-expansion-panel-title>
              <v-expansion-panel-text>
                <Salary
                  v-model="formData"
                  :rules="rules"
                  @update:model-value="updateFormData"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.assessment">
            <v-expansion-panel>
              <v-expansion-panel-title>Assessment</v-expansion-panel-title>
              <v-expansion-panel-text>
                <Assessment
                  v-model="formData.assessment"
                  @update:modelValue="updateAssessment"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
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
import Assessment from './Assessment.vue'
import { useResumeStore } from '@/stores/resume'

const router = useRouter()
const resumeStore = useResumeStore()

const storedResume = resumeStore.getResumeData()

console.log('Stored Resume:', storedResume)

// Form refs and state
const form = ref(null)
const isValid = ref(false)
const isSubmitting = ref(false)
const showScrollButton = ref(false)
const showBackDialog = ref(false)
const isEditMode = ref(false)
const saveTimeout = ref(null)
const showPreview = ref(false)

// Initialize form data
const formData = reactive({
  // Personal Info
  profilePic: storedResume?.profilePic,
  firstName: storedResume?.firstName,
  lastName: storedResume?.lastName,
  email: storedResume?.email,
  phone: storedResume?.phone,
  dateOfBirth: storedResume?.dateOfBirth,
  age: storedResume?.age,
  gender: storedResume?.gender,
  maritalStatus: storedResume?.maritalStatus,

  // Location
  currentCountry: storedResume?.currentCountry,
  currentCity: storedResume?.currentCity,
  willingToRelocate: storedResume?.willingToRelocate,
  relocationPreferences: storedResume?.relocationPreferences,

  // Professional Summary
  summary: storedResume?.summary,
  experience: storedResume?.experience,

  // Skills
  skills: storedResume?.skills,
  skillDetails: storedResume?.skillDetails || {},

  // Arrays for sections
  education: storedResume?.education,
  experiences: storedResume?.experiences,
  certifications: storedResume?.certifications,

  // Job Details
  jobTitle: storedResume?.jobTitle,
  jobPosition: storedResume?.jobPosition,
  department: storedResume?.department,
  employmentType: storedResume?.employmentType,
  contractDuration: storedResume?.contractDuration,
  hireDate: storedResume?.hireDate,
  availabilityStatus: storedResume?.availabilityStatus,
  careerPreferences: storedResume?.careerPreferences,

  // Salary
  salary: storedResume?.salary,

  // Assessment
  assessment: {
    interview: [
      { rating: 0 }, // Technical Skills
      { rating: 0 }, // Soft Skills
    ],
    interviewRemarks: '',
    projects: [],
  },
})

// Section configuration
const sections = [
  { title: 'Personal Information', value: 'personalInfo', icon: 'mdi-account' },
  { title: 'Location', value: 'location', icon: 'mdi-map-marker' },
  {
    title: 'Professional Summary',
    value: 'professionalSummary',
    icon: 'mdi-text-box',
  },
  { title: 'Experience', value: 'experience', icon: 'mdi-briefcase' },
  { title: 'Certification', value: 'certification', icon: 'mdi-certificate' },
  { title: 'Education', value: 'education', icon: 'mdi-school' },
  { title: 'Skills', value: 'skills', icon: 'mdi-lightning-bolt' },
  {
    title: 'Job Details',
    value: 'jobDetails',
    icon: 'mdi-card-account-details',
  },
  { title: 'Salary', value: 'salary', icon: 'mdi-currency-usd' },
  { title: 'Assessment', value: 'assessment', icon: 'mdi-account-star' },
]

// Initialize expanded panels state
const expandedPanels = reactive({
  personalInfo: 0,
  location: 0,
  professionalSummary: 0,
  experience: 0,
  certification: 0,
  education: 0,
  skills: 0,
  jobDetails: 0,
  salary: 0,
  assessment: 0,
})

// Methods for expanding/collapsing sections
const expandAll = () => {
  Object.keys(expandedPanels).forEach((key) => {
    expandedPanels[key] = 0
  })
}

const collapseAll = () => {
  Object.keys(expandedPanels).forEach((key) => {
    expandedPanels[key] = -1
  })
}

// Computed properties
const completionProgress = computed(() => {
  let total = 0
  let completed = 0

  // Required fields check
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

  // Check assessment
  if (formData?.assessment) {
    // Check interview ratings
    total += 2 // Two interview ratings
    if (formData?.assessment?.interview[0]?.rating > 0) completed++
    if (formData?.assessment?.interview[1]?.rating > 0) completed++

    // Check projects
    total++
    if (
      Array.isArray(formData.assessment.projects) &&
      formData.assessment.projects.length > 0
    ) {
      completed++
    }
  }

  // Calculate percentage and ensure it doesn't exceed 100
  const percentage = (completed / total) * 100
  return Math.min(Math.round(percentage), 100)
})

// Add this watch effect
watch(
  () => completionProgress.value,
  (newValue) => {
    console.log('Progress updated:', newValue)
  }
)

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
    formData.skillDetails = newValue.skillDetails || {}
    saveFormData()
  }
}

const updateAssessment = (value) => {
  formData.assessment = value
  saveFormData()
}

// Save form data with debounce
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

const saveFormData = debounce(() => {
  try {
    const dataToSave = {
      ...formData,
      experiences: [...formData.experiences],
      certifications: [...formData.certifications],
      education: [...formData.education],
      skills: Array.isArray(formData.skills) ? [...formData.skills] : [],
      skillDetails: { ...formData.skillDetails },
      relocationPreferences: [...formData.relocationPreferences],
    }
    localStorage.setItem('employeeFormData', JSON.stringify(dataToSave))
    console.log('Form data saved:', dataToSave)
  } catch (error) {
    console.error('Error saving form data:', error)
  }
}, 500)

// Scroll and navigation methods
const scrollToSection = (sectionId) => {
  expandedPanels[sectionId] = expandedPanels[sectionId] === 0 ? -1 : 0

  if (expandedPanels[sectionId] === 0) {
    const element = document.getElementById(sectionId)
    if (element && mainContent.value) {
      setTimeout(() => {
        const headerOffset = 20
        const elementPosition = element.getBoundingClientRect().top
        const containerScrollTop = mainContent.value.scrollTop
        const offsetPosition =
          elementPosition + containerScrollTop - headerOffset

        mainContent.value.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }, 100)
    }
  }
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

// Form submission and navigation
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

const handleSubmit = async () => {
  const isValid = await validateForm()
  if (!isValid) return

  try {
    isSubmitting.value = true
    console.log('Submitting form data:', formData)
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
  // const savedData = localStorage.getItem('employeeFormData')
  // if (savedData) {
  //   try {
  //     const parsedData = JSON.parse(savedData)
  //     Object.assign(formData, parsedData)
  //   } catch (error) {
  //     console.error('Error loading saved form data:', error)
  //   }
  // }

  // if (storedResume) {
  //   Object.assign(formData, storedResume)
  // }

  const container = document.querySelector('.form-container')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }

  // Default expand all sections
  expandAll()
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

.sidebar-card {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
}

/* Progress bar styles */
.progress-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.section-title {
  color: #b1a184;
  font-size: 1.1rem;
  font-weight: 500;
  text-align: left;
}

.progress-text {
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

:deep(.v-progress-linear) {
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.v-progress-linear__background) {
  opacity: 0.2 !important;
}

:deep(.v-progress-linear__determinate) {
  transition: width 0.3s ease;
}

:deep(.v-progress-linear__stripe) {
  animation: progress-stripe 1s linear infinite;
}

@keyframes progress-stripe {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(30px);
  }
}

.side-nav-header {
  color: #b1a184;
  border-bottom: 2px solid #f5f0e8;
}

.active-section {
  background-color: #f5f0e8 !important;
  color: #b1a184 !important;
}

:deep(.v-expansion-panel) {
  margin-bottom: 16px !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  border-radius: 8px !important;
  overflow: hidden;
}

:deep(.v-expansion-panel-title) {
  padding: 16px 24px;
  min-height: 64px;
  font-size: 1rem;
  font-weight: 500;
}

:deep(.v-expansion-panel-text) {
  padding: 24px;
}

:deep(.v-expansion-panels) {
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.v-expansion-panel--active) {
  border-color: #b1a184 !important;
}

:deep(.v-expansion-panel:hover) {
  border-color: #b1a184 !important;
}

/* Scrollbar styles */
.form-container::-webkit-scrollbar,
.sidebar-card::-webkit-scrollbar {
  width: 8px;
}

.form-container::-webkit-scrollbar-track,
.sidebar-card::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.form-container::-webkit-scrollbar-thumb,
.sidebar-card::-webkit-scrollbar-thumb {
  background: #b1a184;
  border-radius: 4px;
}

.form-container::-webkit-scrollbar-thumb:hover,
.sidebar-card::-webkit-scrollbar-thumb:hover {
  background: #9a8b70;
}

.form-container,
.sidebar-card {
  scrollbar-width: thin;
  scrollbar-color: #b1a184 #f1f1f1;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-list-item) {
  min-height: 44px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.v-list-item:hover) {
  background-color: #f5f0e8;
}

:deep(.v-list-item__prepend) {
  margin-right: 8px;
}

@media (max-width: 960px) {
  .sidebar-card {
    position: relative;
    top: 0;
    max-height: none;
    margin-bottom: 24px;
  }

  .form-container {
    height: auto;
    padding-bottom: 24px;
  }

  :deep(.v-expansion-panel-title) {
    min-height: 56px;
    padding: 12px 16px;
  }

  :deep(.v-expansion-panel-text) {
    padding: 16px;
  }

  .progress-section {
    padding: 16px !important;
  }
}

/* Animation for panel transitions */
:deep(.v-expansion-panel-text__wrapper) {
  transition: all 0.3s ease-in-out;
}

/* Style for the expand/collapse buttons */
.d-flex .v-btn {
  transition: all 0.3s ease;
}

.d-flex .v-btn:hover {
  background-color: #f5f0e8;
  transform: translateY(-1px);
}

/* Additional styles for better visual hierarchy */
.text-h4 {
  font-weight: 500;
  margin-bottom: 32px;
}

:deep(.v-card) {
  transition: box-shadow 0.3s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* Dialog styles */
:deep(.v-dialog > .v-card) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-dialog .v-card-title) {
  padding: 16px 24px;
  font-size: 1.25rem;
}

:deep(.v-dialog .v-card-text) {
  padding: 24px;
  font-size: 1rem;
}

:deep(.v-dialog .v-card-actions) {
  padding: 16px 24px;
}

/* Form field styles */
:deep(.v-field) {
  border-radius: 8px !important;
}

:deep(.v-field--focused) {
  border-color: #b1a184 !important;
}

:deep(.v-input--is-focused) {
  border-color: #b1a184 !important;
}

/* Remove unwanted gaps */
.v-container {
  padding: 0 !important;
  margin: 0 !important;
  max-width: none !important;
}

.v-main {
  padding: 0 !important;
}
</style>
