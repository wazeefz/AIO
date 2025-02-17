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
              :dimension="statusDimension"
              :group="statusGroup"
              chartId="status-pie-chart"
              :colors="statusColors"
            />
          </v-card>
        </v-col>

        <v-col cols="8">
          <v-card class="chart-card">
            <v-card-title class="text-subtitle-1">Budget by Status</v-card-title>
              <BarChart
                :dimension="statusDimension"
                :group="budgetByStatusGroup"
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
import ProjectTable from '@/components/kProjectTable.vue'
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
const budgetDimension = ndx.dimension((d) => d.budget)
const teamSizeDimension = ndx.dimension((d) => d.team_size)

// Track all dimensions
allDimensions.value = [
  projectDimension,
  statusDimension,
  departmentDimension,
  monthDimension,
  budgetDimension,
  teamSizeDimension,
]

// Create groups
const statusGroup = statusDimension.group()
const departmentBudgetGroup = departmentDimension
  .group()
  .reduceSum((d) => d.budget)
const monthlyRevenueGroup = monthDimension.group().reduceSum((d) => d.revenue)
const budgetByStatusGroup = statusDimension.group().reduce(
  // Add
  (p, v) => p + (v.budget || 0),
  // Remove
  (p, v) => p - (v.budget || 0),
  // Initial
  () => 0
);
const teamSizeGroup = teamSizeDimension.group()

// Status colors
const statusColors = {
  'IN_PROGRESS': '#FFA726',
  'COMPLETED': '#4CAF50',
  'ON_HOLD': '#EF5350',
  'CANCELLED': '#9E9E9E'
}

onMounted(() => {
  // Initialize data count
  dataCount.value = dc
    .dataCount('#dc-data-count')
    .dimension(ndx)
    .group(ndx.groupAll());

  // Create a dummy chart to handle resets properly
  const dummyChart = {
    render: () => {},
    redraw: () => {},
    filterAll: () => {},
  };
  dc.registerChart(dummyChart);

  // Render all charts
  dc.renderAll();

  // Add resize listener
  window.addEventListener('resize', handleResize);
});

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

const redrawCharts = () => {
  dc.redrawAll();
};

const resetAllFilters = () => {
  // Reset all dimensions
  allDimensions.value.forEach((dim) => {
    if (dim && typeof dim.filterAll === 'function') {
      dim.filterAll();
    }
  });

  // Reset both crossfilters
  ndx.remove();
  revenueNdx.remove();

  // Re-add the data
  ndx.add(projectStore.projects);
  revenueNdx.add(projectStore.monthlyRevenue);

  // Redraw all charts
  dc.redrawAll();
};
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
