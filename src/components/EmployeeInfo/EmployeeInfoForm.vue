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
          <!-- Hidden fields for CV data -->
          <input
            type="hidden"
            name="resumeFilename"
            v-model="formData.resumeFilename"
          />

          <v-expansion-panels v-model="expandedPanels.personalInfo">
            <v-expansion-panel>
              <v-expansion-panel-title
                >Personal Information</v-expansion-panel-title
              >
              <v-expansion-panel-text>
                <PersonalInfoSection
                  :model-value="{
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth,
                    age: formData.age,
                    gender: formData.gender,
                    maritalStatus: formData.maritalStatus,
                    profilePic: formData.profilePic,
                  }"
                  :rules="rules"
                  @update:model-value="updatePersonalInfo"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.location">
            <v-expansion-panel>
              <v-expansion-panel-title>Location</v-expansion-panel-title>
              <v-expansion-panel-text>
                <LocationSection
                  :model-value="{
                    currentCountry: formData.currentCountry,
                    currentCity: formData.currentCity,
                    willingToRelocate: formData.willingToRelocate,
                    relocationPreferences: formData.relocationPreferences,
                  }"
                  :rules="rules"
                  @update:model-value="updateLocation"
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
                  :model-value="{
                    summary: formData.summary,
                    experience: formData.experience,
                  }"
                  :rules="rules"
                  @update:model-value="updateProfessionalSummary"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.experience">
            <v-expansion-panel>
              <v-expansion-panel-title>Experience</v-expansion-panel-title>
              <v-expansion-panel-text>
                <ExperienceSection
                  :model-value="formData.experiences || []"
                  :rules="rules"
                  @update:model-value="updateExperiences"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.certifications">
            <v-expansion-panel>
              <v-expansion-panel-title>Certifications</v-expansion-panel-title>
              <v-expansion-panel-text>
                <CertificationSection
                  :model-value="formData.certifications || []"
                  :rules="rules"
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
                  :model-value="formData.education || []"
                  :rules="rules"
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
                    skills: formData.skills || [],
                    skillDetails: formData.skillDetails || [],
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
                  :model-value="{
                    jobTitle: formData.jobTitle,
                    jobPosition: formData.jobPosition,
                    department: formData.department,
                    employmentType: formData.employmentType,
                    contractDuration: formData.contractDuration,
                    hireDate: formData.hireDate,
                    availabilityStatus: formData.availabilityStatus,
                    careerPreferences: formData.careerPreferences,
                  }"
                  :rules="rules"
                  @update:model-value="updateJobDetails"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.salary">
            <v-expansion-panel>
              <v-expansion-panel-title>Salary</v-expansion-panel-title>
              <v-expansion-panel-text>
                <Salary
                  :model-value="{ salary: formData.salary }"
                  :rules="rules"
                  @update:model-value="updateSalary"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <v-expansion-panels v-model="expandedPanels.assessment">
            <v-expansion-panel>
              <v-expansion-panel-title>Assessment</v-expansion-panel-title>
              <v-expansion-panel-text>
                <Assessment
                  :model-value="formData.assessment || {}"
                  :rules="rules"
                  @update:model-value="updateAssessment"
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
import { useTalentResumeStore } from '@/stores/talentDataStore'

