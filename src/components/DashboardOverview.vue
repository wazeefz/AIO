<template>
  <v-container fluid class="pa-2 dashboard-container">
    <!-- Fixed Content (Above Fold) -->
    <div class="fixed-content">
      <!-- Stats Row -->
      <v-row dense>
        <v-col cols="4">
          <!-- With crossfilter -->
          <StatCard
            dense
            title="Budget"
            icon="mdi-currency-usd"
            iconColor="primary"
            :ndx="ndx"
            valueType="totalRevenue"
          />
        </v-col>
        <v-col cols="4">
          <StatCard
            dense
            title="Projects"
            icon="mdi-briefcase"
            iconColor="success"
            :ndx="ndx"
            valueType="projectCount"
          />
        </v-col>
        <v-col cols="4">
          <StatCard
            dense
            title="Resources"
            icon="mdi-account-group"
            iconColor="warning"
            :ndx="ndx"
            valueType="resourceCount"
          />
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row dense>
        <!-- Project Status Pie Chart -->
        <v-col cols="6">
          <v-card>
            <v-card-title class="text-subtitle-1">Status</v-card-title>
            <PieChart
              :dimension="statusDimension"
              :group="statusGroup"
              chartId="status-pie-chart"
              :colors="statusColors"
            />
          </v-card>
        </v-col>

        <!-- Department Budget Chart -->
        <v-col cols="6">
          <v-card>
            <v-card-title class="text-subtitle-1"
              >Budget by Department</v-card-title
            >
            <BarChart
              :dimension="departmentDimension"
              :group="departmentBudgetGroup"
              chartId="department-budget-chart"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Scrollable Content (Below Fold) -->
    <div class="scrollable-content">
      <v-card>
        <DataTable
          table-type="projects"
          :ndx="ndx"
          :dimension="projectDimension"
        />
      </v-card>
    </div>

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
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fixed-content {
  flex: 0 0 auto;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  margin-top: 16px;
}

.reset-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

:deep(.dc-chart) {
  float: none;
  padding: 16px;
}

.v-row {
  margin: 0 !important;
}

.v-col {
  padding: 4px !important;
}

.v-card-title {
  padding: 12px 16px;
  font-size: 0.875rem !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Dark theme support */
:deep(.v-theme--dark) {
  .v-card-title {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }
}

@media (max-width: 960px) {
  .v-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
