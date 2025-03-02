<template>
  <v-container fluid class="form-container">
    <!-- Fixed Header with Actions -->
    <div class="fixed-header">
      <div class="d-flex align-center justify-space-between px-6 py-4">
        <v-btn
          variant="text"
          prepend-icon="mdi-arrow-left"
          @click="handleBack"
          color="grey-darken-1"
        >
          Back
        </v-btn>
        <v-btn color="#B1A184" :loading="isSubmitting" @click="handleSubmit">
          {{ isEditMode ? 'Update' : 'Save' }}
        </v-btn>
      </div>
      <v-divider></v-divider>
    </div>

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
        <v-card class="mb-4 sticky-sidebar" style="overflow: visible">
          <v-card-text class="text-center pa-6">
            <!-- Profile Picture Section -->
            <div class="profile-section mb-8">
              <h3 class="section-title mb-4">Profile Picture</h3>
              <div class="profile-container">
                <ProfilePictureEditor
                  ref="profileEditor"
                  @image-changed="handleProfileImageChange"
                  :initial-image="formData.profilePic"
                  :first-name="formData.firstName"
                  :last-name="formData.lastName"
                />
              </div>
            </div>

            <!-- CV Preview Section -->
            <div class="cv-section mb-8">
              <h3 class="section-title mb-4">Uploaded CV</h3>
              <div v-if="uploadedCV.file" class="cv-preview-section">
                <div class="d-flex align-center mb-4">
                  <v-icon
                    :icon="getFileIcon(uploadedCV.name)"
                    color="#B1A184"
                    class="mr-2"
                    size="32"
                  ></v-icon>
                  <div class="text-left">
                    <div
                      class="text-subtitle-2 text-truncate"
                      style="max-width: 180px"
                    >
                      {{ uploadedCV.name }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ formatFileSize(uploadedCV.file.size) }}
                    </div>
                  </div>
                </div>
                <v-btn
                  block
                  variant="outlined"
                  prepend-icon="mdi-eye"
                  @click="showPreview = true"
                  class="mb-2"
                >
                  Preview CV
                </v-btn>
                <v-btn
                  block
                  variant="outlined"
                  color="#B1A184"
                  prepend-icon="mdi-upload"
                  @click="handleBack"
                >
                  Upload Different CV
                </v-btn>
              </div>
              <div v-else>
                <v-btn
                  block
                  variant="outlined"
                  color="#B1A184"
                  prepend-icon="mdi-upload"
                  @click="handleBack"
                >
                  Upload CV First
                </v-btn>
              </div>
            </div>

            <!-- Progress Section -->
            <div class="progress-section">
              <h3 class="section-title mb-4">Completion Status</h3>
              <v-progress-linear
                :model-value="completionProgress"
                color="#B1A184"
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
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Main Form Content -->
      <v-col cols="12" md="9">
        <h2 class="text-h4 mb-8" style="color: #b1a184">
          {{
            isEditMode ? 'Edit Employee Information' : 'Employee Information'
          }}
        </h2>

        <!-- Employee Form -->
        <v-form ref="form" v-model="isValid">
          <!-- Personal Information Section -->
          <v-card class="mb-4">
            <v-card-title class="text-h6 px-4 pt-4">
              <v-icon color="#B1A184" class="mr-2">mdi-account</v-icon>
              Personal Information
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.firstName"
                    label="First Name"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.lastName"
                    label="Last Name"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    :rules="[rules.required, rules.email]"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.phone"
                    label="Phone"
                    :rules="[rules.required, rules.phone]"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-menu
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="formattedDate"
                        label="Date of Birth"
                        prepend-icon="mdi-calendar"
                        variant="outlined"
                        density="comfortable"
                        readonly
                        :rules="[rules.required]"
                        v-bind="props"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="formData.dateOfBirth"
                      :max="maxDate"
                      @update:model-value="saveDateOfBirth"
                      elevation="1"
                    >
                      <template v-slot:actions="{ attrs }">
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          variant="text"
                          @click="dateMenu = false"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          color="primary"
                          variant="text"
                          @click="saveDateOfBirth"
                        >
                          OK
                        </v-btn>
                      </template>
                    </v-date-picker>
                  </v-menu>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.age"
                    label="Age"
                    type="number"
                    :rules="[rules.required, rules.age]"
                    variant="outlined"
                    density="comfortable"
                    readonly
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.gender"
                    :items="['Male', 'Female', 'Other']"
                    label="Gender"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                  ></v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Location Section -->
          <v-card class="mb-4">
            <v-card-title class="text-h6 px-4 pt-4">
              <v-icon color="#B1A184" class="mr-2">mdi-map-marker</v-icon>
              Current Location & Relocation
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.currentCountry"
                    :items="countries"
                    label="Current Country"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-earth</v-icon>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.currentCity"
                    label="Current City"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-city</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-switch
                    v-model="formData.willingToRelocate"
                    label="Willing to Relocate"
                    color="#B1A184"
                    hide-details
                    class="mb-4"
                  ></v-switch>
                </v-col>

                <v-col cols="12" v-if="formData.willingToRelocate">
                  <v-combobox
                    v-model="formData.relocationPreferences"
                    :items="countries"
                    label="Preferred Relocation Locations"
                    multiple
                    chips
                    variant="outlined"
                    density="comfortable"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-map-marker-multiple</v-icon>
                    </template>
                  </v-combobox>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Professional Summary -->
          <v-card class="mb-4">
            <v-card-title class="text-h6 px-4 pt-4">
              <v-icon color="#B1A184" class="mr-2">mdi-text-box</v-icon>
              Professional Summary
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="formData.summary"
                label="Professional Summary"
                variant="outlined"
                rows="4"
                :rules="[rules.required]"
                counter
                maxlength="500"
              ></v-textarea>

              <v-text-field
                v-model="formData.experience"
                label="Years of Experience"
                type="number"
                :rules="[rules.required, rules.experience]"
                variant="outlined"
                density="comfortable"
                class="mt-4"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-briefcase-clock</v-icon>
                </template>
              </v-text-field>
            </v-card-text>
          </v-card>

          <!-- Professional Experience Section -->
          <v-card class="mb-4">
            <v-card-text>
              <ExperienceSection v-model="formData.experiences" />
            </v-card-text>
          </v-card>

          <!-- Education Section -->
          <v-card class="mb-4">
            <v-card-text>
              <EducationSection v-model="formData.education" />
            </v-card-text>
          </v-card>

          <!-- Skills Section -->
          <v-card class="mb-4">
            <v-card-title class="text-h6 px-4 pt-4">
              <v-icon color="#B1A184" class="mr-2">mdi-lightning-bolt</v-icon>
              Skills
            </v-card-title>
            <v-card-text>
              <v-combobox
                v-model="formData.skills"
                :items="availableSkills"
                label="Skills"
                multiple
                chips
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-code-tags</v-icon>
                </template>
              </v-combobox>
            </v-card-text>
          </v-card>

          <!-- Job Details Section -->
          <v-card class="mb-4">
            <v-card-title class="text-h6 px-4 pt-4">
              <v-icon color="#B1A184" class="mr-2"
                >mdi-briefcase-outline</v-icon
              >
              Job Details
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.jobTitle"
                    label="Job Title"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-card-account-details-outline</v-icon>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.jobPosition"
                    :items="positionLevels"
                    label="Position Level"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon>mdi-stairs</v-icon>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Compensation Section -->
          <v-card class="mb-4">
            <v-card-title class="text-h6 px-4 pt-4">
              <v-icon color="#B1A184" class="mr-2">mdi-currency-usd</v-icon>
              Compensation
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.salary"
                    label="Expected Salary"
                    prefix="$"
                    :rules="[rules.required, rules.salary]"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-form>
      </v-col>
    </v-row>

    <!-- CV Preview Dialog -->
    <v-dialog v-model="showPreview" max-width="900px" scrollable>
      <v-card>
        <v-card-title
          class="d-flex justify-space-between align-center"
          style="background-color: #b1a184; color: white"
        >
          Preview: {{ uploadedCV.name }}
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="showPreview = false"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="preview-content pa-0">
          <iframe
            v-if="isPDF"
            :src="uploadedCV.url"
            class="pdf-preview"
          ></iframe>
          <v-sheet
            v-else
            class="d-flex flex-column align-center justify-center py-8"
          >
            <v-icon
              icon="mdi-file-document-outline"
              size="64"
              color="grey-darken-1"
            ></v-icon>
            <p class="text-body-1 mt-4 mb-4">
              Preview is only available for PDF files.
            </p>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import ProfilePictureEditor from '@/components/profilePictureEditor.vue'
