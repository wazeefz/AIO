<template>
  <div class="upload-container">
    <h1 class="text-h4 text-center py-6" style="color: #b1a184">
      Employee CV Upload
    </h1>

    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card
            class="upload-tabs-container"
            :style="{
              backgroundColor: activeTab === 'single' ? '#F5F0E8' : '#ECE5DB',
            }"
            flat
          >
            <v-row no-gutters>
              <v-col cols="6">
                <v-card
                  flat
                  :class="[
                    'tab-button',
                    { 'active-tab': activeTab === 'single' },
                  ]"
                  @click="switchTab('single')"
                  height="60"
                >
                  <v-card-text class="text-center py-4 text-h6">
                    Upload One CV
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="6">
                <v-card
                  flat
                  :class="[
                    'tab-button',
                    { 'active-tab': activeTab === 'bulk' },
                  ]"
                  @click="switchTab('bulk')"
                  height="60"
                >
                  <v-card-text class="text-center py-4 text-h6">
                    Bulk Upload CV
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-card-text class="pa-6">
              <v-sheet
                class="upload-area"
                :class="{ 'drag-over': isDragging }"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
                border
                rounded
              >
                <div class="upload-placeholder">
                  <v-icon size="40" color="grey">mdi-cloud-upload</v-icon>
                  <p class="text-body-1 mt-4 grey--text">
                    Click or drag file{{ activeTab === 'bulk' ? 's' : '' }} to
                    this area to upload
                  </p>
                  <div class="text-caption text-grey-darken-1">
                    Formats accepted are {{ formatList }}
                  </div>
                  <input
                    type="file"
                    class="file-input"
                    @change="handleFileSelect"
                    :accept="acceptedFormats.join(',')"
                    :multiple="false"
                    ref="fileInput"
                  />
                </div>
              </v-sheet>
            </v-card-text>

            <!-- Actions -->
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>

              <v-btn
                :color="primaryColor"
                :disabled="loading || uploadedResumeData === null"
                @click="submitUploads"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  color="white"
                  size="20"
                ></v-progress-circular>
                <span v-else>Continue to Employee Info</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useResume } from '@/composables/useResume' // Import useResume composable
import { useGoogleDriveUpload } from '@/composables/useUpload'

const router = useRouter()
const primaryColor = '#B1A184'
const activeTab = ref('single')
const isDragging = ref(false)
const uploadedFiles = ref([])
const acceptedFormats = ['.pdf', '.docx']
const showError = ref(false)
const errorMessage = ref('')
const loading = ref(false)
const { resumeData, error, uploadResume } = useResume() // Using the composable
const uploadedResumeData = ref(null)
const { uploadFileToGoogleDrive, error: uploadError } = useGoogleDriveUpload() // Use the composable

const formatList = computed(() => acceptedFormats.join(' and '))

const switchTab = (tab) => {
  activeTab.value = tab
  uploadedFiles.value = []
}

const handleDragOver = () => (isDragging.value = true)
const handleDragLeave = () => (isDragging.value = false)

const handleDrop = (e) => {
  isDragging.value = false
  processFiles(e.dataTransfer.files)
}

const handleFileSelect = (e) => {
  processFiles(e.target.files)
}

const processFiles = (files) => {
  if (files.length === 0) return

  const file = files[0]
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

  if (!acceptedFormats.includes(fileExtension)) {
    showErrorMessage(`File ${file.name} has an invalid format`)
    return
  }

  uploadedFiles.value = [{ file, name: file.name, status: 'uploading' }]
  uploadToBackend(file)
}

// const uploadToBackend = async (file) => {
//   loading.value = true

//   try {
//     const response = await uploadResume(file)
//     console.log('Resume Upload Response:', response)
//     uploadedResumeData.value = response
//     uploadedFiles.value[0].status = 'done'
//   } catch (err) {
//     showErrorMessage(
//       error.value || 'Failed to upload resume. Please try again.'
//     )
//   } finally {
//     loading.value = false
//   }
// }

const uploadToBackend = async (file) => {
  loading.value = true

  try {
    const response = await uploadFileToGoogleDrive(file) // Use the composable function
    console.log('File Upload Response:', response)
    uploadedResumeData.value = response
    uploadedFiles.value[0].status = 'done'
  } catch (err) {
    showErrorMessage(
      uploadError.value || 'Failed to upload file. Please try again.'
    )
  } finally {
    loading.value = false
  }
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
}

const submitUploads = () => {
  if (!uploadedResumeData.value) {
    showErrorMessage('Please upload a file before proceeding.')
    return
  }

  router.push({
    path: '/upload-cv/employee-info',
    query: { data: JSON.stringify(uploadedResumeData.value) },
  })
}
</script>
