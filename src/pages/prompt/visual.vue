<template>
  <v-container fluid class="fill-height pa-2">
    <v-row class="fill-height">
      <!-- Main Content Column -->
      <v-col class="d-flex flex-column" style="height: 100vh">
        <!-- Stats Row -->
        <v-row dense class="flex-grow-0">
          <v-col cols="4">
            <StatCard
              dense
              title="Total Cost"
              subtitle="Current Budget"
              icon="mdi-currency-usd"
              iconColor="primary"
              :ndx="ndx"
              valueType="totalWage"
            />
          </v-col>
          <v-col cols="4">
            <StatCard
              dense
              title="People"
              subtitle="Total Employees"
              icon="mdi-account-group"
              iconColor="success"
              :ndx="ndx"
              valueType="peopleCount"
            />
          </v-col>
          <v-col cols="4">
            <StatCard
              dense
              title="Skills"
              subtitle="Total Skills"
              icon="mdi-lightbulb"
              iconColor="warning"
              :ndx="ndx"
              valueType="skillCount"
            />
          </v-col>
        </v-row>

        <!-- Charts and Table Row -->
        <v-row class="flex-grow-1">
          <!-- Left Side Charts -->
          <v-col cols="6" class="d-flex flex-column" style="height: 100%">
            <!-- Distribution Charts -->
            <v-row style="height: 50%">
              <v-col cols="6" class="fill-height">
                <v-card class="fill-height">
                  <v-card-title class="text-subtitle-1"
                    >Department Distribution</v-card-title
                  >
                  <v-card-text class="fill-height pa-0">
                    <PieChart
                      :dimension="departmentDimension"
                      :group="departmentGroup"
                      chartId="department-pie-chart"
                      :colors="departmentColors"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" class="fill-height">
                <v-card class="fill-height">
                  <v-card-title class="text-subtitle-1"
                    >Skills Distribution</v-card-title
                  >
                  <v-card-text class="fill-height pa-0">
                    <PieChart
                      :dimension="skillDimension"
                      :group="skillGroup"
                      chartId="skill-pie-chart"
                      :colors="skillColors"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Wage Distribution Chart -->
            <v-row style="height: 50%">
              <v-col cols="12" class="fill-height">
                <v-card class="fill-height">
                  <v-card-title class="text-subtitle-1"
                    >Wage Distribution by Department</v-card-title
                  >
                  <v-card-text class="fill-height pa-0">
                    <BarChart
                      :dimension="departmentDimension"
                      :group="wageByDepartmentGroup"
                      chartId="bar-wage-department"
                    />
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Right Side Table -->
          <v-col cols="6" class="fill-height">
            <v-card class="fill-height">
              <v-card-title class="text-subtitle-1 d-flex align-center">
                People Details
                <v-spacer></v-spacer>
                <div id="data-count" class="text-caption">
                  <span class="filter-count"></span> selected out of
                  <span class="total-count"></span> records
                </div>
              </v-card-title>
              <v-card-text class="fill-height pa-0">
                <DataTable
                  table-type="people"
                  :ndx="ndx"
                  :dimension="peopleDimension"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
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
import { useTalentStore } from '@/stores/talent'
import StatCard from '@/components/StatCard.vue'
import BarChart from '@/components/BarChart.vue'
import PieChart from '@/components/PieChart.vue'
import DataTable from '@/components/DataTable.vue'
import * as dc from 'dc'
import * as d3 from 'd3'
import crossfilter from 'crossfilter2'

const talentStore = useTalentStore()
const allDimensions = ref([])
const dataCount = ref(null)

// Initialize crossfilter
const ndx = crossfilter(talentStore.talents)

// Create dimensions
const peopleDimension = ndx.dimension((d) => d.first)
const departmentDimension = ndx.dimension((d) => d.department)
const skillDimension = ndx.dimension((d) => d.skill, true)

// Track all dimensions
allDimensions.value = [peopleDimension, departmentDimension, skillDimension]

// Create groups
const departmentGroup = departmentDimension.group()
const skillGroup = skillDimension.group()
const wageByDepartmentGroup = departmentDimension
  .group()
  .reduceSum((d) => d.wage)

// Color schemes
const departmentColors = {
  IT: '#1976D2',
  Design: '#E91E63',
  Management: '#FFA000',
  Marketing: '#388E3C',
  Data: '#5E35B1',
  HR: '#00ACC1',
  Development: '#43A047',
  Sales: '#FB8C00',
}

const skillColors = {
  Vue: '#42b883',
  Python: '#306998',
  Node: '#68a063',
  Javascript: '#f7df1e',
  CRM: '#ff6b6b',
  SEO: '#00bcd4',
  Excel: '#217346',
  Word: '#2b579a',
}

onMounted(() => {
  // Initialize data count
  dataCount.value = dc
    .dataCount('#data-count')
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
  ndx.remove()

  // Re-add the data
  ndx.add(talentStore.talents)

  // Redraw all charts
  dc.redrawAll()
}
</script>

<style scoped>
.v-container {
  padding: 8px !important;
  height: 100vh;
  overflow: hidden;
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
#data-count {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.6);
}

/* Row spacing */
.v-row {
  margin: 0 !important;
}

.v-col {
  padding: 4px !important;
}

/* Card title styling */
.v-card-title {
  padding: 12px 16px;
  font-size: 0.875rem !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Card content */
.v-card-text {
  padding: 8px !important;
}

/* Fill height utilities */
.fill-height {
  height: 100% !important;
}

/* Dark theme support */
:deep(.v-theme--dark) {
  #data-count {
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
