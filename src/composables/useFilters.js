// composables/useFilters.js
import { ref, computed } from 'vue'
import { mockData } from '@/mockdata/mockData'

export function useFilters() {
  const filters = ref({
    skills: [],
    salary: [],
    role: [],
  })

  // Helper function to extract numeric value from salary string
  const extractSalaryValue = (salary) => {
    return parseInt(salary.replace(/[^\d]/g, ''))
  }

  // Helper function to extract range values from a range string
  const extractSalaryRange = (range) => {
    const [min, max] = range.split('-').map((val) => extractSalaryValue(val))
    return { min, max }
  }

  // Helper function to check if a salary falls within a range
  const isSalaryInRange = (salary, range) => {
    const salaryValue = extractSalaryValue(salary)
    const { min, max } = extractSalaryRange(range)
    return salaryValue >= min && salaryValue <= max
  }

  const initializeFilters = (initialFilters) => {
    Object.entries(initialFilters).forEach(([category, items]) => {
      items.forEach((item) => {
        addFilter(category, item.label)
      })
    })
  }

  const addFilter = (category, item) => {
    if (!filters.value[category].includes(item)) {
      filters.value[category].push(item)
    }
  }

  const removeFilter = (category, item) => {
    const index = filters.value[category].findIndex((filter) => filter === item)
    if (index !== -1) {
      filters.value[category].splice(index, 1)
    }
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

  const activeFilters = computed(() => {
    return Object.entries(filters.value).reduce((acc, [category, items]) => {
      items.forEach((item) => {
        acc.push({ category, value: item })
      })
      return acc
    }, [])
  })

  const filteredResults = computed(() => {
    return mockData.filter((item) => {
      // Check if item matches all filter conditions
      return Object.entries(filters.value).every(
        ([category, selectedFilters]) => {
          if (!selectedFilters.length) return true // Skip if no filters for category

          switch (category) {
            case 'skills':
              // Match if item has ANY of the selected skills
              return selectedFilters.some((skill) =>
                item.skills.includes(skill)
              )
            case 'salary':
              // Match if item's salary falls within ANY of the selected ranges
              return selectedFilters.some((range) =>
                isSalaryInRange(item.salary, range)
              )
            case 'role':
              // Match if item's role matches ANY selected role
              return selectedFilters.includes(item.role)
            default:
              return true
          }
        }
      )
    })
  })

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
