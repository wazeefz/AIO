<!-- RemoveBtn.vue -->

<template>
  <div class="profile-card-container">
    <!-- Remove Button with confirmation dialog -->
    <v-btn
      v-if="isEditing && !selectable"
      icon="mdi-close"
      variant="text"
      size="small"
      :class="remove - button"
      @click.stop="confirmRemove"
    >
    </v-btn>
    <!-- <button :class="remove - button" @click.stop="confirmRemove">×</button> -->
    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="415">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6"> Confirm Removal </v-card-title>
        <v-card-text> Are you sure you want to remove this item? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" text @click="confirmAndRemove"> Remove </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isEditing: {
    type: Boolean,
    default: true,
  },
  customClass: {
    type: String,
    default: 'default-remove-button',
  },
  useDefaultStyle: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['remove'])

const showConfirmDialog = ref(false)

const confirmRemove = () => {
  showConfirmDialog.value = true
}

const confirmAndRemove = () => {
  showConfirmDialog.value = false
  emit('remove') // Emit the remove event
}
</script>

<style scoped>
.profile-card-container {
  position: relative;
}

.remove-button.default-remove-button {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 2;
  background-color: #ff5252;
  border: 2px solid white;
  transition: transform 0.2s ease;
}

.remove-button.default-remove-button:hover {
  transform: scale(1.1);
}
</style>
