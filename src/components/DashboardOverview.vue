<template>
  <v-container fluid class="fill-height pa-2">
    <v-row class="fill-height">
      <!-- Left Column -->
      <v-col cols="8" class="d-flex flex-column" style="height: 100vh">
        <!-- Stats Row - Made more compact -->
        <v-row dense class="flex-grow-0">
          <v-col cols="3">
            <StatCard
              dense
              title="Revenue"
              :value="formatCurrency(projectStore.totalRevenue)"
              subtitle="12% increase"
              icon="mdi-currency-usd"
            />
          </v-col>
          <v-col cols="3">
            <StatCard
              dense
              title="Projects"
              :value="`${projectStore.completedProjects}/${projectStore.projectCount}`"
              subtitle="Completion rate"
              icon="mdi-briefcase"
            />
          </v-col>
          <v-col cols="3">
            <StatCard
              dense
              title="Time Spent"
              :value="`${projectStore.totalHoursSpent} Hrs`"
              subtitle="8% increase"
              icon="mdi-clock"
            />
          </v-col>
          <v-col cols="3">
            <StatCard
              dense
              title="Resources"
              :value="`${projectStore.resourceCount}/120`"
              subtitle="Utilization"
              icon="mdi-account-group"
            />
          </v-col>
        </v-row>

        <!-- Projects Table - Takes remaining space -->
        <v-row class="flex-grow-1">
          <DataTable table-type="projects" />
        </v-row>
      </v-col>

      <!-- Right Column -->
      <v-col cols="4" class="d-flex flex-column" style="height: 100vh">
        <!-- Project Status Pie Chart -->
        <v-card class="mb-2 flex-grow-0" height="33%">
          <v-card-title class="text-subtitle-1">Status Distribution</v-card-title>
          <PieChart
            :dimension="projectStatusDimension"
            :group="projectStatusGroup"
            chartId="project-pie-chart"
          />
        </v-card>

        <!-- Target Achievement -->
        <v-card class="mb-2 flex-grow-0" height="33%">
          <v-card-title class="text-subtitle-1">Target Achievement</v-card-title>
          <BarChart
            :dimension="targetDimension"
            :group="targetGroup"
            chartId="target-bar-chart"
          />
        </v-card>

        <!-- Revenue Chart -->
        <v-card class="flex-grow-0" height="33%">
          <v-card-title class="text-subtitle-1">Revenue This Year</v-card-title>
          <BarChart
            :dimension="monthDimension"
            :group="revenueGroup"
            chartId="revenue-bar-chart"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import StatCard from '@/components/StatCard.vue'
import BarChart from '@/components/BarChart.vue'
import PieChart from '@/components/PieChart.vue'
import * as dc from 'dc'
import crossfilter from 'crossfilter2'

const projectStore = useProjectStore()

// Table headers
const projectHeaders = [
  { text: 'Project', value: 'name' },
  { text: 'Progress', value: 'progress' },
  { text: 'Due Date', value: 'dueDate' },
  { text: 'Status', value: 'status' },
]

const statusColors = {
  'In Progress': 'blue',
  'Finished': 'green',
  'Unfinished': 'red',
}

// Crossfilter setup
const ndxRevenue = crossfilter(projectStore.monthlyRevenue)
const ndxProjects = crossfilter(projectStore.projects)
const ndxTargets = crossfilter(projectStore.departmentTargets)

const monthDimension = ndxRevenue.dimension(d => d.month)
const revenueGroup = monthDimension.group().reduceSum(d => d.revenue)

const projectStatusDimension = ndxProjects.dimension(d => d.status)
const projectStatusGroup = projectStatusDimension.group()

const targetDimension = ndxTargets.dimension(d => d.department)
const targetGroup = targetDimension.group().reduceSum(d => d.target)

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(value)
}

// Handle window resize for charts
const handleResize = () => {
  dc.renderAll()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.v-card {
  overflow: hidden;
}

.v-data-table ::v-deep .v-data-table__wrapper {
  overflow-y: auto;
}

/* Ensure cards don't grow beyond their container */
.v-card {
  max-height: 100%;
}

/* Remove default margins and padding */
.container {
  padding: 8px !important;
}

.row {
  margin: 0 !important;
}

.col {
  padding: 4px !important;
}
</style>