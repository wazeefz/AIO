<template>
  <v-btn
    :color="isEditing ? editColor : defaultColor"
    class="custom-edit-btn"
    :icon="iconOnly"
    :size="size"
    @click="toggleEdit"
  >
    <v-icon :color="iconColor">
      {{ isEditing ? closeIcon : editIcon }}
    </v-icon>
  </v-btn>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isEditingInitial: {
    type: Boolean,
    default: false,
  },
  defaultColor: {
    type: String,
    default: '#B1A184',
  },
  editColor: {
    type: String,
    default: 'error',
  },
  iconColor: {
    type: String,
    default: '#292D32',
  },
  editIcon: {
    type: String,
    default: 'mdi-pencil',
  },
  closeIcon: {
    type: String,
    default: 'mdi-close',
  },
  iconOnly: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: 'default',
  },
})

const isEditing = ref(props.isEditingInitial)

watch(
  () => props.isEditingInitial,
  (newValue) => {
    isEditing.value = newValue
  }
)

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  emit('edit-toggled', isEditing.value)
}

const emit = defineEmits(['edit-toggled'])
</script>

<style scoped>
.custom-edit-btn {
  transition: background-color 0.3s ease;
}
</style>
