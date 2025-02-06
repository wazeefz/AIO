<template>
  <v-container fluid class="pa-2">
    <!-- Fixed Content (Above Fold) -->
    <div class="fixed-content">
      <!-- Stats Row -->
      <v-row dense>
        <v-col cols="4">
          <!-- Without crossfilter -->
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
            title="Cost"
            icon="mdi-currency-usd"
            iconColor="warning"
            :ndx="ndx"
            valueType="totalWage"
          />
        </v-col>
        <v-col cols="4">
          <StatCard
            dense
            title="People"
            icon="mdi-account-group"
            iconColor="success"
            :ndx="ndx"
            valueType="peopleCount"
          />
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row dense>
        <v-col cols="6">
          <v-card>
            <v-card-title class="text-subtitle-1">Department</v-card-title>
            <PieChart
              :dimension="departmentDimension"
              :group="departmentGroup"
              chartId="department-pie-chart"
              :colors="departmentColors"
            />
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card>
            <v-card-title class="text-subtitle-1">Skill</v-card-title>
            <PieChart
              :dimension="skillDimension"
              :group="skillGroup"
              chartId="skill-pie-chart"
              :colors="skillColors"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Scrollable Content (Below Fold) -->
    <div class="scrollable-content">
      <v-card>
        <DataTable
          table-type="people"
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
import DataTable from '@/components/DataTable.vue'
import * as dc from 'dc'
import crossfilter from 'crossfilter2'

const talentStore = useTalentStore()
const allDimensions = ref([])

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
