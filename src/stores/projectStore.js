import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    projectTeam: [],
    availableEmployees: [],
  }),

  getters: {
    getCurrentProjectTeam: (state) => state.projectTeam,
  },

  actions: {
    async fetchProjectTeam(projectId) {
      try {
        this.loading = true
        const response = await axios.get(
          `${API_URL}/project-assignments/project/${projectId}/team`
        )
        this.projectTeam = response.data
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAvailableEmployees(projectId) {
      try {
        this.loading = true
        const response = await axios.get(
          `${API_URL}/project-assignments/available-talents/${projectId}`
        )
        this.availableEmployees = response.data
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addTeamMembers(projectId, memberIds) {
      try {
        this.loading = true
        const response = await axios.post(
          `${API_URL}/project-assignments/batch-assign/${projectId}`,
          memberIds
        )
        // Refresh the project team after adding members
        await this.fetchProjectTeam(projectId)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async removeTeamMember(projectId, memberId) {
      try {
        this.loading = true
        await axios.delete(
          `${API_URL}/project-assignments/${projectId}/${memberId}`
        )
        // Refresh the project team after removing a member
        await this.fetchProjectTeam(projectId)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateTeamMemberRole(projectId, memberId, updateData) {
      try {
        this.loading = true
        const response = await axios.put(
          `${API_BASE_URL}/project-assignments/${projectId}/${memberId}`,
          updateData
        )
        // Refresh the project team after updating
        await this.fetchProjectTeam(projectId)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async setCurrentProject(projectId) {
      try {
        this.loading = true
        await this.fetchProjectTeam(projectId)
        await this.fetchAvailableEmployees(projectId)
        this.currentProject = { id: projectId }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    resetState() {
      this.projects = []
      this.currentProject = null
      this.loading = false
      this.error = null
      this.projectTeam = []
      this.availableEmployees = []
    },
  },
})
