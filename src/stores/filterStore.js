// stores/filterStore.js
import { defineStore } from 'pinia'
import { useProjectManagementStore } from '@/stores/projectStore'

export const useFilterStore = defineStore('filter', {
  state: () => ({
    // Separate filters for team members and add modal
    teamFilters: {
      skills: [],
      basic_salary: [],
      title: [],
      role: [],
      department: [],
    },
    modalFilters: {
      skills: [],
      basic_salary: [],
      title: [],
      role: [],
      department: [],
    },
  }),

  getters: {
    activeTeamFilters: (state) => {
      return Object.entries(state.teamFilters).reduce(
        (acc, [category, items]) => {
          items.forEach((item) => {
            acc.push({ category, value: item })
          })
          return acc
        },
        []
      )
    },

    activeModalFilters: (state) => {
      return Object.entries(state.modalFilters).reduce(
        (acc, [category, items]) => {
          items.forEach((item) => {
            acc.push({ category, value: item })
          })
          return acc
        },
        []
      )
    },

    filteredTeamMembers: (state) => {
      const projectStore = useProjectManagementStore()
      const teamMembers = projectStore.currentProject
        ? projectStore.getCurrentProjectTeam
        : []

      return teamMembers.filter((item) => {
        return Object.entries(state.teamFilters).every(
          ([category, selectedFilters]) => {
            if (!selectedFilters.length) return true
            return applyFilters(item, category, selectedFilters)
          }
        )
      })
    },

    filteredModalMembers: (state) => {
      const projectStore = useProjectManagementStore()
      const availableMembers = projectStore.currentProject
        ? projectStore.getAvailableEmployees
        : []

      return availableMembers.filter((item) => {
        return Object.entries(state.modalFilters).every(
          ([category, selectedFilters]) => {
            if (!selectedFilters.length) return true
            return applyFilters(item, category, selectedFilters)
          }
        )
      })
    },
  },

  actions: {
    addTeamFilter(category, item) {
      if (!this.teamFilters[category].includes(item)) {
        this.teamFilters[category].push(item)
      }
    },

    addModalFilter(category, item) {
      if (!this.modalFilters[category].includes(item)) {
        this.modalFilters[category].push(item)
      }
    },

    removeTeamFilter(category, item) {
      const index = this.teamFilters[category].findIndex(
        (filter) => filter.toString() === item.toString()
      )
      if (index !== -1) {
        this.teamFilters[category].splice(index, 1)
      }
    },

    removeModalFilter(category, item) {
      const index = this.modalFilters[category].findIndex(
        (filter) => filter.toString() === item.toString()
      )
      if (index !== -1) {
        this.modalFilters[category].splice(index, 1)
      }
    },

    clearTeamFilters(category = null) {
      if (category === 'all') {
        Object.keys(this.teamFilters).forEach((key) => {
          this.teamFilters[key] = []
        })
      } else if (category) {
        this.teamFilters[category] = []
      }
    },

    clearModalFilters(category = null) {
      if (category === 'all') {
        Object.keys(this.modalFilters).forEach((key) => {
          this.modalFilters[key] = []
        })
      } else if (category) {
        this.modalFilters[category] = []
      }
    },

    clearFilters(type = 'team', category = null) {
      if (type === 'team') {
        this.clearTeamFilters(category)
      } else if (type === 'modal') {
        this.clearModalFilters(category)
      }
    },
  },
})

// Helper functions
function extractSalaryValue(salary) {
  if (!salary || (typeof salary !== 'string' && typeof salary !== 'number'))
    return 0
  // Handle both string and number inputs
  const salaryStr = typeof salary === 'number' ? salary.toString() : salary
  // Remove "Up to" prefix if it exists
  const withoutPrefix = salaryStr.replace(/^Up to /i, '')
  // Remove currency symbols and spaces
  const cleanSalary = withoutPrefix.replace(/[$RM\s,]/g, '')
  return parseInt(cleanSalary) || 0
}

function isSalaryInRange(salary, range) {
  // Handle invalid inputs
  if (!salary) return false

  // Convert salary to number if it's not already
  const salaryValue =
    typeof salary === 'number' ? salary : extractSalaryValue(salary)
  if (!salaryValue) return false

  try {
    // Handle different range formats
    if (range.includes('-')) {
      // Range format: "1000-2000"
      const [minStr, maxStr] = range.split('-')
      const min = extractSalaryValue(minStr)
      const max = extractSalaryValue(maxStr)
      return salaryValue >= min && salaryValue <= max
    } else if (range.includes('+')) {
      // Minimum format: "1000+"
      const min = extractSalaryValue(range)
      return salaryValue >= min
    } else if (range.toLowerCase().startsWith('up to')) {
      // Maximum format: "Up to 2000"
      const max = extractSalaryValue(range)
      console.log('Max salary filter (Up to):', {
        max,
        salaryValue,
        result: salaryValue <= max,
      })
      return salaryValue <= max
    } else {
      // Plain number format
      const max = extractSalaryValue(range)
      console.log('Max salary filter (plain):', {
        max,
        salaryValue,
        result: salaryValue <= max,
      })
      return salaryValue <= max
    }
  } catch (error) {
    console.error('Error processing salary range:', error)
    return false
  }
}

function applyFilters(item, category, selectedFilters) {
  if (!item || !category || !selectedFilters) return false

  switch (category) {
    case 'skills':
      return selectedFilters.every((skill) => item.skills?.includes(skill))
    case 'basic_salary':
      console.log('Filtering salary:', {
        salary: item.basic_salary,
        filters: selectedFilters,
      })
      return selectedFilters.some((range) => {
        const result = isSalaryInRange(item.basic_salary, range)
        console.log('Salary range check:', {
          range,
          salary: item.basic_salary,
          result,
        })
        return result
      })
    case 'title':
      return selectedFilters.some((searchTerm) =>
        item.job_title?.toLowerCase().includes(searchTerm?.toLowerCase())
      )
    case 'role':
      return selectedFilters.some((roleType) => {
        if (roleType === 'Lead') {
          return item.role?.toLowerCase().includes('lead')
        } else if (roleType === 'Non-Lead') {
          return !item.role?.toLowerCase().includes('lead')
        }
        return true
      })
    case 'department':
      return selectedFilters.includes(item.department_name)
    default:
      return true
  }
}
