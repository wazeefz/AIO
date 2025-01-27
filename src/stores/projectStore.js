// stores/projectStore.js
import { defineStore } from 'pinia'
import { projectsData, employeesData } from '@/mockdata/mockData'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: projectsData,
    currentProject: null,
    loading: false,
    error: null,
  }),

  getters: {
    getProjectTeamMembers: (state) => (projectId) => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return []

      return project.team
        .map((memberId) => employeesData.find((emp) => emp.id === memberId))
        .filter(Boolean)
    },

    getAvailableEmployees: (state) => (projectId) => {
      const project = state.projects.find((p) => p.id === projectId)
      if (!project) return employeesData

      // Return all employees that are not in the current project
      return employeesData.filter((emp) => !project.team.includes(emp.id))
    },

    getCurrentProjectTeam: (state) => {
      if (!state.currentProject) return []
      return state.currentProject.team
        .map((memberId) => employeesData.find((emp) => emp.id === memberId))
        .filter(Boolean)
    },
  },

  actions: {
    setCurrentProject(projectId) {
      this.currentProject = this.projects.find((p) => p.id === projectId)
    },

    addTeamMembers(projectId, memberIds) {
      const project = this.projects.find((p) => p.id === projectId)
      if (project) {
        project.team = [...new Set([...project.team, ...memberIds])]
        if (this.currentProject?.id === projectId) {
          this.currentProject = project
        }
      }
    },

    removeTeamMember(projectId, memberId) {
      const project = this.projects.find((p) => p.id === projectId)
      if (project) {
        project.team = project.team.filter((id) => id !== memberId)
        if (this.currentProject?.id === projectId) {
          this.currentProject = project
        }
      }
    },

    // Additional project management actions
    async createProject(projectData) {
      try {
        this.loading = true
        // Add API call here when backend is ready
        const newProject = {
          id: this.projects.length + 1,
          ...projectData,
          team: [],
        }
        this.projects.push(newProject)
        return newProject
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProject(projectId, updateData) {
      try {
        this.loading = true
        const project = this.projects.find((p) => p.id === projectId)
        if (project) {
          Object.assign(project, updateData)
          if (this.currentProject?.id === projectId) {
            this.currentProject = project
          }
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
