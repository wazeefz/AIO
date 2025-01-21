// stores/filterStore.js
import { defineStore } from 'pinia'
import { mockData } from '@/mockdata/mockData'

export const useFilterStore = defineStore('filter', {
  state: () => ({
    filters: {
      skills: [],
      salary: [],
      title: [],
      department: [],
    },
  }),

  getters: {
    activeFilters: (state) => {
      return Object.entries(state.filters).reduce((acc, [category, items]) => {
        items.forEach((item) => {
          acc.push({ category, value: item })
        })
        return acc
      }, [])
    },

    //For filtered output results
    //some(): Returns true if ANY of the selected skills match (OR condition)
    //every(): Returns true if ALL of the selected skills match (AND condition)
    filteredResults: (state) => {
      return mockData.filter((item) => {
        return Object.entries(state.filters).every(
          ([category, selectedFilters]) => {
            if (!selectedFilters.length) return true

            switch (category) {
              case 'skills':
                return selectedFilters.every((skill) =>
                  item.skills.includes(skill)
                )
              case 'salary':
                return selectedFilters.some((range) =>
                  isSalaryInRange(item.salary, range)
                )
              case 'title':
                return selectedFilters.some((searchTerm) =>
                  item.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
              case 'department':
                return selectedFilters.includes(item.department)
              default:
                return true
            }
          }
        )
      })
    },
  },

  actions: {
    initializeFilters(initialFilters) {
      Object.entries(initialFilters).forEach(([category, items]) => {
        items.forEach((item) => {
          this.addFilter(category, item.label)
        })
      })
    },

    addFilter(category, item) {
      if (!this.filters[category].includes(item)) {
        this.filters[category].push(item)
      }
    },

    removeFilter(category, item) {
      const index = this.filters[category].findIndex(
        (filter) => filter === item
      )
      if (index !== -1) {
        this.filters[category].splice(index, 1)
      }
    },

    clearFilters(category) {
      if (category) {
        this.filters[category] = []
      } else {
        Object.keys(this.filters).forEach((key) => {
          this.filters[key] = []
        })
      }
    },
  },
})

// Helper functions (outside of store)
function extractSalaryValue(salary) {
  return parseInt(salary.replace(/[^\d]/g, ''))
}

function isSalaryInRange(salary, range) {
  const salaryValue = extractSalaryValue(salary)
  const [minStr, maxStr] = range.split('-')
  const min = parseInt(minStr.replace(/[^\d]/g, ''))
  const max = parseInt(maxStr.replace(/[^\d]/g, ''))
  return salaryValue >= min && salaryValue <= max
}
