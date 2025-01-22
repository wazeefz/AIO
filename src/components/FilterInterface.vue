<!-- components/FilterInterface.vue -->
<template>
  <v-card class="pa-4">
    <h3>Filters</h3>

    <!-- Skills Filter -->
    <div class="mb-4">
      <h4>Skills</h4>
      <v-select
        v-model="selectedSkills"
        :items="availableSkills"
        label="Select skills"
        variant="outlined"
        density="compact"
        multiple
        chips
        clearable
        @update:modelValue="handleSkillsChange"
      />
    </div>

    <!-- Salary Range Filter -->
    <div class="mb-4">
      <h4>Salary Range</h4>
      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="salaryMin"
            label="Min (RM)"
            type="number"
            variant="outlined"
            density="compact"
            @update:modelValue="handleSalaryChange"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="salaryMax"
            label="Max (RM)"
            type="number"
            variant="outlined"
            density="compact"
            @update:modelValue="handleSalaryChange"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Title Filter (replaced Role Filter) -->
    <div class="mb-4">
      <h4>Search Title</h4>
      <v-text-field
        v-model="title"
        label="Search job titles"
        variant="outlined"
        density="compact"
        @update:modelValue="handleTitleChange"
        clearable
      />
    </div>

    <!-- Department Filter -->
    <div class="mb-4">
      <h4>Department</h4>
      <v-select
        v-model="selectedDepartments"
        :items="availableDepartments"
        label="Select departments"
        variant="outlined"
        density="compact"
        multiple
        chips
        clearable
        @update:modelValue="handleDepartmentChange"
      />
    </div>

    <!-- Employment Filter -->
    <div class="mb-4">
      <h4>Employment Type</h4>
      <v-select
        v-model="selectedEmployment"
        :items="availableEmploymentTypes"
        label="Select employment type"
        variant="outlined"
        density="compact"
        multiple
        chips
        clearable
        @update:modelValue="handleEmploymentChange"
      />
    </div>

    <!-- Clear Filters Button -->
    <v-btn
      color="error"
      variant="outlined"
      @click="clearAllFilters"
      class="mt-4"
    >
      Clear All Filters
    </v-btn>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { mockData } from '@/mockdata/mockData'

const filterStore = useFilterStore()

// Local state
const selectedSkills = ref([])
const salaryMin = ref('')
const salaryMax = ref('')
const salaryError = ref('') //For wrong salary input
const title = ref('')
const selectedDepartments = ref([])
const selectedEmployment = ref([])

// Validating salary input
const validateSalary = () => {
  // Clear previous error
  salaryError.value = ''

  // Convert to numbers for comparison
  const min = Number(salaryMin.value)
  const max = Number(salaryMax.value)

  // Check if both values exist and max is less than min
  if (min && max && max < min) {
    salaryError.value = 'Max salary cannot be less than min salary'
    return false
  }

  // Check for negative values
  if (min < 0 || max < 0) {
    salaryError.value = 'Salary cannot be negative'
    return false
  }

  // Check for valid numbers
  if ((min && isNaN(min)) || (max && isNaN(max))) {
    salaryError.value = 'Please enter valid numbers'
    return false
  }

  return true
}

// Get unique skills from mockData
const availableSkills = [
  ...new Set(mockData.flatMap((item) => item.skills)),
].sort()

// Handle Skills Change
const handleSkillsChange = () => {
  filterStore.clearFilters('skills')
  if (selectedSkills.value.length > 0) {
    selectedSkills.value.forEach((skill) => {
      filterStore.addFilter('skills', skill)
    })
  }
}

// Get unique departments from mockData
const availableDepartments = [
  ...new Set(mockData.map((item) => item.department)),
].sort()

// Add this to get unique employment types
const availableEmploymentTypes = [
  ...new Set(mockData.map((item) => item.employment)),
].sort()

// Handle Department Change
const handleDepartmentChange = () => {
  filterStore.clearFilters('department')
  if (selectedDepartments.value.length > 0) {
    selectedDepartments.value.forEach((dept) => {
      filterStore.addFilter('department', dept)
    })
  }
}

// Handle Salary Change
const handleSalaryChange = () => {
  filterStore.clearFilters('salary')

  // If both fields are empty, clear the filter
  if (!salaryMin.value && !salaryMax.value) {
    return
  }

  // Validate the salary range
  if (!validateSalary()) {
    return
  }
  // Only add filter if validation passes
  if (salaryMin.value && salaryMax.value) {
    const range = `RM${salaryMin.value}-RM${salaryMax.value}`
    filterStore.addFilter('salary', range)
  } else if (salaryMin.value) {
    filterStore.addFilter('salary', `RM${salaryMin.value}+`)
  } else if (salaryMax.value) {
    filterStore.addFilter('salary', `Up to RM${salaryMax.value}`)
  }
}

// Handle Title Change
const handleTitleChange = () => {
  filterStore.clearFilters('title')
  if (title.value.trim()) {
    filterStore.addFilter('title', title.value.trim())
  }
}

// Handle Employment Change
const handleEmploymentChange = () => {
  filterStore.clearFilters('employment')
  if (selectedEmployment.value.length > 0) {
    selectedEmployment.value.forEach((type) => {
      filterStore.addFilter('employment', type)
    })
  }
}

// Clear all filters
const clearAllFilters = () => {
  filterStore.clearFilters()
  selectedSkills.value = []
  salaryMin.value = ''
  salaryMax.value = ''
  title.value = ''
  selectedDepartments.value = []
  selectedEmployment.value = []
}

// Watch store changes to update local state
// Watch for all filters except salary
watch(
  () => ({
    skills: filterStore.filters.skills,
    title: filterStore.filters.title,
    department: filterStore.filters.department,
    employment: filterStore.filters.employment,
  }),
  (newFilters) => {
    // Update skills selection [old one only returned value]
    selectedSkills.value = newFilters.skills

    // Update title
    title.value = newFilters.title[0] || ''

    // Update departments
    selectedDepartments.value = newFilters.department

    // Update employment
    selectedEmployment.value = newFilters.employment
  },
  { deep: true }
)

// Separate watcher for salary
watch(
  () => filterStore.filters.salary,
  (newSalary) => {
    if (newSalary.length === 0) {
      salaryMin.value = ''
      salaryMax.value = ''
      salaryError.value = ''
    } else {
      const salaryFilter = newSalary[0]
      if (salaryFilter.includes('-')) {
        const [min, max] = salaryFilter
          .replace(/[^\d-]/g, '')
          .split('-')
          .map(Number)
        salaryMin.value = min
        salaryMax.value = max
      } else if (salaryFilter.includes('+')) {
        salaryMin.value = salaryFilter.replace(/[^\d]/g, '')
        salaryMax.value = ''
      } else {
        salaryMax.value = salaryFilter.replace(/[^\d]/g, '')
        salaryMin.value = ''
      }
    }
  },
  { deep: true }
)
</script>
