<template>
  <v-card class="file-upload-container" flat>
    <v-card-title class="text-subtitle-1 text-grey-darken-1">
      {{ title }}
    </v-card-title>

    <v-card-text>
      <v-sheet
        class="upload-area"
        :class="{ 'drag-over': isDragging }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
        border
        rounded
      >
        <div v-if="!uploadedFile" class="upload-placeholder">
          <v-icon size="large" color="#d9c6a5" icon="mdi-cloud-upload"></v-icon>
          <p class="text-body-2 mt-2">
            Click or drag file to this area to upload
          </p>
          <input
            type="file"
            class="file-input"
            @change="handleFileSelect"
            :accept="acceptedFormats.join(',')"
            ref="fileInput"
          />
        </div>

        <v-list v-else density="compact" class="bg-grey-lighten-4">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon :icon="fileTypeIcon" color="#d9c6a5"></v-icon>
            </template>

            <v-list-item-title style="font-size: 14px">{{
              uploadedFile.name
            }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption text-grey">{{
              formatFileSize(uploadedFile.size)
            }}</v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="removeFile"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-sheet>

      <v-card-text class="text-caption text-grey-darken-1">
        Formats accepted are: {{ formatList }}
      </v-card-text>

      <v-row v-if="uploadedFile" justify="center" class="mt-2">
        <v-col cols="12" sm="auto">
          <v-btn
            prepend-icon="mdi-eye"
            style="background-color: #d9c6a5; color: white"
            @click="showPreview"
            class="mr-2"
          >
            Preview File
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Preview Dialog -->
    <v-dialog v-model="isPreviewOpen" max-width="900px" scrollable>
      <v-card>
        <v-card-title
          class="d-flex justify-space-between align-center"
          style="background-color: #d9c6a5"
        >
          Preview: {{ uploadedFile?.name }}
          <v-btn icon="mdi-close" variant="text" @click="closePreview"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="preview-content">
          <!-- PDF Preview -->
          <iframe
            v-if="isPDF"
            :src="filePreviewUrl"
            class="pdf-preview"
          ></iframe>

          <!-- Image Preview -->
          <v-img
            v-else-if="isImage"
            :src="filePreviewUrl"
            class="image-preview"
            contain
            max-height="700"
          ></v-img>

          <!-- Fallback for non-previewable files -->
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
              This file type cannot be previewed directly.
            </p>
            <v-btn prepend-icon="mdi-download" @click="downloadFile">
              Download to View
            </v-btn>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'File Upload',
  },
  acceptedFormats: {
    type: Array,
    default: () => ['.pdf', '.docx'],
  },
  maxSize: {
    type: Number,
    default: 10,
  },
  onFileUpload: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['file-selected', 'file-removed', 'error'])

const isDragging = ref(false)
const uploadedFile = ref(null)
const isPreviewOpen = ref(false)
const filePreviewUrl = ref(null)
const showError = ref(false)
const errorMessage = ref('')
const fileInput = ref(null)

const formatList = computed(() => props.acceptedFormats.join(' and '))

const isPDF = computed(() => uploadedFile.value?.type === 'application/pdf')

const isImage = computed(() => uploadedFile.value?.type.startsWith('image/'))

const fileTypeIcon = computed(() => {
  if (isPDF.value) return 'mdi-file-pdf-box'
  if (isImage.value) return 'mdi-file-image'
  return 'mdi-file-document-outline'
})

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length) {
    processFile(files[0])
  }
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length) {
    processFile(files[0])
  }
}

const processFile = (file) => {
  if (file.size > props.maxSize * 1024 * 1024) {
    showErrorMessage(`File size should not exceed ${props.maxSize}MB`)
    return
  }

  const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
  if (!props.acceptedFormats.includes(fileExtension)) {
    showErrorMessage('Invalid file format')
    return
  }

  uploadedFile.value = file
  emit('file-selected', file)

  if (props.onFileUpload) {
    props.onFileUpload(file)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
  emit('error', message)
}

const removeFile = () => {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
  uploadedFile.value = null
  filePreviewUrl.value = null
  fileInput.value.value = ''
  emit('file-removed')
}

const showPreview = () => {
  filePreviewUrl.value = URL.createObjectURL(uploadedFile.value)
  isPreviewOpen.value = true
}

const closePreview = () => {
  isPreviewOpen.value = false
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
    filePreviewUrl.value = null
  }
}

const downloadFile = () => {
  if (uploadedFile.value) {
    const url = URL.createObjectURL(uploadedFile.value)
    const a = document.createElement('a')
    a.href = url
    a.download = uploadedFile.value.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

onBeforeUnmount(() => {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
})
</script>

<style>
.file-upload-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-placeholder {
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
  overflow: auto;
}

.pdf-preview {
  width: 100%;
  height: 700px;
  border: none;
}
</style>
