<template>
  <v-card class="profile-card">
    <!-- Edit buttons in absolute position -->
    <div v-if="isEditing" class="edit-buttons">
      <v-btn color="success" class="mr-2" icon small @click="handleAdd">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <v-btn color="error" icon small @click="handleRemove">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>

    <!-- Your existing profile card content -->
    <div class="profile-content">
      <!-- Your existing content here -->
    </div>
  </v-card>
</template>

<script setup>
defineProps({
  result: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['add', 'remove'])

const handleAdd = () => {
  emit('add')
}

const handleRemove = () => {
  emit('remove')
}
</script>

<style scoped>
.profile-card {
  position: relative;
  margin-bottom: 1rem;
}

.edit-buttons {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.profile-content {
  padding: 16px;
}
</style>
