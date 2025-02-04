<template>
  <v-text-field
    v-model="title"
    label="E.g. Lead Developer"
    hide-details
    density="compact"
  ></v-text-field>
</template>

<script setup>
import { ref, watch } from 'vue'

const title = ref('')

const emit = defineEmits(['update:title'])

watch(title, (newValue) => {
  emit('update:title', newValue)
})
</script>
