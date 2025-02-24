<template>
  <v-card class="profile-picture-editor" flat>
    <v-card-text class="text-center">
      <div class="profile-container">
        <div
          class="profile-picture"
          :style="{
            backgroundImage: previewImage ? `url(${previewImage})` : 'none',
            backgroundPosition: `${position.x}px ${position.y}px`,
            backgroundSize: `${zoom}%`,
          }"
          @mousedown="startDragging"
          @mousemove="handleDrag"
          @mouseup="stopDragging"
          @mouseleave="stopDragging"
        >
          <div v-if="!previewImage" class="placeholder">
            <span v-if="firstName || lastName" class="text-h4">
              {{ getInitials(firstName, lastName) }}
            </span>
            <v-icon v-else size="32" color="grey-darken-1">mdi-account</v-icon>
          </div>

          <!-- Add remove button overlay -->
          <div v-if="previewImage" class="remove-overlay">
            <v-btn
              icon="mdi-close"
              size="small"
              color="error"
              variant="tonal"
              @click.stop="handleRemovePhoto"
              class="remove-btn"
            >
              <v-icon size="16">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <div class="controls mt-4">
        <v-slider
          v-if="previewImage"
          v-model="zoom"
          min="100"
          max="200"
          step="1"
          label="Zoom"
          hide-details
          class="mb-2"
        >
          <template v-slot:prepend>
            <v-icon>mdi-magnify-minus</v-icon>
          </template>
          <template v-slot:append>
            <v-icon>mdi-magnify-plus</v-icon>
          </template>
        </v-slider>

        <v-btn
          variant="outlined"
          prepend-icon="mdi-camera"
          @click="fileInput?.click()"
        >
          {{ previewImage ? 'Change Photo' : 'Add Photo' }}
        </v-btn>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />
      </div>
    </v-card-text>

    <!-- Confirm Remove Dialog -->
    <v-dialog v-model="showRemoveDialog" max-width="300">
      <v-card>
        <v-card-title class="text-h6">Remove Photo</v-card-title>
        <v-card-text>
          Are you sure you want to remove the current photo?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showRemoveDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="confirmRemovePhoto">
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'

const props = defineProps({
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  initialImage: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['image-changed'])

const previewImage = ref(props.initialImage)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const startPosition = ref({ x: 0, y: 0 })
const zoom = ref(100)
const fileInput = ref(null)
const showRemoveDialog = ref(false)

const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewImage.value = e.target.result
      position.value = { x: 0, y: 0 }
      zoom.value = 100
      emit('image-changed', file)
    }
    reader.readAsDataURL(file)
  }
  // Reset file input so the same file can be selected again
  event.target.value = ''
}

const handleRemovePhoto = () => {
  showRemoveDialog.value = true
}

const confirmRemovePhoto = () => {
  previewImage.value = null
  position.value = { x: 0, y: 0 }
  zoom.value = 100
  emit('image-changed', null)
  showRemoveDialog.value = false
}

const startDragging = (e) => {
  if (!previewImage.value) return
  isDragging.value = true
  startPosition.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  }
}

const handleDrag = (e) => {
  if (!isDragging.value) return
  position.value = {
    x: e.clientX - startPosition.value.x,
    y: e.clientY - startPosition.value.y,
  }
}

const stopDragging = () => {
  isDragging.value = false
}
</script>

<style>
.profile-picture-editor .profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-picture-editor .profile-picture {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f5f5f5;
  overflow: hidden;
  cursor: move;
  background-repeat: no-repeat;
  position: relative;
}

.remove-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.profile-picture:hover .remove-overlay {
  opacity: 1;
}

.remove-btn {
  background-color: rgba(255, 255, 255, 0.9) !important;
}

.profile-picture-editor .placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.profile-picture-editor .controls {
  max-width: 300px;
  margin: 0 auto;
  margin-top: 16px;
}

.text-h4 {
  color: #666;
  font-weight: 500;
}
</style>