const router = useRouter()
const resumeStore = useResumeStore()
const talentStore = useTalentResumeStore()

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
  relocationPreferences: storedResume?.relocationPreferences || [],

  // Professional Summary
  summary: storedResume?.summary,
  experience: storedResume?.experience,

  // Skills - store only skill names
  skills: Array.isArray(storedResume?.skills)
    ? storedResume.skills.map((skill) =>
        typeof skill === 'string' ? skill : skill.name
      )
    : [],

  // SkillDetails - store proficiency and category for each skill
  skillDetails:
    storedResume?.skills?.reduce((details, skill) => {
      const skillName = typeof skill === 'string' ? skill : skill.name
      details[skillName] = {
        proficiency:
          typeof skill === 'string'
            ? storedResume?.skillDetails?.[skill]?.proficiency || 3
            : skill.proficiency || 3,
        category:
          typeof skill === 'string'
            ? storedResume?.skillDetails?.[skill]?.category || 'Other'
            : skill.category || 'Other',
      }
      return details
    }, {}) || {},

  // Arrays for sections
  education: storedResume?.education || [],
  experiences: storedResume?.experiences || [],
  certifications: storedResume?.certifications || [],

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
  assessment: storedResume?.assessment || {
    interview: [
      { rating: 0 }, // Technical Skills
      { rating: 0 }, // Soft Skills
    ],
    interviewRemarks: '',
    projects: [],
  },

  // CV data
  resumeFilename: null,
  resumeFileSize: null,
  resumeFileType: null,
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

// Modify the expandedPanels initialization
const expandedPanels = reactive({
  personalInfo: null,
  location: null,
  professionalSummary: null,
  experience: null,
  certification: null,
  education: null,
  skills: null,
  jobDetails: null,
  salary: null,
  assessment: null,
})

// Methods for expanding/collapsing sections
const expandAll = () => {
  // Use setTimeout to ensure Vue has finished rendering
  setTimeout(() => {
    Object.keys(expandedPanels).forEach((key) => {
      expandedPanels[key] = 0
    })
  }, 50)
}

const collapseAll = () => {
  // Use setTimeout to ensure Vue has finished rendering
  setTimeout(() => {
    Object.keys(expandedPanels).forEach((key) => {
      expandedPanels[key] = null
    })
  }, 50)
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
  if (formData.employmentType !== 'Full Time') {
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
const updatePersonalInfo = (value) => {
  Object.assign(formData, value)
  debounce(saveFormData, 500)()
}

const updateLocation = (value) => {
  Object.assign(formData, value)
  debounce(saveFormData, 500)()
}

const updateProfessionalSummary = (value) => {
  Object.assign(formData, value)
  debounce(saveFormData, 500)()
}

const updateJobDetails = (value) => {
  Object.assign(formData, value)
  debounce(saveFormData, 500)()
}

const updateSalary = (value) => {
  formData.salary = value.salary
  debounce(saveFormData, 500)()
}

const updateExperiences = (value) => {
  formData.experiences = Array.isArray(value) ? value : []
  debounce(saveFormData, 500)()
}

const updateCertifications = (value) => {
  console.log('Updating certifications with:', value)

  // Ensure value is an array
  if (!Array.isArray(value)) {
    console.error('Expected array for certifications, got:', typeof value)
    return
  }

  // Make a deep copy to avoid reference issues
  formData.certifications = JSON.parse(JSON.stringify(value))

  // Log the updated certifications
  console.log('Updated certifications in formData:', formData.certifications)

  // Save form data
  saveFormData()
}

const updateEducation = (value) => {
  formData.education = Array.isArray(value) ? value : []
  debounce(saveFormData, 500)()
}

const updateSkills = (value) => {
  formData.skills = value.skills || []
  formData.skillDetails = value.skillDetails || []
  debounce(saveFormData, 500)()
}

const updateAssessment = (value) => {
  formData.assessment = value || {}
  debounce(saveFormData, 500)()
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
    // Log before saving to check certifications
    console.log(
      'Saving form data with certifications:',
      formData.certifications
    )

    const dataToSave = {
      ...formData,
      experiences: Array.isArray(formData.experiences)
        ? [...formData.experiences]
        : [],
      certifications: Array.isArray(formData.certifications)
        ? [...formData.certifications]
        : [],
      education: Array.isArray(formData.education)
        ? [...formData.education]
        : [],
      skills: Array.isArray(formData.skills) ? [...formData.skills] : [],
      skillDetails: { ...formData.skillDetails },
      relocationPreferences: Array.isArray(formData.relocationPreferences)
        ? [...formData.relocationPreferences]
        : [],
      resumeFilename: formData.resumeFilename,
      resumeFileSize: formData.resumeFileSize,
      resumeFileType: formData.resumeFileType,
    }

    // Check if certifications are properly included
    console.log('Certifications in dataToSave:', dataToSave.certifications)

    localStorage.setItem('employeeFormData', JSON.stringify(dataToSave))
    console.log('Form data saved:', dataToSave)
  } catch (error) {
    console.error('Error saving form data:', error)
  }
}, 500)

