<template>
  <!-- Main Header -->
  <div class="header-container">
    <h1 class="text-h4 text-center py-6" style="color: #d9c6a5">
      Employee CV Upload
    </h1>
  </div>

  <!-- To extract and send data to backend -->
  <v-overlay v-model="isExtracting" class="align-center justify-center">
    <v-progress-circular
      indeterminate
      color="#d9c6a5"
      size="64"
    ></v-progress-circular>
    <div class="mt-4 text-center">Extracting resume information...</div>
  </v-overlay>

  <v-row justify="center pa-6">
    <v-col cols="12" sm="8" md="6" lg="4">
      <v-card class="pa-4">
        <v-card-title
          class="text-h6"
          style="background-color: #d9c6a5; color: white"
        >
          CV Upload
        </v-card-title>

        <v-card-text>
          <v-alert type="info" variant="tonal" border="start" class="mb-4">
            <template v-slot:prepend>
              <v-icon color="info">mdi-information</v-icon>
            </template>
            <div class="alert-content">
              <span style="font-size: smaller"
                >Some information will be extracted automatically from the CV
                uploaded</span
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
            class="bg-primaryBrown"
            :disabled="false"
            @click="handleContinue"
          >
            <!-- <v-btn
            style="background-color: #d9c6a5; color: white"
            :disabled="!hasUploadedFile"
            @click="handleContinue"
          > -->
            Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
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
const isExtracting = ref(false)

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
  isExtracting.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('http://localhost:8000/summarize_resume', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to extract resume data')
    }

    const extractedData = await response.json()

    // Create a blob URL from the file
    const fileBlob = new Blob([file], { type: file.type })
    const blobUrl = URL.createObjectURL(fileBlob)

    // Store the extracted data, CV info, and blob URL in localStorage
    localStorage.setItem('extractedResumeData', JSON.stringify(extractedData))
    localStorage.setItem('cvBlob', blobUrl)
    localStorage.setItem(
      'cvData',
      JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })
    )

    return extractedData
  } catch (error) {
    console.error('Upload failed:', error)
    throw error
  } finally {
    isExtracting.value = false
  }
}

const previewCV = () => {
  showCVPreview.value = true
}

const handleContinue = () => {
  // Store CV data in localStorage
  //   const cvData = {
  //     file: uploadedFile.value,
  //     previewUrl: cvPreviewUrl.value,
  //     fileName: uploadedFile.value.name,
  //     fileSize: uploadedFile.value.size,
  //   }
  //   localStorage.setItem(
  //     'cvData',
  //     JSON.stringify({
  //       fileName: cvData.fileName,
  //       fileSize: cvData.fileSize,
  //     })
  //   )

  // Store the file blob/URL separately
  //   localStorage.setItem('cvPreviewUrl', cvPreviewUrl.value)
  window.location.href = '/upload-cv/employee-info'
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
