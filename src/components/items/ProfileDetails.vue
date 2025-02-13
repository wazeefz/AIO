<template>
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
    <v-alert v-if="salaryError" type="error" density="compact" class="mt-2">
      {{ salaryError }}
    </v-alert>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'

const filterStore = useFilterStore()

// Local state
const salaryMin = ref('')
const salaryMax = ref('')
const salaryError = ref('')

// Validate salary input
const validateSalary = () => {
  salaryError.value = ''

  const min = Number(salaryMin.value)
  const max = Number(salaryMax.value)

  if (min && max && max < min) {
    salaryError.value = 'Max salary cannot be less than min salary'
    return false
  }

  if (min < 0 || max < 0) {
    salaryError.value = 'Salary cannot be negative'
    return false
  }

  if ((min && isNaN(min)) || (max && isNaN(max))) {
    salaryError.value = 'Please enter valid numbers'
    return false
  }

  return true
}

// Handle salary change
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

// Watch for changes in the filter store to update local state
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

<style scoped>
/* Add custom styles if needed */
</style>
s
