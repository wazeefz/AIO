<template>
  <v-card class="pa-4">
    <!-- Close button at the top-right corner -->
    <div class="d-flex justify-end">
      <v-btn icon @click="closeFilterDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Skills Filter -->
    <div class="mb-4">
      <h4>Skills</h4>
      <v-combobox
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

    <v-row>
      <v-col>
        <!-- Department Filter -->
        <div class="mb-4">
          <h4>Department</h4>
          <v-combobox
            v-model="selectedDepartments"
            :items="availableDepartments"
            label="Select department"
            variant="outlined"
            density="compact"
            multiple
            chips
            clearable
            @update:modelValue="handleDepartmentChange"
          />
        </div>
      </v-col>
      <v-col>
        <!-- Employment Filter -->
        <div class="mb-4">
          <h4>Employment Type</h4>
          <v-combobox
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
      </v-col>
    </v-row>

    <!-- Title Filter -->
    <div class="mb-4">
      <h4>Role</h4>
      <v-text-field
        v-model="title"
        label="Search role"
        variant="outlined"
        density="compact"
        @update:modelValue="handleTitleChange"
        clearable
      />
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { mockData } from '@/mockdata/mockData'

const filterStore = useFilterStore()
const emit = defineEmits(['close-filter-dialog'])

// Local state
const selectedSkills = ref([])
const salaryMin = ref('')
const salaryMax = ref('')
const salaryError = ref('') // For wrong salary input
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

// Get unique employment types from mockData
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
  if (!salaryMin.value && !salaryMax.value) {
    filterStore.clearFilters('salary')
    return
  }

  if (!validateSalary()) {
    return
  }

  let range = ''
  if (salaryMin.value && salaryMax.value) {
    range = `RM${salaryMin.value}-RM${salaryMax.value}`
  } else if (salaryMin.value) {
    range = `RM${salaryMin.value}+`
  } else if (salaryMax.value) {
    range = `Up to RM${salaryMax.value}`
  }

  filterStore.clearFilters('salary')
  if (range) {
    filterStore.addFilter('salary', range)
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
    // Update skills selection
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

// Close filter dialog
const closeFilterDialog = () => {
  emit('close-filter-dialog') // Emit the event to the parent component
}
</script>

<style scoped>
.v-card {
  box-shadow: none; /* Remove elevation */
}
</style>
