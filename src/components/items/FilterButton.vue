<template>
  <v-btn :icon="iconOnly" @click="handleClick">
    <v-icon :color="iconColor">mdi-tune-vertical</v-icon>
  </v-btn>
</template>

<script setup>
const props = defineProps({
  iconColor: {
    type: String,
    default: '#292D32',
  },
  iconOnly: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>
