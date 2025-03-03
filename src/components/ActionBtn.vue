<template>
  <div class="d-flex justify-end mb-4">
    <v-card
      class="action-buttons-card d-inline-flex align-center"
      rounded="pill"
      color="#EAE3D6"
      elevation="0"
    >
      <!-- Add Button -->
      <AddBtn :isEditing="isEditing" @click="$emit('add-profile')" />

      <!-- Divider -->
      <v-divider
        v-if="isEditing"
        vertical
        class="mx-2"
        color="#292D32"
      ></v-divider>

      <!-- Edit Button -->
      <EditBtn
        :isEditingInitial="isEditing"
        @edit-toggled="$emit('edit-toggled', $event)"
      />

      <!-- Divider -->
      <v-divider vertical class="mx-2" color="#292D32"></v-divider>

      <!-- Filter Button -->
      <FilterBtn @click="$emit('filter-toggled')" />
    </v-card>
  </div>
</template>

<script setup>
import AddBtn from './AddBtn.vue'
import EditBtn from './EditBtn.vue'
import FilterBtn from './FilterBtn.vue'

defineProps({
  isEditing: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['add-profile', 'edit-toggled', 'filter-toggled'])
</script>

<style scoped>
.action-buttons-card {
  padding: 4px 8px;
  background: linear-gradient(
    150deg,
    #e0d5c5 3%,
    #f5eee6 23%,
    #e0d5c5 60%,
    #b1a184 90%,
    #8a7460 95%
  ) !important;
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
