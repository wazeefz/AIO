<template>
  <v-card-text class="text-center pa-6">
    <!-- Profile Picture Section -->
    <section class="mb-8">
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
    </section>

    <!-- CV Preview Section -->
    <section class="mb-8">
      <h3 class="section-title mb-4">Uploaded CV</h3>
      <div :class="['cv-preview', { 'cv-preview-section': uploadedCV?.file }]">
        <template v-if="uploadedCV?.file">
          <div class="d-flex align-center mb-4">
            <v-icon
              :icon="getFileIcon(uploadedCV?.name)"
              color="#B1A184"
              class="mr-2"
              size="32"
            />
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
        </template>
        <v-btn
          v-else
          block
          variant="outlined"
          color="#B1A184"
          prepend-icon="mdi-upload"
          @click="$emit('back')"
        >
          Upload CV First
        </v-btn>
      </div>
    </section>

    <!-- Progress Section -->
    <section class="progress-section mb-8">
      <h3 class="section-title mb-4">Completion Status</h3>
      <v-progress-linear
        :model-value="completionProgress"
        color="#B1A184"
        height="20"
        rounded
        striped
      >
        <template v-slot:default="{ value }">
          <span class="progress-text">{{ Math.ceil(value) }}% Complete</span>
        </template>
      </v-progress-linear>
      <div class="text-caption text-grey mt-2">
        Complete all required fields to proceed
      </div>
    </section>

    <!-- Navigation Section -->
    <section class="navigation-section">
      <v-list density="compact" class="py-4">
        <v-list-item class="side-nav-header mb-4 px-4">
          Form Sections
        </v-list-item>

        <v-divider class="mb-2" />

        <div class="d-flex justify-space-around px-4 mb-4">
          <v-btn
            color="#B1A184"
            size="small"
            variant="outlined"
            @click="$emit('expand-all')"
            class="flex-grow-1 mr-2"
          >
            <v-icon left size="small">mdi-unfold-more-horizontal</v-icon>
            Expand All
          </v-btn>
          <v-btn
            color="#B1A184"
            size="small"
            variant="outlined"
            @click="$emit('collapse-all')"
            class="flex-grow-1"
          >
            <v-icon left size="small">mdi-unfold-less-horizontal</v-icon>
            Collapse All
          </v-btn>
        </div>

        <v-list-item
          v-for="(section, index) in sections"
          :key="index"
          :class="getSectionClass(section)"
          @click="$emit('section-click', section.value)"
          link
          class="mx-2 rounded"
        >
          <template v-slot:prepend>
            <v-icon :icon="section.icon" color="#B1A184" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2">
            {{ section.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </section>
  </v-card-text>
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
  sections: {
    type: Array,
    required: true,
  },
  expandedPanels: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'preview',
  'back',
  'expand-all',
  'collapse-all',
  'section-click',
])

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

const getSectionClass = (section) => ({
  'active-section': props.expandedPanels[section.value] === 0,
  'mb-1': true,
})
</script>

<style scoped>
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
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.side-nav-header {
  color: #b1a184;
  border-bottom: 2px solid #f5f0e8;
}

.active-section {
  background-color: #f5f0e8 !important;
  color: #b1a184 !important;
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

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 960px) {
  .section-title {
    font-size: 1rem;
  }
}
</style>
