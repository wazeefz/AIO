<template>
  <div>
    <!-- Top Stats Section -->
    <v-row>
      <v-col cols="3">
        <StatCard
          title="Total Revenue"
          value="$53,009"
          subtitle="12% increase from last month"
          icon="mdi-currency-usd"
        />
      </v-col>
      <v-col cols="3">
        <StatCard
          title="Projects"
          value="95/100"
          subtitle="10% decrease from last month"
          icon="mdi-briefcase"
        />
      </v-col>
      <v-col cols="3">
        <StatCard
          title="Time Spent"
          value="1022/1300 Hrs"
          subtitle="8% increase from last month"
          icon="mdi-clock"
        />
      </v-col>
      <v-col cols="3">
        <StatCard
          title="Resources"
          value="101/120"
          subtitle="2% increase from last month"
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
            :items="projects"
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
              <v-chip :color="statusColors[item.status]" dark>{{
                item.status
              }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <!-- All Projects Pie Chart -->
      <v-col cols="4">
        <v-card>
          <v-card-title>All Projects Overview</v-card-title>
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
      <v-col>
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
import { ref } from 'vue'
import StatCard from '@/components/StatCard.vue'
import BarChart from '@/components/BarChart.vue'
import PieChart from '@/components/PieChart.vue'
import * as dc from 'dc'
import crossfilter from 'crossfilter2'

// Recent Projects Table Data
const projectHeaders = [
  { text: 'Project', value: 'name' },
  { text: 'Progress', value: 'progress' },
  { text: 'Due Date', value: 'dueDate' },
  { text: 'Status', value: 'status' },
]

const projects = [
  {
    name: 'Website Redesign',
    progress: 80,
    dueDate: '2023-08-23',
    status: 'In Progress',
  },
  {
    name: 'Internal CMS Tools',
    progress: 100,
    dueDate: '2023-06-22',
    status: 'Finished',
  },
  {
    name: 'E-Commerce App Phase 01',
    progress: 20,
    dueDate: '2023-06-01',
    status: 'Unfinished',
  },
  {
    name: 'Netflix UX Evaluation',
    progress: 20,
    dueDate: '2023-06-01',
    status: 'In Progress',
  },
]

const statusColors = {
  'In Progress': 'blue',
  Finished: 'green',
  Unfinished: 'red',
}

// Crossfilter for Charts
const revenueData = [
  { month: 'Jan', revenue: 200 },
  { month: 'Feb', revenue: 300 },
  { month: 'Mar', revenue: 400 },
  { month: 'Apr', revenue: 500 },
  { month: 'May', revenue: 600 },
  { month: 'Jun', revenue: 700 },
  { month: 'Jul', revenue: 800 },
  { month: 'Aug', revenue: 700 },
  { month: 'Sep', revenue: 600 },
  { month: 'Oct', revenue: 700 },
  { month: 'Nov', revenue: 800 },
  { month: 'Dec', revenue: 900 },
]

const projectData = [
  { status: 'In Progress', count: 40 },
  { status: 'Finished', count: 50 },
  { status: 'Unfinished', count: 10 },
]

const targetData = [
  { department: 'Marketing', target: 80 },
  { department: 'Development', target: 70 },
  { department: 'Design', target: 90 },
  { department: 'Sales', target: 100 },
]

const ndx = crossfilter(revenueData)
const ndxProjects = crossfilter(projectData)
const ndxTargets = crossfilter(targetData)

const monthDimension = ndx.dimension((d) => d.month)
const revenueGroup = monthDimension.group().reduceSum((d) => d.revenue)

const projectStatusDimension = ndxProjects.dimension((d) => d.status)
const projectStatusGroup = projectStatusDimension
  .group()
  .reduceSum((d) => d.count)

const targetDimension = ndxTargets.dimension((d) => d.department)
const targetGroup = targetDimension.group().reduceSum((d) => d.target)
</script>

<style scoped>
.elevation-1 {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
