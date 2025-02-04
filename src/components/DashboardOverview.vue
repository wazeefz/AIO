<template>
  <div>
    <!-- Top Stats Section -->
    <v-row>
      <v-col cols="3">
        <StatCard
          title="Revenue"
          :value="formatCurrency(projectStore.totalRevenue)"
          subtitle="12% increase"
          icon="mdi-currency-usd"
        />
      </v-col>
      <v-col cols="3">
        <StatCard
          title="Projects"
          :value="`${projectStore.completedProjects}/${projectStore.projectCount}`"
          subtitle="Completion rate"
          icon="mdi-briefcase"
        />
      </v-col>
      <v-col cols="3">
        <StatCard
          title="Time Spent"
          :value="`${projectStore.totalHoursSpent} Hrs`"
          subtitle="8% increase"
          icon="mdi-clock"
        />
      </v-col>
      <v-col cols="3">
        <StatCard
          title="Resources"
          :value="`${projectStore.resourceCount}/120`"
          subtitle="Utilization"
          icon="mdi-account-group"
        />
      </v-col>
    </v-row>

    <!-- Recent Project Table -->
    <v-row>
      <v-col cols="8">
        <v-card>
          <v-card-title>Recent Projects</v-card-title>
          <v-data-table
            :headers="projectHeaders"
            :items="projectStore.projects"
            class="elevation-1"
          >
            <template v-slot:[`item.progress`]="{ item }">
              <v-progress-linear
                :value="item.progress"
                height="8"
                color="primary"
              ></v-progress-linear>
            </template>
            <template v-slot:[`item.status`]="{ item }">
              <v-chip :color="statusColors[item.status]" dark>
                {{ item.status }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <!-- All Projects Pie Chart -->
      <v-col cols="4">
        <v-card>
          <v-card-title>Project Status Distribution</v-card-title>
          <PieChart
            :dimension="projectStatusDimension"
            :group="projectStatusGroup"
            chartId="project-pie-chart"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Target Chart -->
      <v-col cols="6">
        <v-card>
          <v-card-title>Target Achievement</v-card-title>
          <BarChart
            :dimension="targetDimension"
            :group="targetGroup"
            title="Target by Department"
            chartId="target-bar-chart"
          />
        </v-card>
      </v-col>
      <!-- Revenue Chart -->
      <v-col cols="6">
        <v-card>
          <v-card-title>Revenue This Year</v-card-title>
          <BarChart
            :dimension="monthDimension"
            :group="revenueGroup"
            title="Revenue by Month"
            chartId="revenue-bar-chart"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
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
</script>

<style scoped>
.elevation-1 {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>