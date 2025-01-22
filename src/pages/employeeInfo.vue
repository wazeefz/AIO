<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" lg="10">
            <v-card class="employee-form elevation-3">
              <v-row>
                <!-- Left Sidebar -->
                <v-col cols="12" md="4" class="border-right">
                  <div class="sidebar-content pa-6">
                    <!-- Profile Picture -->
                    <div class="profile-section">
                      <h3 class="section-title">Profile Picture</h3>
                      <ProfilePictureEditor
                        @image-changed="handleProfilePicChange"
                        :current-image="employeeData.profilePicture"
                      />
                    </div>

                    <!-- CV Preview -->
                    <v-expansion-panels class="cv-preview-panel mt-6">
                      <v-expansion-panel>
                        <v-expansion-panel-title>
                          <v-row no-gutters>
                            <v-col cols="2">
                              <v-icon
                                icon="mdi-file-document"
                                color="#d9c6a5"
                              ></v-icon>
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

                    <!-- Progress -->
                    <div class="progress-section mt-6">
                      <h3 class="section-title">Completion Status</h3>
                      <v-progress-linear
                        :model-value="completionProgress"
                        color="#d9c6a5"
                        height="20"
                        rounded
                      >
                        <span class="progress-text"
                          >{{ Math.ceil(completionProgress) }}%</span
                        >
                      </v-progress-linear>
                      <div class="text-caption text-grey mt-2">
                        Complete all required fields to proceed
                      </div>
                    </div>
                  </div>
                </v-col>

                <!-- Main Form -->
                <v-col cols="12" md="8">
                  <div class="form-content pa-6">
                    <h2 class="text-h5 font-weight-medium mb-6">
                      Employee Information
                    </h2>

                    <v-form ref="employeeForm" v-model="isFormValid">
                      <!-- Personal Info -->
                      <div class="form-section mb-6">
                        <h3 class="section-subtitle">
                          <v-icon color="#d9c6a5" class="mr-2"
                            >mdi-account</v-icon
                          >
                          Personal Details
                        </h3>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="employeeData.firstName"
                              label="First Name"
                              :rules="nameRules"
                              variant="outlined"
                              density="comfortable"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="employeeData.lastName"
                              label="Last Name"
                              :rules="nameRules"
                              variant="outlined"
                              density="comfortable"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="employeeData.email"
                              label="Email"
                              :rules="emailRules"
                              variant="outlined"
                              density="comfortable"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="employeeData.phone"
                              label="Phone Number"
                              :rules="phoneRules"
                              variant="outlined"
                              density="comfortable"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </div>

                      <!-- Professional Info -->
                      <div class="form-section mb-6">
                        <h3 class="section-subtitle">
                          <v-icon color="#d9c6a5" class="mr-2"
                            >mdi-briefcase</v-icon
                          >
                          Professional Details
                        </h3>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="employeeData.position"
                              label="Job Position"
                              :rules="[(v) => !!v || 'Position is required']"
                              variant="outlined"
                              density="comfortable"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-select
                              v-model="employeeData.department"
                              :items="departments"
                              label="Department"
                              :rules="[(v) => !!v || 'Department is required']"
                              variant="outlined"
                              density="comfortable"
                              required
                            ></v-select>
                          </v-col>
                        </v-row>
                      </div>

                      <!-- Employment Type Section -->
                      <div class="form-section mb-6">
                        <h3 class="section-subtitle">
                          <v-icon color="#d9c6a5" class="mr-2"
                            >mdi-briefcase-clock</v-icon
                          >
                          Employment Type
                        </h3>
                        <v-radio-group
                          v-model="employeeData.employmentType"
                          mandatory
                        >
                          <v-radio label="Full Time" value="fullTime"></v-radio>
                          <v-radio label="Part Time" value="partTime"></v-radio>
                          <v-radio label="Contract" value="contract"></v-radio>
                        </v-radio-group>

                        <v-expand-transition>
                          <div
                            v-if="employeeData.employmentType !== 'fullTime'"
                            class="mt-3"
                          >
                            <v-text-field
                              v-model="employeeData.contractDuration"
                              :label="getDurationLabel"
                              type="number"
                              variant="outlined"
                              density="comfortable"
                              :rules="[
                                (v) => !!v || `${getDurationLabel} is required`,
                              ]"
                            ></v-text-field>

                            <v-textarea
                              v-model="employeeData.employmentRemarks"
                              label="Remarks (Optional)"
                              variant="outlined"
                              density="comfortable"
                              rows="2"
                              class="mt-3"
                              hint="Add any additional information about the employment arrangement"
                              persistent-hint
                            ></v-textarea>
                          </div>
                        </v-expand-transition>
                      </div>

                      <!-- Professional Summary -->
                      <div class="form-section mb-6">
                        <h3 class="section-subtitle">
                          <v-icon color="#d9c6a5" class="mr-2"
                            >mdi-text-box</v-icon
                          >
                          Professional Summary
                        </h3>
                        <v-textarea
                          v-model="employeeData.bio"
                          label="Professional Summary"
                          variant="outlined"
                          rows="3"
                          :rules="[
                            (v) => !!v || 'Professional summary is required',
                          ]"
                          counter
                          maxlength="500"
                        ></v-textarea>
                      </div>

                      <!-- Skills Section -->
                      <div class="form-section mb-6">
                        <h3 class="section-subtitle">
                          <v-icon color="#d9c6a5" class="mr-2"
                            >mdi-lightning-bolt</v-icon
                          >
                          Skills & Expertise
                        </h3>
                        <v-combobox
                          v-model="employeeData.skills"
                          :items="suggestedSkills"
                          label="Skills"
                          multiple
                          chips
                          closable-chips
                          variant="outlined"
                        ></v-combobox>
                      </div>

                      <!-- Education Section -->
                      <div class="form-section mb-6">
                        <EducationSection v-model="employeeData.education" />
                      </div>

                      <!-- Form Actions -->
                      <v-divider class="my-6"></v-divider>
                      <div class="d-flex justify-space-between">
                        <v-btn
                          variant="outlined"
                          prepend-icon="mdi-arrow-left"
                          @click="goBack"
                        >
                          Back
                        </v-btn>
                        <v-btn
                          color="#d9c6a5"
                          :loading="isSubmitting"
                          :disabled="!isFormValid"
                          @click="submitForm"
                          prepend-icon="mdi-check"
                        >
                          Submit Application
                        </v-btn>
                      </div>
                    </v-form>
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

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

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="400" persistent>
      <v-card class="success-dialog">
        <v-card-title class="success-title">Registration Complete</v-card-title>
        <v-card-text class="pa-6 text-center">
          <v-icon
            color="success"
            size="64"
            class="mb-4 success-icon"
            icon="mdi-check-circle"
          ></v-icon>
          <p class="text-body-1">
            Your information has been successfully submitted. HR will review
            your details and contact you soon.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn color="#d9c6a5" @click="handleComplete">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import ProfilePictureEditor from '@/components/profilePictureEditor'
import EducationSection from '@/components/employeeEducation'

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
    window.location.href = '/uploadCV'
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

<style scoped>
.section-title {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #d9c6a5;
}

.section-subtitle {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.border-right {
  border-right: 1px solid var(--border-color);
}

.cv-preview-frame {
  width: 100%;
  height: 700px;
  border: none;
}

.success-title {
  background-color: #d9c6a5;
  color: white;
  padding: 16px;
  text-align: center;
}

.success-icon {
  animation: checkmark 0.5s ease-in-out;
}

.progress-text {
  color: white;
  font-weight: 500;
}

@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 960px) {
  .border-right {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .cv-preview-frame {
    height: 500px;
  }
}

/* Custom styles for v-btn */
:deep(.v-btn) {
  text-transform: none;
}

/* Custom styles for radio buttons */
:deep(.v-radio) {
  margin-bottom: 8px;
}

/* Custom styles for chips */
:deep(.v-chip) {
  background-color: #d9c6a5 !important;
  color: white !important;
}

/* Custom styles for expansion panels */
:deep(.v-expansion-panel) {
  background-color: transparent !important;
}

:deep(.v-expansion-panel-title) {
  padding: 16px !important;
}
</style>
