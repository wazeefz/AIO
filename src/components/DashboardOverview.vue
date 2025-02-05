<template>
  <v-container fluid class="fill-height pa-2">
    <v-row class="fill-height">
      <!-- Left Column -->
      <v-col cols="8" class="d-flex flex-column" style="height: 100vh">
        <!-- Stats Row -->
        <v-row dense class="flex-grow-0">
          <v-col cols="3">
            <StatCard
              dense
              title="Revenue"
              subtitle="Total Revenue"
              icon="mdi-currency-usd"
              iconColor="primary"
              :ndx="ndx"
              valueType="totalRevenue"
            />
          </v-col>
          <v-col cols="3">
            <StatCard
              dense
              title="Projects"
              subtitle="Completion Rate"
              icon="mdi-briefcase"
              iconColor="success"
              :ndx="ndx"
              valueType="projectCount"
            />
          </v-col>
          <v-col cols="3">
            <StatCard
              dense
              title="Completed"
              subtitle="Finished Projects"
              icon="mdi-check-circle"
              iconColor="info"
              :ndx="ndx"
              valueType="completedProjects"
            />
          </v-col>
          <v-col cols="3">
            <StatCard
              dense
              title="Resources"
              subtitle="Total Resources"
              icon="mdi-account-group"
              iconColor="warning"
              :ndx="ndx"
              valueType="resourceCount"
            />
          </v-col>
        </v-row>

        <!-- Projects Table -->
        <v-row class="flex-grow-1">
          <v-col cols="12">
            <v-card class="fill-height">
              <v-card-title class="text-subtitle-1">
                Projects
                <v-spacer></v-spacer>
                <div id="dc-data-count" class="text-caption">
                  <span class="filter-count"></span> selected out of
                  <span class="total-count"></span> projects
                </div>
              </v-card-title>
              <DataTable
                table-type="projects"
                :ndx="ndx"
                :dimension="projectDimension"
              />
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- Right Column -->
      <v-col cols="4" class="d-flex flex-column" style="height: 100vh">
        <!-- Project Status Pie Chart -->
        <v-card class="mb-2 flex-grow-0" height="33%">
          <v-card-title class="text-subtitle-1"
            >Status Distribution</v-card-title
          >
          <PieChart
            :dimension="statusDimension"
            :group="statusGroup"
            chartId="status-pie-chart"
            :colors="statusColors"
          />
        </v-card>

        <!-- Department Budget Chart -->
        <v-card class="mb-2 flex-grow-0" height="33%">
          <v-card-title class="text-subtitle-1"
            >Budget by Department</v-card-title
          >
          <BarChart
            :dimension="departmentDimension"
            :group="departmentBudgetGroup"
            chartId="department-budget-chart"
          />
        </v-card>

        <!-- Monthly Revenue Chart -->
        <v-card class="flex-grow-0" height="33%">
          <v-card-title class="text-subtitle-1">Monthly Revenue</v-card-title>
          <BarChart
            :dimension="monthDimension"
            :group="monthlyRevenueGroup"
            chartId="monthly-revenue-chart"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- Reset Filters Button -->
    <v-btn color="primary" class="reset-button" @click="resetAllFilters">
      Reset Filters
    </v-btn>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useProjectStore } from '@/stores/project'
import StatCard from '@/components/StatCard.vue'
import BarChart from '@/components/BarChart.vue'
import PieChart from '@/components/PieChart.vue'
import DataTable from '@/components/DataTable.vue'
import * as dc from 'dc'
import * as d3 from 'd3'
import crossfilter from 'crossfilter2'

const projectStore = useProjectStore()
const allDimensions = ref([])
const dataCount = ref(null)

// Initialize crossfilter
const ndx = crossfilter(projectStore.projects)
const revenueNdx = crossfilter(projectStore.monthlyRevenue)

// Create dimensions
const projectDimension = ndx.dimension((d) => d.name)
const statusDimension = ndx.dimension((d) => d.status)
const departmentDimension = ndx.dimension((d) => d.department)
const monthDimension = revenueNdx.dimension((d) => d.month)

// Track all dimensions
allDimensions.value = [
  projectDimension,
  statusDimension,
  departmentDimension,
  monthDimension,
]

// Create groups
const statusGroup = statusDimension.group()
const departmentBudgetGroup = departmentDimension
  .group()
  .reduceSum((d) => d.budget)
const monthlyRevenueGroup = monthDimension.group().reduceSum((d) => d.revenue)

// Status colors
const statusColors = {
  Finished: '#4CAF50',
  'In Progress': '#FFA726',
  Unfinished: '#EF5350',
}

onMounted(() => {
  // Initialize data count
  dataCount.value = dc
    .dataCount('#dc-data-count')
    .dimension(ndx)
    .group(ndx.groupAll())

  // Create a dummy chart to handle resets properly
  const dummyChart = {
    render: () => {},
    redraw: () => {},
    filterAll: () => {},
  }
  dc.registerChart(dummyChart)

  // Render all charts
  dc.renderAll()

  // Add resize listener
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  // Clear filters before unmounting
  allDimensions.value.forEach((dim) => {
    if (dim && typeof dim.filterAll === 'function') {
      dim.filterAll()
    }
  })

  // Clear data
  ndx.remove()
  revenueNdx.remove()
})

const handleResize = () => {
  dc.renderAll()
}

const resetAllFilters = () => {
  // Reset all dimensions
  allDimensions.value.forEach((dim) => {
    if (dim && typeof dim.filterAll === 'function') {
      dim.filterAll()
    }
  })

  // Reset both crossfilters
  ndx.remove()
  revenueNdx.remove()

  // Re-add the data
  ndx.add(projectStore.projects)
  revenueNdx.add(projectStore.monthlyRevenue)

  // Redraw all charts
  dc.redrawAll()
}
</script>

<style scoped>
.v-container {
  padding: 16px;
}

.v-card {
  overflow: hidden;
}

.reset-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

/* Chart containers */
:deep(.dc-chart) {
  float: none;
  padding: 16px;
}

/* Data count styling */
#dc-data-count {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

/* Row spacing */
.v-row {
  margin-bottom: 16px;
}

/* Card title styling */
.v-card-title {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Dark theme support */
:deep(.v-theme--dark) {
  #dc-data-count {
    color: rgba(255, 255, 255, 0.7);
  }

  .v-card-title {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
