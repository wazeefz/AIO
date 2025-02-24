<template>
  <v-card class="mb-4 sticky-sidebar" style="overflow: visible">
    <v-card-text class="text-center pa-6">
      <!-- Profile Picture Section -->
      <div class="profile-section mb-8">
        <h3 class="section-title mb-4">Profile Picture</h3>
        <div class="profile-container">
          <ProfilePictureEditor
            ref="profileEditor"
            @image-changed="handleProfileImageChange"
            :initial-image="modelValue.profilePic"
            :first-name="modelValue.firstName"
            :last-name="modelValue.lastName"
          />
        </div>
      </div>

      <!-- CV Preview Section -->
      <div class="cv-section mb-8">
        <h3 class="section-title mb-4">Uploaded CV</h3>
        <div v-if="uploadedCV?.file" class="cv-preview-section">
          <div class="d-flex align-center mb-4">
            <v-icon
              :icon="getFileIcon(uploadedCV?.name)"
              color="#B1A184"
              class="mr-2"
              size="32"
            ></v-icon>
            <div class="text-left">
              <div
                class="text-subtitle-2 text-truncate"
                style="max-width: 180px"
              >
                {{ uploadedCV?.name }}
              </div>
              <div class="text-caption text-grey">
                {{ formatFileSize(uploadedCV?.file?.size || 0) }}
              </div>
            </div>
          </div>
          <v-btn
            block
            variant="outlined"
            prepend-icon="mdi-eye"
            @click="$emit('preview')"
            class="mb-2"
          >
            Preview CV
          </v-btn>
          <v-btn
            block
            variant="outlined"
            color="#B1A184"
            prepend-icon="mdi-upload"
            @click="$emit('back')"
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
            @click="$emit('back')"
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
</template>

<script setup>
import { ref } from 'vue'
import ProfilePictureEditor from './ProfilePictureEditor.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  uploadedCV: {
    type: Object,
    default: () => ({
      file: null,
      name: '',
      url: '',
    }),
  },
  completionProgress: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'preview', 'back'])

const handleProfileImageChange = (imageData) => {
  emit('update:modelValue', {
    ...props.modelValue,
    profilePic: imageData,
  })
}

const getFileIcon = (filename) => {
  if (!filename) return 'mdi-file-document-outline'
  const ext = filename.split('.').pop().toLowerCase()
  return ext === 'pdf' ? 'mdi-file-pdf-box' : 'mdi-file-document'
}

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 88px;
  height: fit-content;
  background-color: white;
}

.section-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 500;
  border-bottom: 2px solid #b1a184;
  padding-bottom: 8px;
  text-align: left;
}

.cv-preview-section {
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.progress-text {
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
}

@media (max-width: 960px) {
  .sticky-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 24px;
  }
}
</style>
