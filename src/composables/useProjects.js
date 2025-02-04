import { ref, computed } from 'vue'

export function useProjects() {
  const projects = ref([
    {
      id: 1,
      starred: false,
      name: 'Market Research',
      cvCount: 2,
      budget: 20000.0,
      status: 'finished',
      duration: { years: 1, months: 4 },
    },
    {
      id: 2,
      starred: false,
      name: 'CapyBarAi Website',
      cvCount: 4,
      budget: 4750.0,
      status: 'unfinished',
      duration: { years: 0, months: 2 },
    },

    {
      id: 3,
      starred: false,
      name: 'Data Mining',
      cvCount: 10,
      budget: 30000.0,
      status: 'in progress',
      duration: { years: 0, months: 3 },
    },

    {
      id: 4,
      starred: false,
      name: 'Backend Dev - AIO',
      cvCount: 5,
      budget: 43990.0,
      status: 'in progress',
      duration: { years: 0, months: 1 },
    },

    {
      id: 5,
      starred: false,
      name: 'School Construction',
      cvCount: 50,
      budget: 3887960.0,
      status: 'unfinished',
      duration: { years: 0, months: 1 },
    },

    {
      id: 6,
      starred: false,
      name: 'Market Outreach (flyers)',
      cvCount: 7,
      budget: 2100.0,
      status: 'finished',
      duration: { years: 0, months: 1 },
    },
  ])

  const toggleStar = (id) => {
    const project = projects.value.find((p) => p.id === id)
    if (project) {
      project.starred = !project.starred
    }
  }

  const deleteProject = (id) => {
    projects.value = projects.value.filter((p) => p.id !== id)
  }

  const updateProject = (updatedProject) => {
    const index = projects.value.findIndex((p) => p.id === updatedProject.id)
    if (index !== -1) {
      projects.value[index] = { ...updatedProject }
    }
  }

  const sortedProjects = computed(() => {
    return [...projects.value].sort((a, b) => b.starred - a.starred)
  })

  return {
    projects: sortedProjects,
    toggleStar,
    deleteProject,
    updateProject,
  }
}
