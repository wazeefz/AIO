import { defineStore } from 'pinia'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000' // Adjust this based on your backend URL

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Create axios instance with custom config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An error occurred'
    if (error.response) {
      // Server responded with error
      errorMessage =
        error.response.data?.detail ||
        error.response.data?.message ||
        `Server error: ${error.response.status}`
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server. Please check your connection.'
    } else {
      // Request setup error
      errorMessage = error.message
    }
    return Promise.reject({ message: errorMessage, originalError: error })
  }
)

export const useProjectManagementStore = defineStore('projectManagement', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    projectTeam: [],
    availableEmployees: [],
    filteredProjects: [],
  }),

  getters: {
    getCurrentProjectTeam: (state) => state.projectTeam,
    getAvailableEmployees: (state) => state.availableEmployees,
  },

  actions: {
    async initializeProjects() {
      try {
        this.loading = true
        this.error = null

        const response = await api.get('/projects')
        this.projects = response.data
        this.filteredProjects = response.data

        if (this.projects.length > 0) {
          await this.setCurrentProject(this.projects[0].project_id)
        }
      } catch (error) {
        this.error = error.message
        console.error(
          'Error initializing projects:',
          error.originalError || error
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    async setCurrentProject(projectId) {
      if (!projectId) {
        this.error = 'Invalid project ID'
        return
      }

      try {
        this.loading = true
        this.error = null

        // Get project team members
        const [teamResponse, availableResponse] = await Promise.all([
          api.get(`/project-assignments/project/${projectId}/team`),
          api.get(`/project-assignments/available-talents/${projectId}`),
        ])

        const project = this.projects.find((p) => p.project_id === projectId)
        if (!project) {
          throw { message: 'Project not found' }
        }

        this.currentProject = project
        this.projectTeam = teamResponse.data
        this.availableEmployees = availableResponse.data
      } catch (error) {
        this.error = error.message
        console.error(
          'Error setting current project:',
          error.originalError || error
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    async addTeamMembers(projectId, memberIds) {
      if (!projectId || !memberIds?.length) {
        this.error = 'Invalid project ID or member IDs'
        return
      }

      try {
        this.loading = true
        this.error = null

        await api.post(
          `/project-assignments/batch-assign/${projectId}`,
          memberIds
        )
        await this.setCurrentProject(projectId)
      } catch (error) {
        this.error = error.message
        console.error(
          'Error adding team members:',
          error.originalError || error
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    async removeTeamMember(projectId, memberId) {
      if (!projectId || !memberId) {
        this.error = 'Invalid project ID or member ID'
        return
      }

      try {
        this.loading = true
        this.error = null

        await api.delete(`/project-assignments/${projectId}/${memberId}`)
        await this.setCurrentProject(projectId)
      } catch (error) {
        this.error = error.message
        console.error(
          'Error removing team member:',
          error.originalError || error
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    filterProjects(searchTerm = '') {
      if (!searchTerm.trim()) {
        this.filteredProjects = this.projects
      } else {
        const term = searchTerm.toLowerCase()
        this.filteredProjects = this.projects.filter(
          (project) =>
            project.name.toLowerCase().includes(term) ||
            project.project_description.toLowerCase().includes(term)
        )
      }
    },

    resetState() {
      this.projects = []
      this.currentProject = null
      this.loading = false
      this.error = null
      this.projectTeam = []
      this.availableEmployees = []
      this.filteredProjects = []
    },
  },
})
