import { defineStore } from 'pinia'

const API_URL = 'http://localhost:8000'

export const useProjectMetricsStore = defineStore('projectMetrics', {
  state: () => ({
    projects: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    projectCount: (state) => state.projects.length,

    completedProjects: (state) =>
      state.projects.filter((p) => p.status === 'COMPLETED').length,

    activeProjects: (state) =>
      state.projects.filter((p) => p.status === 'IN_PROGRESS').length,

    totalBudget: (state) =>
      state.projects.reduce((sum, project) => sum + (project.budget || 0), 0),

    averageTeamSize: (state) => {
      const total = state.projects.reduce(
        (sum, project) => sum + project.team_size,
        0
      )
      return state.projects.length ? total / state.projects.length : 0
    },

    projectsByStatus: (state) => {
      const status = {}
      state.projects.forEach((project) => {
        status[project.status] = (status[project.status] || 0) + 1
      })
      return status
    },

    projectsBySkill: (state) => {
      const skills = {}
      state.projects.forEach((project) => {
        project.required_skills.forEach((skillId) => {
          skills[skillId] = (skills[skillId] || 0) + 1
        })
      })
      return skills
    },
  },

  actions: {
    async fetchProjects() {
      this.isLoading = true
      try {
        const response = await fetch(`${API_URL}/projects/`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        this.projects = await response.json()
        this.error = null
      } catch (error) {
        this.error = error.message
        console.error('Error fetching projects:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addProject(project) {
      try {
        const response = await fetch(`${API_URL}/projects/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const newProject = await response.json()
        this.projects.push(newProject)
        return newProject
      } catch (error) {
        console.error('Error adding project:', error)
        throw error
      }
    },

    async updateProject(updatedProject) {
      try {
        const response = await fetch(
          `${API_URL}/projects/${updatedProject.project_id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProject),
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const updated = await response.json()
        const index = this.projects.findIndex(
          (p) => p.project_id === updatedProject.project_id
        )
        if (index !== -1) {
          this.projects[index] = updated
        }
        return updated
      } catch (error) {
        console.error('Error updating project:', error)
        throw error
      }
    },

    async deleteProject(projectId) {
      try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        this.projects = this.projects.filter((p) => p.project_id !== projectId)
      } catch (error) {
        console.error('Error deleting project:', error)
        throw error
      }
    },

    async toggleProjectStar(projectId) {
      const project = this.projects.find((p) => p.project_id === projectId)
      if (project) {
        try {
          const updatedProject = { ...project, starred: !project.starred }
          await this.updateProject(updatedProject)
        } catch (error) {
          console.error('Error toggling project star:', error)
          throw error
        }
      }
    },
  },
})
