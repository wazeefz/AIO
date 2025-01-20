// composables/useFilters.js
import { ref, computed } from 'vue'
import { mockData } from '@/mockdata/mockData'

export function useFilters() {
  // 1. State Management
  const filters = ref({
    skills: [],
    salary: [],
    role: [],
  })

  // 2. Filter Initialization
  const initializeFilters = (initialFilters) => {
    Object.entries(initialFilters).forEach(([category, items]) => {
      filters.value[category] = items.map((item) => item.label)
    })
  }

  // 3. Filter Manipulation Methods
  const addFilter = (category, value) => {
    if (!filters.value[category].includes(value)) {
      filters.value[category].push(value)
    }
  }

  const removeFilter = (category, value) => {
    filters.value[category] = filters.value[category].filter(
      (item) => item !== value
    )
  }

  const clearFilters = (category) => {
    if (category) {
      filters.value[category] = []
    } else {
      Object.keys(filters.value).forEach((key) => {
        filters.value[key] = []
      })
    }
  }

  // 4. Computed Properties
  const activeFilters = computed(() => {
    return Object.entries(filters.value).reduce((acc, [category, items]) => {
      items.forEach((item) => {
        acc.push({ category, value: item })
      })
      return acc
    }, [])
  })

  // 5. Filtered Results
  const filteredResults = computed(() => {
    return mockData.filter((item) => {
      // Check skills
      const skillsMatch =
        filters.value.skills.length === 0 ||
        filters.value.skills.every((skill) => item.skills.includes(skill))

      // Check salary
      const salaryMatch =
        filters.value.salary.length === 0 ||
        filters.value.salary.includes(item.salary)

      // Check role
      const roleMatch =
        filters.value.role.length === 0 ||
        filters.value.role.includes(item.role)

      return skillsMatch && salaryMatch && roleMatch
    })
  })

  // 6. Return values and methods
  return {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    activeFilters,
    filteredResults,
    initializeFilters,
  }
}
