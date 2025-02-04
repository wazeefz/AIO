<template>
  <div class="d-flex justify-end mb-4">
    <v-card
      class="action-buttons-card d-inline-flex align-center"
      rounded="pill"
      color="#EAE3D6"
      elevation="0"
    >
      <!-- Add Button -->
      <AddButton :isEditing="isEditing" @click="openAddProfileModal" />

      <!-- Divider -->
      <v-divider
        v-if="isEditing"
        vertical
        class="mx-2"
        color="#292D32"
      ></v-divider>

      <!-- Edit Button -->
      <EditButton
        :isEditingInitial="isEditing"
        @edit-toggled="handleEditToggle"
      />

      <!-- Divider -->
      <v-divider vertical class="mx-2" color="#292D32"></v-divider>

      <!-- Filter Button -->
      <FilterButton @click="toggleFilter" />
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AddButton from '@/components/items/AddButton.vue'
import EditButton from '@/components/items/EditButton.vue'
import FilterButton from '@/components/items/FilterButton.vue'

const isEditing = ref(false)
const showAddProfileModal = ref(false)
const showFilterDialog = ref(false)

const openAddProfileModal = () => {
  showAddProfileModal.value = true
}

const handleEditToggle = (editingState) => {
  isEditing.value = editingState
}

const toggleFilter = () => {
  showFilterDialog.value = true
}
</script>

<style scoped>
.action-buttons-card {
  padding: 4px 8px;
}

.custom-edit-btn {
  height: 40px;
  width: 40px;
}

:deep(.v-btn) {
  box-shadow: none !important;
}

:deep(.v-btn:hover) {
  opacity: 0.8;
}

:deep(.v-divider) {
  border-color: #292d32 !important;
  opacity: 0.5;
}

:deep(.v-btn--icon) {
  background: transparent;
}

:deep(.v-btn--icon.custom-edit-btn .v-btn__content) {
  border-radius: 50%;
  background-color: currentColor;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.v-btn--icon .v-icon) {
  z-index: 1;
}
</style>
