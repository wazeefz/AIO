<template>
  <div class="fixed-header">
    <div class="d-flex align-center justify-space-between px-6 py-4">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        @click="handleBack"
        color="grey-darken-1"
      >
        Back
      </v-btn>
      <v-btn color="#B1A184" :loading="isSubmitting" @click="$emit('submit')">
        {{ isEditMode ? 'Update' : 'Save' }}
      </v-btn>
    </div>
    <v-divider></v-divider>
  </div>
</template>

<script setup>
const props = defineProps({
  isSubmitting: Boolean,
  isEditMode: Boolean,
})

const emit = defineEmits(['back', 'submit'])

const handleBack = () => {
  emit('back')
}
</script>

<style scoped>
.fixed-header {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 100;
  margin-bottom: 24px;
}

:deep(.v-btn) {
  text-transform: none;
}
</style>
