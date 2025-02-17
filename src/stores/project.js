import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [
      {
        project_id: 1, //id
        name: 'Website Redesign',
        starred: false,
        cv_count: 2,
        progress: 80,
        due_date: '2023-08-23',
        status: 'IN_PROGRESS',
        budget: 53000.00,
        user_id: 1,
        start_date: '2023-01-15',
        created_at: '2023-01-01',
        required_skills: [1, 2, 3], // Assuming skill IDs
        min_experience_years: 3,
        team_size: 5,
        project_description: 'Complete redesign of company website with modern UI/UX principles'
      },
      {
        project_id: 2,
        name: 'Internal CMS Tools',
        starred: false,
        cv_count: 2,
        progress: 100,
        due_date: '2023-06-22',
        status: 'COMPLETED',
        budget: 45000.00,
        user_id: 2,
        start_date: '2023-02-01',
        created_at: '2023-01-15',
        required_skills: [4, 5],
        min_experience_years: 2,
        team_size: 3,
        project_description: 'Development of internal content management system tools'
      },
      {
        project_id: 3,
        name: 'E-Commerce App Phase 01',
        starred: false,
        cv_count: 2,
        progress: 20,
        due_date: '2023-06-01',
        status: 'ON_HOLD',
        budget: 75000.00,
        user_id: 1,
        start_date: '2023-03-01',
        created_at: '2023-02-15',
        required_skills: [1, 6, 7],
        min_experience_years: 4,
        team_size: 7,
        project_description: 'First phase of e-commerce application development'
      },
      {
        project_id: 4,
        name: 'Netflix UX Evaluation',
        starred: false,
        cv_count: 2,
        progress: 60,
        due_date: '2023-06-01',
        status: 'IN_PROGRESS',
        budget: 35000.00,
        user_id: 3,
        start_date: '2023-04-01',
        created_at: '2023-03-15',
        required_skills: [8, 9],
        min_experience_years: 5,
        team_size: 4,
        project_description: 'Comprehensive UX evaluation of Netflix platform'
      }
    ],
    // Revenue tracking (if needed)
    monthlyRevenue: [
      { month: 'Jan', revenue: 200000.00 },
      { month: 'Feb', revenue: 300000.00 },
      { month: 'Mar', revenue: 400000.00 },
      { month: 'Apr', revenue: 500000.00 },
      { month: 'May', revenue: 600000.00 },
      { month: 'Jun', revenue: 700000.00 },
      { month: 'Jul', revenue: 800000.00 },
      { month: 'Aug', revenue: 700000.00 },
      { month: 'Sep', revenue: 600000.00 },
      { month: 'Oct', revenue: 700000.00 },
      { month: 'Nov', revenue: 800000.00 },
      { month: 'Dec', revenue: 900000.00 }
    ]
  }),

  getters: {
    totalRevenue: (state) => {
      return state.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0)
    },
    projectCount: (state) => state.projects.length,
    
    completedProjects: (state) => 
      state.projects.filter(p => p.status === 'COMPLETED').length,
    
    activeProjects: (state) =>
      state.projects.filter(p => p.status === 'IN_PROGRESS').length,
    
    totalBudget: (state) =>
      state.projects.reduce((sum, project) => sum + (project.budget || 0), 0),
    
    averageTeamSize: (state) => {
      const total = state.projects.reduce((sum, project) => sum + project.team_size, 0)
      return state.projects.length ? total / state.projects.length : 0
    },
    
    projectsByStatus: (state) => {
      const status = {}
      state.projects.forEach(project => {
        status[project.status] = (status[project.status] || 0) + 1
      })
      return status
    },
    
    projectsBySkill: (state) => {
      const skills = {}
      state.projects.forEach(project => {
        project.required_skills.forEach(skillId => {
          skills[skillId] = (skills[skillId] || 0) + 1
        })
      })
      return skills
    }
  },

  actions: {
    addProject(project) {
      // Ensure required fields are present
      const requiredFields = ['name', 'status', 'project_description']
      const missingFields = requiredFields.filter(field => !project[field])
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Set default values
      const newProject = {
        project_id: this.projects.length + 1, // In real app, this would come from the backend
        starred: false,
        cv_count: 0,
        progress: 0,
        created_at: new Date().toISOString().split('T')[0],
        ...project
      }

      this.projects.push(newProject)
    },

    updateProject(updatedProject) {
      const index = this.projects.findIndex(p => p.project_id === updatedProject.project_id)
      if (index !== -1) {
        this.projects[index] = {
          ...this.projects[index],
          ...updatedProject
        }
      }
    },

    deleteProject(projectId) {
      this.projects = this.projects.filter(p => p.project_id !== projectId)
    },

    toggleProjectStar(projectId) {
      const project = this.projects.find(p => p.project_id === projectId)
      if (project) {
        project.starred = !project.starred
      }
    },

    updateProjectProgress(projectId, progress) {
      const project = this.projects.find(p => p.project_id === projectId)
      if (project) {
        project.progress = Math.max(0, Math.min(100, progress))
      }
    }
  }
})