// Scroll and navigation methods
const scrollToSection = (sectionId) => {
  // Toggle panel state
  expandedPanels[sectionId] = expandedPanels[sectionId] === 0 ? null : 0

  // Only scroll if we're expanding the panel
  if (expandedPanels[sectionId] === 0) {
    // Use setTimeout to ensure the panel has time to expand
    setTimeout(() => {
      const element =
        document.getElementById(sectionId) ||
        document.querySelector(`[data-section="${sectionId}"]`)
      if (element) {
        const headerOffset = 20
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }
    }, 100)
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

// Add this function before handleSubmit
const transformDataForBackend = (data) => {
  // Create a deep copy to avoid modifying the original data
  const transformedData = JSON.parse(JSON.stringify(data))

  // Ensure certifications have the correct field names
  if (Array.isArray(transformedData.certifications)) {
    console.log(
      'Processing certifications in transform function:',
      transformedData.certifications
    )

    // Make sure certifications array is not empty
    if (transformedData.certifications.length === 0) {
      console.log('No certifications found in data')
    }

    transformedData.certifications = transformedData.certifications.map(
      (cert) => {
        console.log('Processing certification:', cert)
        return {
          name: cert.name,
          issuing_organization:
            cert.issuingOrganization || cert.issuing_organization,
          credential_id: cert.credentialId || cert.credential_id || null,
          issue_date: cert.issueDate || cert.issue_date,
          expiry_date: cert.expiryDate || cert.expiry_date || null,
          // Keep original fields for compatibility
          issuingOrganization:
            cert.issuingOrganization || cert.issuing_organization,
          credentialId: cert.credentialId || cert.credential_id || null,
          issueDate: cert.issueDate || cert.issue_date,
          expiryDate: cert.expiryDate || cert.expiry_date || null,
        }
      }
    )
  } else {
    console.log(
      'Certifications is not an array:',
      transformedData.certifications
    )
    // Initialize as empty array if undefined
    transformedData.certifications = []
  }

  // Ensure employment_type is in the correct format
  if (transformedData.employmentType) {
    const employmentTypeMapping = {
      fullTime: 'Full Time',
      partTime: 'Part Time',
      contract: 'Contract',
    }
    transformedData.employmentType =
      employmentTypeMapping[transformedData.employmentType] ||
      transformedData.employmentType
  }

  return transformedData
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // For testing purposes, we'll skip validation
    // Uncomment this for production
    /*
    const isValid = await validateForm();
    if (!isValid) {
      isSubmitting.value = false;
      return;
    }
    */

    console.log('=== FORM SUBMISSION TEST MODE ===')
    console.log('Raw form data:', {
      ...formData,
      skills: formData.skills,
      skillDetails: formData.skillDetails,
      certifications: formData.certifications, // Log certifications explicitly
    })

    // Extract and store skill categories
    const skillCategories = talentStore.extractSkillCategories(formData)
    console.log('Extracted skill categories:', skillCategories)
    talentStore.storeSkillCategories(skillCategories)

    // Initialize form with CV data from localStorage
    const formDataWithCV = talentStore.initializeFormWithCVData(formData)

    // Log certifications before transformation
    console.log(
      'Certifications before transformation:',
      formDataWithCV.certifications
    )

    // Transform data for backend compatibility
    const transformedData = transformDataForBackend(formDataWithCV)
    console.log('Form data with CV details (transformed):', transformedData)

    // Log certifications after transformation
    console.log(
      'Certifications after transformation:',
      transformedData.certifications
    )

    // Create a structured payload for the backend
    const backendPayload = {
      personal_info: {
        first_name: transformedData.firstName,
        last_name: transformedData.lastName,
        email: transformedData.email,
        phone: transformedData.phone,
        date_of_birth: transformedData.dateOfBirth,
        gender: transformedData.gender,
        marital_status: transformedData.maritalStatus === 'married',
        current_country: transformedData.currentCountry,
        current_city: transformedData.currentCity,
        willing_to_relocate: transformedData.willingToRelocate,
        professional_summary: transformedData.summary,
        total_experience_years: parseFloat(transformedData.experience) || 0,
        job_title: transformedData.jobTitle,
        position_level: transformedData.jobPosition,
        employment_type: transformedData.employmentType,
        basic_salary:
          parseFloat(transformedData.salary?.replace(/,/g, '')) || 0,
        age: transformedData.age || 0,
        resume_filename: transformedData.resumeFilename,
      },
      skills: transformedData.skills,
      education: transformedData.education,
      experience: transformedData.experiences,
      certifications: transformedData.certifications || [], // Ensure certifications are included with a fallback
      assessment: transformedData.assessment,
    }

    // Log what would be sent to the backend
    console.log('=== DATA THAT WOULD BE SENT TO BACKEND ===')
    console.log('Backend Payload:', backendPayload)
    console.log('Certifications in payload:', backendPayload.certifications) // Log certifications explicitly
    console.log('=== TEST MODE: Submission prevented ===')

    // Display alert - using vanilla JavaScript alert to avoid any Vue reactivity issues
    window.alert(
      'Form data logged to console. Backend submission prevented for testing.'
    )

    // Comment out the actual submission code
    /*
    const talentId = await talentStore.submitEmployeeInfo(backendPayload);
    if (talentId) {
      console.log('Form submitted successfully with talent ID:', talentId);
      localStorage.removeItem('employeeFormData');
      router.push('/upload-cv/bulk-employee-info');
    } else {
      throw new Error('Failed to submit form data');
    }
    */
  } catch (error) {
    console.error('Form submission error:', error)
    window.alert(
      'An error occurred while submitting the form. Please try again.'
    )
  } finally {
    isSubmitting.value = false
  }
}

// Form validation
const validateForm = async () => {
  if (!form.value) return false

  try {
    const { valid } = await form.value.validate()

    if (!valid) {
      // Find the first invalid section and expand it
      const requiredFields = [
        { field: 'firstName', section: 'personalInfo' },
        { field: 'lastName', section: 'personalInfo' },
        { field: 'email', section: 'personalInfo' },
        { field: 'currentCountry', section: 'location' },
        { field: 'currentCity', section: 'location' },
      ]

      for (const { field, section } of requiredFields) {
        if (!formData[field]) {
          // Set panel to expanded (0)
          expandedPanels[section] = 0

          // Use setTimeout to ensure the panel has time to expand
          setTimeout(() => {
            const element = document.querySelector(`[name="${field}"]`)
            if (element) element.focus()
          }, 300)

          return false
        }
      }
    }

    return valid
  } catch (error) {
    console.error('Form validation error:', error)
    return false
  }
}

// Initialize panels after component is mounted
onMounted(() => {
  // Initialize form with CV data
  const formDataWithCV = talentStore.initializeFormWithCVData(formData)
  if (formDataWithCV.resumeFilename) {
    console.log('CV filename loaded:', formDataWithCV.resumeFilename)
    Object.assign(formData, formDataWithCV)
  }

  // Load saved form data if available
  const savedData = localStorage.getItem('employeeFormData')
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData)
      Object.assign(formData, parsedData)
    } catch (error) {
      console.error('Error loading saved form data:', error)
    }
  }

  // Load resume data if available
  if (storedResume) {
    Object.assign(formData, storedResume)
  }

  const container = document.querySelector('.form-container')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }

  // Initialize expanded panels after component is mounted
  setTimeout(() => {
    Object.keys(expandedPanels).forEach((key) => {
      expandedPanels[key] = 0
    })
  }, 100)
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