import EducationSection from '@/components/employeeEducation.vue'
import ExperienceSection from '@/components/JobExperience.vue'

const router = useRouter()

// Form refs and state
const form = ref(null)
const profileEditor = ref(null)
const isValid = ref(false)
const isSubmitting = ref(false)
const showPreview = ref(false)
const showScrollButton = ref(false)
const showBackDialog = ref(false)
const dateMenu = ref(false)
const isEditMode = ref(false)

// Mock uploaded CV data
const uploadedCV = ref({
  file: null,
  name: '',
  url: '',
})

// Position levels and countries
const positionLevels = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive',
]

const countries = ref([
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'Singapore',
  'United Arab Emirates',
  'Saudi Arabia',
  'China',
  'India',
  'Brazil',
  // Add more countries as needed
])

const availableSkills = ref([
  'JavaScript',
  'Python',
  'Java',
  'React',
  'Vue.js',
  'Node.js',
  'AWS',
  'Docker',
  'Kubernetes',
  'TypeScript',
  'Angular',
  'SQL',
  'MongoDB',
  'DevOps',
  'Machine Learning',
])

// Form data
const formData = ref({
  profilePic: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  experience: '',
  skills: [],
  currentCountry: '',
  currentCity: '',
  willingToRelocate: false,
  relocationPreferences: [],
  salary: '',
  summary: '',
  education: [],
  experiences: [],
  jobTitle: '',
  jobPosition: '',
})

