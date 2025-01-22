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
            <v-icon size="40" color="grey-darken-1">mdi-account</v-icon>
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
          Change Photo
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
  </v-card>
</template>

<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['image-changed'])

const previewImage = ref(null)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const startPosition = ref({ x: 0, y: 0 })
const zoom = ref(100)
const fileInput = ref(null)

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
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: #f5f5f5;
  overflow: hidden;
  cursor: move;
  background-repeat: no-repeat;
  position: relative;
}

.profile-picture-editor .placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
}

.profile-picture-editor .controls {
  max-width: 300px;
  margin: 0 auto;
}
</style>
