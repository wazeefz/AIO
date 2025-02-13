<template>
  <v-btn v-if="isEditing" icon :color="color" @click="handleClick">
    <v-icon>{{ icon }}</v-icon>
  </v-btn>
</template>

<script setup>
const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'green',
  },
  icon: {
    type: String,
    default: 'mdi-plus',
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>
