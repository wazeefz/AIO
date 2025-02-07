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
              <!-- Single Upload Tab -->
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

              <!-- Bulk Upload Tab -->
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

            <!-- Upload Area -->
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
                    :multiple="activeTab === 'bulk'"
                    ref="fileInput"
                  />
                </div>
              </v-sheet>

              <div class="d-flex justify-space-between align-center mt-2">
                <div
                  v-if="activeTab === 'bulk'"
                  class="text-caption text-grey-darken-1"
                >
                  ** Upload multiple CVs, maximum 10 CVs
                </div>
              </div>

              <!-- Upload Progress -->
              <div v-if="uploadedFiles.length > 0" class="mt-4">
                <div class="text-subtitle-1 mb-2">Upload Progress:</div>
                <v-card
                  v-for="(file, index) in uploadedFiles"
                  :key="index"
                  class="mb-2 pa-2"
                  variant="outlined"
                >
                  <v-row align="center" no-gutters>
                    <v-col cols="auto" class="mr-2">
                      <v-icon
                        :icon="getFileIcon(file.name)"
                        color="grey"
                      ></v-icon>
                    </v-col>
                    <v-col>
                      <div class="text-body-2">{{ file.name }}</div>

                      <v-progress-linear
                        v-if="file.status !== 'error' && file.status !== 'done'"
                        :model-value="file.progress"
                        height="20"
                        :color="progressColor"
                        class="rounded-lg"
                      >
                        <template v-slot:default="{ value }">
                          <div class="progress-container">
                            <strong class="progress-text"
                              >{{ Math.ceil(value) }}%</strong
                            >
                          </div>
                        </template>
                      </v-progress-linear>

                      <div
                        v-if="file.status === 'done'"
                        class="text-success d-flex align-center"
                      >
                        <v-icon color="success" size="small" class="mr-1"
                          >mdi-check</v-icon
                        >
                        <span>Done</span>
                        <span class="text-caption text-grey-darken-1 ml-2">
                          ({{ formatFileSize(file.file.size) }})
                        </span>
                      </div>
                      <div v-if="file.status === 'error'" class="text-error">
                        <v-icon color="error" size="small">mdi-alert</v-icon>
                        Error
                      </div>
                    </v-col>
                    <v-col cols="auto" class="d-flex">
                      <v-btn
                        v-if="file.status === 'done'"
                        icon="mdi-eye"
                        variant="text"
                        :color="primaryColor"
                        size="small"
                        @click="previewFile(file)"
                        class="mr-2"
                      ></v-btn>
                      <v-btn
                        v-if="file.status !== 'uploading'"
                        icon="mdi-delete"
                        variant="text"
                        color="error"
                        size="small"
                        @click="removeFile(index)"
                      ></v-btn>
                      <v-btn
                        v-else
                        icon="mdi-refresh"
                        variant="text"
                        size="small"
                        @click="retryUpload(index)"
                      ></v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-card-text>

            <!-- Actions -->
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                v-if="activeTab === 'single'"
                :color="primaryColor"
                :disabled="!hasCompletedUploads || uploadedFiles.length > 1"
                @click="handleContinue('single')"
              >
                Continue to Employee Info
              </v-btn>
              <v-btn
                v-else
                :color="primaryColor"
                :disabled="!hasCompletedUploads || uploadedFiles.length === 0"
                @click="handleContinue('bulk')"
              >
                Continue to Bulk Processing
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Preview Dialog -->
    <v-dialog v-model="previewDialog" max-width="900px" scrollable>
      <v-card>
        <v-card-title
          class="d-flex justify-space-between align-center"
          :style="{ backgroundColor: primaryColor, color: 'white' }"
        >
          Preview: {{ selectedFile?.name }}
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            @click="closePreview"
          ></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="preview-content pa-0">
          <iframe v-if="isPDF" :src="previewUrl" class="pdf-preview"></iframe>
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

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const primaryColor = '#B1A184'
const progressColor = '#B1A184'
const activeTab = ref('single')
const isDragging = ref(false)
const uploadedFiles = ref([])
const fileInput = ref(null)
const acceptedFormats = ['.pdf', '.docx']
const previewDialog = ref(false)
const selectedFile = ref(null)
const previewUrl = ref(null)
const showError = ref(false)
const errorMessage = ref('')

const formatList = computed(() => acceptedFormats.join(' and '))

const hasCompletedUploads = computed(() =>
  uploadedFiles.value.some((file) => file.status === 'done')
)

const isPDF = computed(
  () => selectedFile.value?.file.type === 'application/pdf'
)

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const switchTab = (tab) => {
  if (tab !== activeTab.value) {
    activeTab.value = tab
    uploadedFiles.value = []
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
  }
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  processFiles(files)
}

const handleFileSelect = (e) => {
  const files = e.target.files
  processFiles(files)
}

const processFiles = (files) => {
  if (
    activeTab.value === 'single' &&
    (files.length > 1 || uploadedFiles.value.length > 0)
  ) {
    showErrorMessage('Only one file can be uploaded in single upload mode')
    return
  }

  if (
    activeTab.value === 'bulk' &&
    files.length + uploadedFiles.value.length > 10
  ) {
    showErrorMessage('Maximum 10 files allowed for bulk upload')
    return
  }

  Array.from(files).forEach((file) => {
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!acceptedFormats.includes(fileExtension)) {
      showErrorMessage(`File ${file.name} has invalid format`)
      return
    }

    uploadedFiles.value.push({
      file,
      name: file.name,
      progress: 0,
      status: 'uploading',
    })

    simulateUpload(uploadedFiles.value.length - 1)
  })
}

const simulateUpload = (fileIndex) => {
  const file = uploadedFiles.value[fileIndex]
  let progress = 0

  const interval = setInterval(() => {
    progress += 10
    if (progress <= 100) {
      file.progress = progress
      if (progress === 100) {
        file.status = 'done'
        clearInterval(interval)
      }
    }
  }, 500)
}

const removeFile = (index) => {
  const file = uploadedFiles.value[index]
  if (file === selectedFile.value) {
    closePreview()
  }
  uploadedFiles.value.splice(index, 1)
}

const retryUpload = (index) => {
  uploadedFiles.value[index].progress = 0
  uploadedFiles.value[index].status = 'uploading'
  simulateUpload(index)
}

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  return ext === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-file-document'
}

const previewFile = (file) => {
  selectedFile.value = file
  if (file.file.type === 'application/pdf') {
    previewUrl.value = URL.createObjectURL(file.file)
  }
  previewDialog.value = true
}

const closePreview = () => {
  previewDialog.value = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  selectedFile.value = null
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
}

const handleContinue = (mode) => {
  if (mode === 'single') {
    window.location.href = '/upload-cv/employee-info'
  } else {
    window.location.href = '/upload-cv/bulk-processing'
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<style>
.upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.upload-tabs-container {
  border-radius: 8px;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.tab-button {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0;
  height: 100%;
}

.active-tab {
  background-color: #b1a184 !important;
  color: white;
}

.upload-area {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  background-color: white;
  position: relative;
  transition: all 0.3s ease;
}

.upload-area.drag-over {
  border-color: #b1a184;
  background-color: #f8f8f8;
}

.upload-placeholder {
  text-align: center;
  position: relative;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
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

.progress-text {
  color: white;
  font-size: 0.75rem;
}

:deep(.v-btn) {
  text-transform: none;
}
</style>
