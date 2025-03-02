<template>
  <v-container fluid class="pa-2">
    <v-overlay :model-value="isLoading">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <v-alert v-if="error" type="error" closable class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Fixed Content (Above Fold) -->
    <div v-if="isDataReady" class="fixed-content">
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
            <v-card-title class="text-subtitle-1"
              >Department Distribution</v-card-title
            >
            <PieChart
              v-if="dimensions.department && groups.department"
              :dimension="dimensions.department"
              :group="groups.department"
              chartId="department-pie-chart"
              :colors="departmentColors"
            />
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card>
            <v-card-title class="text-subtitle-1">Employment Type</v-card-title>
            <PieChart
              v-if="dimensions.employmentType && groups.employmentType"
              :dimension="dimensions.employmentType"
              :group="groups.employmentType"
              chartId="employment-type-pie-chart"
              :colors="employmentTypeColors"
            />
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card>
            <v-card-title class="text-subtitle-1"
              >Gender Distribution</v-card-title
            >
            <PieChart
              v-if="dimensions.gender && groups.gender"
              :dimension="dimensions.gender"
              :group="groups.gender"
              chartId="gender-pie-chart"
              :colors="genderColors"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Scrollable Content (Below Fold) -->
    <div v-if="isDataReady" class="scrollable-content">
      <v-card>
        <TalentTable
          v-if="ndx && dimensions.people"
          :ndx="ndx"
          :dimension="dimensions.people"
        />
      </v-card>
    </div>

    <!-- Reset Filters Button -->
    <v-btn
      v-if="isDataReady"
      color="primary"
      class="reset-button"
      @click="resetAllFilters"
    >
      Reset Filters
    </v-btn>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTalentStore } from '@/stores/talent'
import StatCard from '@/components/StatCard.vue'
import PieChart from '@/components/PieChart.vue'
import TalentTable from '@/components/kTalentTable.vue'
import * as dc from 'dc'
import crossfilter from 'crossfilter2'

const talentStore = useTalentStore()
const allDimensions = ref([])
const ndx = ref(null)
const isDataReady = ref(false)

// Reactive references for dimensions and groups
const dimensions = ref({
  people: null,
  department: null,
  employmentType: null,
  gender: null,
})

const groups = ref({
  department: null,
  employmentType: null,
  gender: null,
})

// Computed properties
const isLoading = computed(() => talentStore.isLoading)
const error = computed(() => talentStore.error)

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
  FULL_TIME: '#42b883',
  PART_TIME: '#ff6b6b',
  CONTRACT: '#306998',
  TEMPORARY: '#68a063',
}

const genderColors = {
  MALE: '#2196F3',
  FEMALE: '#E91E63',
  OTHER: '#9C27B0',
}

// Initialize crossfilter and dimensions
const initializeCrossfilter = () => {
  if (!talentStore.talents.length) return

  try {
    // Initialize crossfilter
    ndx.value = crossfilter(talentStore.talents)

    // Create dimensions
    dimensions.value = {
      people: ndx.value.dimension((d) => d.first_name),
      department: ndx.value.dimension((d) => d.department_id),
      employmentType: ndx.value.dimension((d) => d.employment_type),
      gender: ndx.value.dimension((d) => d.gender),
    }

    // Create groups
    groups.value = {
      department: dimensions.value.department.group(),
      employmentType: dimensions.value.employmentType.group(),
      gender: dimensions.value.gender.group(),
    }

    // Track all dimensions for reset functionality
    allDimensions.value = Object.values(dimensions.value)

    isDataReady.value = true
  } catch (error) {
    console.error('Error initializing crossfilter:', error)
    isDataReady.value = false
  }
}

// Watch for changes in talent store data
watch(
  () => talentStore.talents,
  (newTalents) => {
    if (newTalents.length > 0) {
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
    // Fetch talents data
    await talentStore.fetchTalents()

    // Initialize crossfilter after data is loaded
    initializeCrossfilter()

    if (ndx.value) {
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
    ndx.value.add(talentStore.talents)
  }

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
