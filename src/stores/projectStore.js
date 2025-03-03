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

/**
 * @typedef {Object} ProjectAssignment
 * @property {number} project_id
 * @property {number} talent_id
 * @property {string} [role]
 * @property {string} [assignment_start_date]
 * @property {string} [assignment_end_date]
 * @property {number} [performance_rating]
 */

/**
 * @typedef {Object} ProjectTeamMember
 * @property {number} talent_id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} job_title
 * @property {number} basic_salary
 * @property {string} [role]
 * @property {string} email
 * @property {string} [department_name]
 * @property {number} [performance_rating]
 * @property {string} [assignment_start_date]
 * @property {string} [assignment_end_date]
 * @property {number} [total_experience_years]
 * @property {string[]} [skills]
 */

/**
 * @typedef {Object} AvailableTalent
 * @property {number} talent_id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {number} basic_salary
 * @property {string} [phone]
 * @property {string} [job_title]
 * @property {string} [department_name]
 * @property {number} [total_experience_years]
 * @property {string[]} [skills]
 */

export const useProjectManagementStore = defineStore('projectManagement', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    projectTeam: [],
    /** @type {AvailableTalent[]} */ availableEmployees: [],
    filteredProjects: [],
  }),

  getters: {
    getCurrentProjectTeam: (state) => state.projectTeam,
    getAvailableEmployees: (state) => state.availableEmployees,
    getCurrentProject: (state) => state.currentProject,
    getProjects: (state) => state.projects,
    getFilteredProjects: (state) => state.filteredProjects,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
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

    /**
     * Get all project assignments with pagination
     * @param {number} [skip=0] - Number of records to skip
     * @param {number} [limit=100] - Maximum number of records to return
     * @returns {Promise<ProjectAssignment[]>}
     */
    async getAllProjectAssignments(skip = 0, limit = 100) {
      try {
        this.loading = true
        this.error = null

        const response = await api.get('/project-assignments', {
          params: { skip, limit },
        })
        return response.data
      } catch (error) {
        this.error = error.message
        console.error(
          'Error getting project assignments:',
          error.originalError || error
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new project assignment
     * @param {ProjectAssignment} assignment - The assignment data
     */
    async createProjectAssignment(assignment) {
      try {
        this.loading = true
        this.error = null

        const response = await api.post('/project-assignments', assignment)
        await this.setCurrentProject(assignment.project_id)
        return response.data
      } catch (error) {
        this.error = error.message
        console.error(
          'Error adding talent into project:',
          error.originalError || error
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update a project assignment
     * @param {number} projectId - The project ID
     * @param {number} talentId - The talent ID
     * @param {Object} updateData - The data to update
     * @param {string} [updateData.role] - The new role
     * @param {string} [updateData.assignment_start_date] - The new start date
     * @param {string} [updateData.assignment_end_date] - The new end date
     * @param {number} [updateData.performance_rating] - The new performance rating
     */
    async updateProjectAssignment(projectId, talentId, updateData) {
      try {
        this.loading = true
        this.error = null

        const response = await api.put(
          `/project-assignments/${projectId}/${talentId}`,
          updateData
        )
        await this.setCurrentProject(projectId)
        return response.data
      } catch (error) {
        this.error = error.message
        console.error(
          'Error updating project assignment:',
          error.originalError || error
        )
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Set the current project and load its team members and available talents
     * @param {number} projectId - The project ID to set as current
     */
    async setCurrentProject(projectId) {
      if (!projectId) {
        this.error = 'Invalid project ID'
        return
      }

      try {
        this.loading = true
        this.error = null

        // Get project team members and available talents from profile-card endpoints
        const [teamResponse, availableResponse] = await Promise.all([
          api.get(`/profile-card/project/${projectId}/team`),
          api.get(`/profile-card/available-talents/${projectId}`),
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

    /**
     * Remove a team member from a project
     * @param {number} projectId - The project ID
     * @param {number} memberId - The talent ID to remove
     */
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
