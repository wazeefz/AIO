<template>
  <v-select
    v-model="selectedType"
    :items="employmentTypes"
    label="Employment"
    hide-details
    density="compact"
  ></v-select>
</template>

<script setup>
import { ref, watch } from 'vue'

const employmentTypes = ['Full time', 'Part time', 'Contract', 'Freelance']

const selectedType = ref('Full time')

const emit = defineEmits(['update:type'])

watch(selectedType, (newValue) => {
  emit('update:type', newValue)
})
</script>
