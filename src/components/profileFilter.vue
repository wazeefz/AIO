<template>
  <v-card class="pa-4 mb-4">
    <h3>Filters</h3>

    <!-- Department Filter -->
    <v-select
      v-model="selectedDepartment"
      :items="availableDepartments"
      label="Department"
      variant="outlined"
      density="compact"
      clearable
      class="mb-4"
    />

    <!-- Title Filter -->
    <v-select
      v-model="selectedTitle"
      :items="availableTitles"
      label="Title"
      variant="outlined"
      density="compact"
      clearable
      class="mb-4"
    />

    <!-- Salary Filter -->
    <v-text-field
      v-model="selectedSalary"
      label="Salary"
      type="number"
      variant="outlined"
      density="compact"
      clearable
      class="mb-4"
    />

    <!-- Skills Filter -->
    <v-select
      v-model="selectedSkills"
      :items="availableSkills"
      label="Skills"
      variant="outlined"
      density="compact"
      multiple
      chips
      clearable
      class="mb-4"
    />

    <!-- Apply Filters Button -->
    <v-btn color="primary" @click="applyFilters">Apply Filters</v-btn>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { mockData } from '@/mockdata/mockData'

// Local state
const selectedDepartment = ref('')
const selectedTitle = ref('')
const selectedSalary = ref('')
const selectedAvailability = ref('')
const selectedSkills = ref([])

// Get unique values for filters
const availableDepartments = computed(() => [
  ...new Set(mockData.map((profile) => profile.department)),
])

const availableTitles = computed(() => [
  ...new Set(mockData.map((profile) => profile.title)),
])

const availableSkills = computed(() => [
  ...new Set(mockData.flatMap((profile) => profile.skills)),
])

// Emit filters to parent component
const emit = defineEmits(['filter'])

const applyFilters = () => {
  const filters = {
    department: selectedDepartment.value,
    title: selectedTitle.value,
    salary: selectedSalary.value,
    skills: selectedSkills.value,
  }
  emit('filter', filters)
}
</script>

<style scoped>
/* Add custom styles here */
</style>
