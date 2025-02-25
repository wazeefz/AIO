<template>
  <v-app>
    <v-main>
      <v-container>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
        ></v-progress-circular>

        <template v-else>
          <JustificationAndAnalysis
            :title="
              currentProject
                ? `${currentProject.name} - Team Selection & Justification`
                : 'Team Selection & Justification'
            "
            :justification="getJustificationText"
            :teams="processedTeams"
          />
        </template>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import JustificationAndAnalysis from '@/components/JustificationCards'
import { useProjectManagementStore } from '@/stores/projectStore'

const projectStore = useProjectManagementStore()
const loading = ref(true)
const error = ref(null)

const currentProject = computed(() => projectStore.currentProject)

const getJustificationText = computed(() => {
  if (!currentProject.value) return ''
  return `AIO has recommended a diverse team for ${currentProject.value.name}, selected based on their skills, experience, and alignment with the project requirements.`
})

const processedTeams = computed(() => {
  if (!projectStore.projectTeam) return []

  // Group team members by department
  const teamsByDepartment = {}
  projectStore.projectTeam.forEach((member) => {
    if (!teamsByDepartment[member.department]) {
      teamsByDepartment[member.department] = {
        name: member.department,
        color: getDepartmentColor(member.department),
        justification: getDepartmentJustification(member.department),
        members: [],
        totalCost: 0,
      }
    }

    const memberCost = member.daily_rate || 0
    const memberMandays = member.allocated_days || 0
    teamsByDepartment[member.department].members.push({
      name: `${member.talent_first_name} ${member.talent_last_name}`,
      experience: `${member.years_of_experience} years`,
      strengths: member.skills?.join(', ') || 'N/A',
      mandays: memberMandays,
      cost: `$${memberCost}/day`,
    })
    teamsByDepartment[member.department].totalCost += memberCost * memberMandays
  })

  return Object.values(teamsByDepartment).map((team) => ({
    ...team,
    totalCost: `$${team.totalCost.toLocaleString()}`,
  }))
})

// Helper function to get department color
function getDepartmentColor(department) {
  const colors = {
    Marketing: 'blue',
    Sales: 'red',
    IT: 'yellow',
    External: 'orange',
    Finance: 'green',
    'Project Management': 'purple',
  }
  return colors[department] || 'grey'
}

// Helper function to get department justification
function getDepartmentJustification(department) {
  const justifications = {
    Marketing:
      'The Marketing Team brings expertise in market research, strategy development, and consumer behavior analysis.',
    Sales:
      'The Sales Team provides insights on market segmentation, product positioning, and sales forecasting.',
    IT: 'The IT Team contributes technical expertise in data analytics, system integration, and technology infrastructure.',
    External:
      'External specialists provide valuable outside perspective and specialized industry knowledge.',
    Finance:
      'The Finance Team ensures proper budgeting, cost control, and financial analysis.',
    'Project Management':
      'The Project Management Team coordinates activities and ensures timely delivery of objectives.',
  }
  return (
    justifications[department] ||
    `The ${department} team brings specialized expertise to the project.`
  )
}

onMounted(async () => {
  try {
    loading.value = true
    await projectStore.initializeProjects()
    error.value = null
  } catch (e) {
    error.value = e.message || 'Error loading project data'
    console.error('Error in DashboardJustification:', e)
  } finally {
    loading.value = false
  }
})
</script>
