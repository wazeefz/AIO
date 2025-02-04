import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [
      {
        id: 1,
        starred: false,
        cvCount: 2,
        duration: { years: 1, months: 4 },
        name: 'Website Redesign',
        progress: 80,
        dueDate: '2023-08-23',
        status: 'In Progress',
        budget: 53000,
        department: 'Development'
      },
      {
        id: 2,
        starred: false,
        cvCount: 2,
        duration: { years: 1, months: 4 },
        name: 'Internal CMS Tools',
        progress: 100,
        dueDate: '2023-06-22',
        status: 'Finished',
        budget: 45000,
        department: 'Development'
      },
      {
        id: 3,
        starred: false,
        cvCount: 2,
        duration: { years: 1, months: 4 },
        name: 'E-Commerce App Phase 01',
        progress: 20,
        dueDate: '2023-06-01',
        status: 'Unfinished',
        budget: 75000,
        department: 'Marketing'
      },
      {
        id: 4,
        starred: false,
        cvCount: 2,
        duration: { years: 1, months: 4 },
        name: 'Netflix UX Evaluation',
        progress: 60,
        dueDate: '2023-06-01',
        status: 'In Progress',
        budget: 35000,
        department: 'Design'
      }
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 200000 },
      { month: 'Feb', revenue: 300000 },
      { month: 'Mar', revenue: 400000 },
      { month: 'Apr', revenue: 500000 },
      { month: 'May', revenue: 600000 },
      { month: 'Jun', revenue: 700000 },
      { month: 'Jul', revenue: 800000 },
      { month: 'Aug', revenue: 700000 },
      { month: 'Sep', revenue: 600000 },
      { month: 'Oct', revenue: 700000 },
      { month: 'Nov', revenue: 800000 },
      { month: 'Dec', revenue: 900000 }
    ],
    departmentTargets: [
      { department: 'Marketing', target: 80 },
      { department: 'Development', target: 70 },
      { department: 'Design', target: 90 },
      { department: 'Sales', target: 100 }
    ]
  }),
  getters: {
    totalRevenue: (state) => {
      return state.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0)
    },
    projectCount: (state) => state.projects.length,
    completedProjects: (state) => 
      state.projects.filter(p => p.status === 'Finished').length,
    totalHoursSpent: () => 1022, // This could be calculated from actual project data
    resourceCount: () => 101, // This could be calculated from actual resource data
    projectsByStatus: (state) => {
      const status = {}
      state.projects.forEach(project => {
        status[project.status] = (status[project.status] || 0) + 1
      })
      return status
    }
  },
  actions: {
    addProject(project) {
      this.projects.push(project)
    },
    updateProject(updatedProject) {
      const index = this.projects.findIndex(p => p.id === updatedProject.id)
      if (index !== -1) {
        this.projects[index] = updatedProject
      }
    },
    deleteProject(id) {
      this.projects = this.projects.filter(p => p.id !== id)
    }
  }
})