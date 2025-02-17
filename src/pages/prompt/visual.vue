<template>
  <v-container fluid class="pa-2">
    <!-- Fixed Content (Above Fold) -->
    <div class="fixed-content">
      <!-- Stats Row -->
      <v-row dense>
        <v-col cols="4">
          <StatCard
            dense
            title="Project"
            subtitle="AI Team Assembly"
            icon="mdi-briefcase"
            iconColor="primary"
          />
        </v-col>
        <v-col cols="4">
          <StatCard
            dense
            title="Total Salary"
            icon="mdi-currency-usd"
            iconColor="warning"
            :ndx="ndx"
            valueType="totalSalary"
          />
        </v-col>
        <v-col cols="4">
          <StatCard
            dense
            title="Employees"
            icon="mdi-account-group"
            iconColor="success"
            :ndx="ndx"
            valueType="peopleCount"
          />
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row dense>
        <v-col cols="4">
          <v-card>
            <v-card-title class="text-subtitle-1">Department Distribution</v-card-title>
            <PieChart
              :dimension="departmentDimension"
              :group="departmentGroup"
              chartId="department-pie-chart"
              :colors="departmentColors"
            />
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card>
            <v-card-title class="text-subtitle-1">Employment Type</v-card-title>
            <PieChart
              :dimension="employmentTypeDimension"
              :group="employmentTypeGroup"
              chartId="employment-type-pie-chart"
              :colors="employmentTypeColors"
            />
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card>
            <v-card-title class="text-subtitle-1">Gender Distribution</v-card-title>
            <PieChart
              :dimension="genderDimension"
              :group="genderGroup"
              chartId="gender-pie-chart"
              :colors="genderColors"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Scrollable Content (Below Fold) -->
    <div class="scrollable-content">
      <v-card>
        <TalentTable
          :ndx="ndx"
          :dimension="peopleDimension"
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
import { useTalentStore } from '@/stores/talent'
import StatCard from '@/components/StatCard.vue'
import PieChart from '@/components/PieChart.vue'
import TalentTable from '@/components/kTalentTable.vue'
import * as dc from 'dc'
import crossfilter from 'crossfilter2'

const talentStore = useTalentStore()
const allDimensions = ref([])

// Initialize crossfilter
const ndx = crossfilter(talentStore.talents)

// Create dimensions
const peopleDimension = ndx.dimension(d => d.first_name)
const departmentDimension = ndx.dimension(d => d.department_id)
const employmentTypeDimension = ndx.dimension(d => d.employment_type)
const genderDimension = ndx.dimension(d => d.gender)

// Track all dimensions
allDimensions.value = [
  peopleDimension,
  departmentDimension,
  employmentTypeDimension,
  genderDimension
]

// Create groups
const departmentGroup = departmentDimension.group()
const employmentTypeGroup = employmentTypeDimension.group()
const genderGroup = genderDimension.group()

// Color schemes
const departmentColors = {
  1: '#1976D2', // IT
  2: '#E91E63', // Design
  3: '#FFA000', // Management
  4: '#388E3C', // Marketing
  5: '#5E35B1', // Data
  6: '#00ACC1', // HR
}

const employmentTypeColors = {
  'FULL_TIME': '#42b883',
  'PART_TIME': '#ff6b6b',
  'CONTRACT': '#306998',
  'TEMPORARY': '#68a063'
}

const genderColors = {
  'MALE': '#2196F3',
  'FEMALE': '#E91E63',
  'OTHER': '#9C27B0'
}

onMounted(() => {
  dc.renderAll()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  allDimensions.value.forEach(dim => {
    if (dim && typeof dim.filterAll === 'function') {
      dim.filterAll()
    }
  })
  
  ndx.remove()
})

const handleResize = () => {
  dc.renderAll()
}

const resetAllFilters = () => {
  allDimensions.value.forEach(dim => {
    if (dim && typeof dim.filterAll === 'function') {
      dim.filterAll()
    }
  })

  ndx.remove()
  ndx.add(talentStore.talents)
  dc.redrawAll()
}
</script>

<style scoped>
.v-container {
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

@media (max-width: 960px) {
  .v-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
