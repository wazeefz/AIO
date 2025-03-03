<template>
  <v-container fluid class="pa-2 dashboard-container">
    <!-- Fixed Content (Above Fold) -->
    <div class="fixed-content">
      <!-- Stats Row -->
      <v-row dense>
        <v-col cols="4">
          <StatCard
            dense
            title="Budget"
            icon="mdi-currency-usd"
            iconColor="primary"
            :ndx="ndx"
            valueType="totalBudget"
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
        <v-col cols="4">
          <v-card class="chart-card">
            <v-card-title class="text-subtitle-1">Status</v-card-title>
            <PieChart
              v-if="dimensions.status && groups.status"
              :dimension="dimensions.status"
              :group="groups.status"
              chartId="status-pie-chart"
              :colors="statusColors"
            />
          </v-card>
        </v-col>

        <v-col cols="8">
          <v-card class="chart-card">
            <v-card-title class="text-subtitle-1"
              >Budget by Status</v-card-title
            >
            <BarChart
              v-if="dimensions.status && groups.budgetByStatus"
              :dimension="dimensions.status"
              :group="groups.budgetByStatus"
              chartId="status-budget-chart"
              chartType="budget"
              barColor="#1976D2"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Scrollable Content (Below Fold) -->
    <div class="scrollable-content">
      <v-card>
        <ProjectTable
          v-if="ndx && dimensions.project"
          :ndx="ndx"
          :dimension="dimensions.project"
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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useProjectMetricsStore } from '@/stores/project'
import StatCard from '@/components/StatCard.vue'
import BarChart from '@/components/BarChart.vue'
import PieChart from '@/components/PieChart.vue'
import ProjectTable from '@/components/kProjectTable.vue'
import * as dc from 'dc'
import * as d3 from 'd3'
import crossfilter from 'crossfilter2'

const projectStore = useProjectMetricsStore()
const allDimensions = ref([])
const dataCount = ref(null)
const ndx = ref(null)
const revenueNdx = ref(null)

const isLoading = ref(true)

// Reactive references for dimensions and groups
const dimensions = ref({
  project: null,
  status: null,
  department: null,
  month: null,
  budget: null,
  teamSize: null,
})

const groups = ref({
  status: null,
  budgetByStatus: null,
  departmentBudget: null,
  monthlyRevenue: null,
  teamSize: null,
})

// Status colors (keep the same)
const statusColors = {
  IN_PROGRESS: '#FFA726',
  COMPLETED: '#4CAF50',
  ON_HOLD: '#EF5350',
  CANCELLED: '#9E9E9E',
}

// Initialize crossfilter and dimensions
const initializeCrossfilter = () => {
  if (!projectStore.projects.length) return

  try {
    // Initialize main crossfilter
    ndx.value = crossfilter(projectStore.projects)

    // Create dimensions
    dimensions.value = {
      project: ndx.value.dimension((d) => d.name),
      status: ndx.value.dimension((d) => d.status),
      department: ndx.value.dimension((d) => d.department),
      budget: ndx.value.dimension((d) => d.budget || 0),
      teamSize: ndx.value.dimension((d) => d.team_size || 0),
    }

    // Create groups
    groups.value = {
      status: dimensions.value.status.group(),
      budgetByStatus: dimensions.value.status.group().reduce(
        (p, v) => p + (v.budget || 0),
        (p, v) => p - (v.budget || 0),
        () => 0
      ),
      teamSize: dimensions.value.teamSize.group(),
    }

    // Track all dimensions for reset functionality
    allDimensions.value = Object.values(dimensions.value)

    isLoading.value = false
  } catch (error) {
    console.error('Error initializing crossfilter:', error)
    isLoading.value = false
  }
}

// Watch for changes in project store data
watch(
  () => projectStore.projects,
  (newProjects) => {
    if (newProjects.length > 0) {
      // Reset existing crossfilter if it exists
      if (ndx.value) {
        ndx.value.remove()
      }

      // Reinitialize crossfilter with new data
      initializeCrossfilter()

      // Redraw all charts
      dc.redrawAll()
    }
  },
  { deep: true }
)

onMounted(async () => {
  try {
    // Fetch projects data
    await projectStore.fetchProjects()

    // Initialize crossfilter after data is loaded
    initializeCrossfilter()

    if (ndx.value) {
      // Initialize data count
      dataCount.value = dc
        .dataCount('#dc-data-count')
        .dimension(ndx.value)
        .group(ndx.value.groupAll())

      // Create a dummy chart to handle resets properly
      const dummyChart = {
        render: () => {},
        redraw: () => {},
        filterAll: () => {},
      }
      dc.registerChart(dummyChart)

      // Render all charts
      dc.renderAll()
    }
  } catch (error) {
    console.error('Error in mounting:', error)
  }

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
  if (ndx.value) {
    ndx.value.remove()
  }
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

  // Reset crossfilter
  if (ndx.value) {
    ndx.value.remove()
    ndx.value.add(projectStore.projects)
  }

  // Redraw all charts
  dc.redrawAll()
}

// Expose necessary refs and functions
defineExpose({
  ndx,
  dimensions,
  groups,
  statusColors,
  resetAllFilters,
})

const showLoadingIndicator = computed(() => {
  return isLoading.value || !ndx.value
})
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
  margin-top: 8px;
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
  padding: 2px !important;
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

.chart-card {
  height: 300px;
  max-height: 350px;
  display: flex;
  flex-direction: column;
}

.chart-card .v-card-title {
  flex: 0 0 auto;
  padding: 8px 16px; /* Reduced padding */
}

.chart-card :deep(.pie-chart-container),
.chart-card :deep(.bar-chart-container) {
  flex: 1;
  min-height: 0;
}

/* This will make the chart components take up the remaining space */
.chart-card :deep(.pie-chart-container),
.chart-card :deep(.bar-chart-container) {
  flex: 1;
  min-height: 0; /* Important for Firefox */
}
</style>
