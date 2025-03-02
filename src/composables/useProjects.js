// useProjects.js
import { defineStore } from 'pinia'

const API_URL = 'http://localhost:8000'

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

export const useProjects = defineStore('project', {
  state: () => ({
    projects: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    sortedProjects: (state) => {
      const starred = state.projects.filter((project) => project.starred)
      const unstarred = state.projects.filter((project) => !project.starred)

      starred.sort((a, b) => a.name.localeCompare(b.name))
      unstarred.sort((a, b) => a.name.localeCompare(b.name))

      return [...starred, ...unstarred]
    },
    formatCurrency: () => (value) => {
      if (!value && value !== 0) return 'MYR0.00'

      const formatter = new Intl.NumberFormat('en-MY', {
        // or 'en-US'
        style: 'currency',
        currency: 'MYR',
        currencyDisplay: 'code', // or 'symbol', 'name'
      })

      return formatter.format(value).replace('MYR', 'MYR ') // Add space after code
    },
  },

  actions: {
    async fetchProjects() {
      this.isLoading = true
      try {
        const response = await fetch(`${API_URL}/projects`, {
          headers,
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const apiProjects = await response.json()
        this.projects = apiProjects.map((project) => ({
          ...project,
          id: project.project_id,
          teamSize: project.team_size || 0, // Use team_size
          starred: project.starred || false,
        }))

        this.error = null
      } catch (error) {
        this.error = error.message
        console.error('Error fetching projects:', error)
      } finally {
        this.isLoading = false
      }
    },

    async updateProject(updatedProject) {
      try {
        console.log(
          'Updating project:',
          JSON.parse(JSON.stringify(updatedProject))
        ) // ✅ Debugging

        // ✅ Send only necessary fields (avoids missing required fields)
        const apiProject = {
          name: updatedProject.name,
          project_description: updatedProject.project_description,
          starred: updatedProject.starred,
          team_size: updatedProject.teamSize, // Use team_size
          progress: updatedProject.progress,
          status: updatedProject.status ?? undefined,
          budget: updatedProject.budget ?? undefined,
        }

        const response = await fetch(
          `${API_URL}/projects/${updatedProject.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(apiProject),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          )
        }

        const responseData = await response.json()

        // ✅ Update local state
        const index = this.projects.findIndex((p) => p.id === updatedProject.id)
        if (index !== -1) {
          this.projects[index] = {
            ...this.projects[index],
            ...responseData,
            id: responseData.project_id,
            teamSize: responseData.team_size, // Use team_size
          }
        }

        return responseData
      } catch (error) {
        console.error('Error updating project:', error)
        throw error
      }
    },

    async toggleProjectStar(project) {
      try {
        const index = this.projects.findIndex((p) => p.id === project.id)
        if (index === -1) {
          throw new Error('Project not found')
        }

        const updatedProject = {
          ...this.projects[index],
          starred: !this.projects[index].starred, // Toggle starred status
        }

        const response = await fetch(`${API_URL}/projects/${project.id}`, {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: JSON.stringify(updatedProject),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          )
        }

        // Update local state
        this.projects[index].starred = !this.projects[index].starred
      } catch (error) {
        console.error('Error toggling star:', error)
        throw error
      }
    },

    async deleteProject(projectId) {
      try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
          method: 'DELETE',
          headers,
          credentials: 'include',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.detail || `HTTP error! status: ${response.status}`
          )
        }

        // Remove the project from the local state
        this.projects = this.projects.filter(
          (project) => project.id !== projectId
        )
      } catch (error) {
        console.error('Error deleting project:', error)
        throw error
      }
    },
  },
})
