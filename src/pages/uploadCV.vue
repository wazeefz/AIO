<template>
  <v-app>
    <!-- Main Header -->
    <div class="header-container">
      <h1 class="text-h4 text-center py-6" style="color: #d9c6a5">
        Employee CV Upload
      </h1>
    </div>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="pa-4">
              <v-card-title
                class="text-h6"
                style="background-color: #d9c6a5; color: white"
              >
                CV Upload
              </v-card-title>

              <v-card-text>
                <v-alert
                  type="info"
                  variant="tonal"
                  border="start"
                  class="mb-4"
                >
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-information</v-icon>
                  </template>
                  <div class="alert-content">
                    <span style="font-size: smaller"
                      >Some information will be extracted automatically from the
                      CV uploaded</span
                    >
                  </div>
                </v-alert>

                <FileUpload
                  title=""
                  :accepted-formats="acceptedFormats"
                  :max-size="maxFileSize"
                  @file-selected="handleFileSelected"
                  @file-removed="handleFileRemoved"
                  @error="handleError"
                  :onFileUpload="uploadToServer"
                />
              </v-card-text>

              <v-card-actions class="mt-4">
                <v-spacer></v-spacer>
                <v-btn
                  style="background-color: #d9c6a5; color: white"
                  :disabled="!hasUploadedFile"
                  @click="handleContinue"
                >
                  Continue
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import FileUpload from '@/components/fileUpload'

// Constants
const maxFileSize = 5
const acceptedFormats = ['.pdf', '.docx']

// State
const hasUploadedFile = ref(false)
const uploadedFile = ref(null)
const showCVPreview = ref(false)
const cvPreviewUrl = ref(null)

// Methods
const handleFileSelected = (file) => {
  hasUploadedFile.value = true
  uploadedFile.value = file
  cvPreviewUrl.value = URL.createObjectURL(file)
}

const handleFileRemoved = () => {
  hasUploadedFile.value = false
  uploadedFile.value = null
  if (cvPreviewUrl.value) {
    URL.revokeObjectURL(cvPreviewUrl.value)
    cvPreviewUrl.value = null
  }
}

const handleError = (error) => {
  console.error('Upload error:', error)
}

const uploadToServer = async (file) => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('File uploaded to server')
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  }
}

const previewCV = () => {
  showCVPreview.value = true
}

const handleContinue = () => {
  // Store CV data in localStorage
  const cvData = {
    file: uploadedFile.value,
    previewUrl: cvPreviewUrl.value,
    fileName: uploadedFile.value.name,
    fileSize: uploadedFile.value.size,
  }
  localStorage.setItem(
    'cvData',
    JSON.stringify({
      fileName: cvData.fileName,
      fileSize: cvData.fileSize,
    })
  )

  // Store the file blob/URL separately
  localStorage.setItem('cvPreviewUrl', cvPreviewUrl.value)
  window.location.href = '/employeeInfo'
}

// Utility Functions
const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  return ext === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-file-document'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Cleanup
onBeforeUnmount(() => {
  if (cvPreviewUrl.value) {
    URL.revokeObjectURL(cvPreviewUrl.value)
  }
})
</script>

<style scoped>
.header-container {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.cv-preview-frame {
  width: 100%;
  height: 700px;
  border: none;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-btn) {
  text-transform: none;
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 8px;
  }

  .v-btn {
    width: 100%;
  }
}
</style>
