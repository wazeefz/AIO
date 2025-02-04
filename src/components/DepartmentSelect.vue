<template>
  <v-select
    v-model="selectedDepartment"
    :items="departments"
    label="Department"
    hide-details
    density="compact"
  ></v-select>
</template>

<script setup>
import { ref, watch } from 'vue'

const departments = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'HR',
]

const selectedDepartment = ref('')

const emit = defineEmits(['update:department'])

watch(selectedDepartment, (newValue) => {
  emit('update:department', newValue)
})
</script>
