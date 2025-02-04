// stores/filterStore.js
import { defineStore } from 'pinia'
import { useProjectStore } from '@/stores/projectStore'

export const useFilterStore = defineStore('filter', {
  state: () => ({
    // Separate filters for team members and add modal
    teamFilters: {
      skills: [],
      salary: [],
      title: [],
      department: [],
      employment: [],
    },
    modalFilters: {
      skills: [],
      salary: [],
      title: [],
      department: [],
      employment: [],
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
      const projectStore = useProjectStore()
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
      const projectStore = useProjectStore()
      const availableMembers = projectStore.currentProject
        ? projectStore.getAvailableEmployees(projectStore.currentProject.id)
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

    clearTeamFilters(category) {
      if (category) {
        this.teamFilters[category] = []
      } else {
        Object.keys(this.teamFilters).forEach((key) => {
          this.teamFilters[key] = []
        })
      }
    },

    clearModalFilters(category) {
      if (category) {
        this.modalFilters[category] = []
      } else {
        Object.keys(this.modalFilters).forEach((key) => {
          this.modalFilters[key] = []
        })
      }
    },
  },
})

// Helper functions
function extractSalaryValue(salary) {
  return parseInt(salary.replace(/[^\d]/g, ''))
}

function isSalaryInRange(salary, range) {
  const salaryValue = extractSalaryValue(salary)

  if (range.includes('-')) {
    const [minStr, maxStr] = range.split('-')
    const min = parseInt(minStr.replace(/[^\d]/g, ''))
    const max = parseInt(maxStr.replace(/[^\d]/g, ''))
    return salaryValue >= min && salaryValue <= max
  } else if (range.includes('+')) {
    const min = parseInt(range.replace(/[^\d]/g, ''))
    return salaryValue >= min
  } else if (range.startsWith('Up to')) {
    const max = parseInt(range.replace(/[^\d]/g, ''))
    return salaryValue <= max
  }
  return false
}

function applyFilters(item, category, selectedFilters) {
  switch (category) {
    case 'skills':
      return selectedFilters.every((skill) => item.skills.includes(skill))
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
    case 'employment':
      return selectedFilters.includes(item.employment)
    default:
      return true
  }
}