// Computed properties
const maxDate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().split('T')[0]
})

const formattedDate = computed(() => {
  if (!formData.value.dateOfBirth) return ''
  return new Date(formData.value.dateOfBirth).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const isPDF = computed(() =>
  uploadedCV.value.name?.toLowerCase().endsWith('.pdf')
)

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
    'experience',
    'currentCountry',
    'currentCity',
    'salary',
    'summary',
    'jobTitle',
    'jobPosition',
  ]

  total += requiredFields.length
  completed += requiredFields.filter((field) => !!formData.value[field]).length

  // Check arrays and special fields
  if (formData.value.skills.length > 0) completed++
  if (formData.value.education.length > 0) completed++
  if (formData.value.experiences.length > 0) completed++
  total += 3

  // Check profile picture
  if (formData.value.profilePic) completed++
  total++

  // Check relocation preferences if willing to relocate
  if (formData.value.willingToRelocate) {
    total++
    if (formData.value.relocationPreferences.length > 0) completed++
  }

  return (completed / total) * 100
})

// Validation rules
const rules = {
  required: (v) => !!v || 'This field is required',
  email: (v) => /.+@.+\..+/.test(v) || 'Invalid email format',
  phone: (v) => /^[0-9()+\-\s]{8,}$/.test(v) || 'Invalid phone number',
  age: (v) => (v >= 18 && v <= 100) || 'Age must be between 18 and 100',
  experience: (v) => {
    const age = parseInt(formData.value.age)
    return v <= age - 18 || 'Experience cannot exceed working years'
  },
  salary: (v) => /^\$?\d{1,3}(,\d{3})*$/.test(v) || 'Invalid salary format',
}

// Methods
const handleProfileImageChange = (imageData) => {
  formData.value.profilePic = imageData
}

const handleBack = () => {
  showBackDialog.value = true
}

const confirmBack = () => {
  showBackDialog.value = false
  router.push('/upload-cv')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileIcon = (filename) => {
  if (!filename) return 'mdi-file-document-outline'
  const ext = filename.split('.').pop().toLowerCase()
  return ext === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-file-document'
}

const calculateAge = (birthDate) => {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const saveDateOfBirth = () => {
  if (formData.value.dateOfBirth) {
    formData.value.age = calculateAge(formData.value.dateOfBirth)
    dateMenu.value = false
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

const handleSubmit = async () => {
  if (!isValid.value) return
  try {
    isSubmitting.value = true
    // Add your submit logic here
    router.push('/upload-cv/bulk-employee-info')
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Scroll handler
const handleScroll = () => {
  const container = document.querySelector('.form-container')
  if (container) {
    showScrollButton.value = container.scrollTop > 300
  }
}

// Lifecycle hooks
onMounted(() => {
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
})
</script>

<style scoped>
.form-container {
  height: calc(100vh - 64px);
  overflow-y: auto;
  padding-bottom: 100px;
  position: relative;
}

.fixed-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 100;
  margin-bottom: 24px;
}

.section-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 500;
  border-bottom: 2px solid #b1a184;
  padding-bottom: 8px;
  text-align: left;
}

.preview-content {
  min-height: 400px;
  max-height: 700px;
}

.pdf-preview {
  width: 100%;
  height: 700px;
  border: none;
}

.cv-preview-section {
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.sticky-sidebar {
  position: sticky;
  top: 88px;
  height: fit-content;
  background-color: white;
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

.progress-text {
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-text-field .v-input__details) {
  padding-inline: 16px;
}

:deep(.v-btn) {
  text-transform: none;
}

:deep(.v-card-title) {
  font-size: 1.1rem !important;
}

:deep(.v-card) {
  border-radius: 8px;
}

.location-chip {
  background-color: #f5f0e8 !important;
  color: #b1a184 !important;
}

:deep(.v-switch .v-selection-control) {
  margin-inline-start: 0;
}

:deep(.v-switch .v-label) {
  opacity: 1;
  color: var(--v-theme-on-surface);
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

@media (max-width: 960px) {
  .sticky-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 24px;
  }

  .fixed-header {
    padding: 12px;
  }
}
</style>
