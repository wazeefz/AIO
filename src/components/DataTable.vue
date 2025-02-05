<template>
  <div class="data-table-wrapper">
    <!-- For Projects -->
    <template v-if="tableType === 'projects'">
      <div class="table-header">
        <div class="data-count" id="project-stats">
          <v-icon color="primary" class="mr-2"
            >mdi-file-document-multiple</v-icon
          >
          <span class="filter-count"></span> selected out of
          <span class="total-count"></span> projects
        </div>
        <v-text-field
          v-model="searchText"
          density="compact"
          variant="outlined"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field"
        ></v-text-field>
      </div>
      <div id="project-table" class="dc-table-wrapper"></div>
    </template>

    <!-- For People -->
    <template v-else>
      <div class="table-header">
        <div class="data-count" id="mystats2">
          <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
          <span class="filter-count"></span> selected out of
          <span class="total-count"></span> people
        </div>
        <v-text-field
          v-model="searchText"
          density="compact"
          variant="outlined"
          label="Search"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field"
        ></v-text-field>
      </div>
      <div id="mytable" class="dc-table-wrapper"></div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as d3 from 'd3'
import * as dc from 'dc'
import 'dc/src/compat/d3v6'

const props = defineProps({
  ndx: {
    type: Object,
    required: true,
  },
  tableType: {
    type: String,
    required: true,
    validator: (value) => ['projects', 'people'].includes(value),
  },
  dimension: {
    type: Object,
    required: true,
  },
})

const countChart = ref(null)
const tableChart = ref(null)
const searchText = ref('')

// Watch for search text changes
watch(searchText, (newValue) => {
  if (tableChart.value) {
    const tableRows = document.querySelectorAll('.dc-table-row')
    tableRows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      const isVisible = text.includes(newValue.toLowerCase())
      row.style.display = isVisible ? '' : 'none'
    })
  }
})

onMounted(() => {
  if (props.tableType === 'projects') {
    generateProjectCharts()
  } else {
    generatePeopleCharts()
  }
})

onUnmounted(() => {
  if (countChart.value) {
    dc.deregisterChart(countChart.value)
    countChart.value = null
  }
  if (tableChart.value) {
    dc.deregisterChart(tableChart.value)
    tableChart.value = null
  }
})

function calculateAge(dob) {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }
  return age
}

function generateProjectCharts() {
  const all = props.ndx.groupAll()

  countChart.value = dc.dataCount('#project-stats')
  tableChart.value = dc.dataTable('#project-table')

  dc.registerChart(countChart.value)
  dc.registerChart(tableChart.value)

  countChart.value.crossfilter(props.ndx).groupAll(all)

  tableChart.value
    .dimension(props.dimension)
    .size(Infinity)
    .columns([
      {
        label: 'Project Name',
        format: (d) => d.name,
      },
      {
        label: 'Status',
        format: (d) =>
          `<span class="status-chip ${d.status.toLowerCase()}">${
            d.status
          }</span>`,
      },
      {
        label: 'Department',
        format: (d) => d.department,
      },
      {
        label: 'Budget',
        format: (d) =>
          `<span class="budget">$${d.budget.toLocaleString()}</span>`,
      },
    ])
    .sortBy((d) => d.name)
    .order(d3.ascending)
    .on('filtered', () => {
      dc.redrawAll()
    })

  countChart.value.render()
  tableChart.value.render()
}

function generatePeopleCharts() {
  const departmentDimension = props.ndx.dimension((d) => d.department)
  const all = props.ndx.groupAll()

  countChart.value = dc.dataCount('#mystats2')
  tableChart.value = dc.dataTable('#mytable')

  dc.registerChart(countChart.value)
  dc.registerChart(tableChart.value)

  countChart.value.crossfilter(props.ndx).groupAll(all)

  tableChart.value
    .dimension(departmentDimension)
    .section((d) => d.department)
    .size(Infinity)
    .columns([
      {
        label: 'Name',
        format: (d) => `<span class="name">${d.first} ${d.last}</span>`,
      },
      {
        label: 'Gender',
        format: (d) =>
          `<span class="gender-chip ${d.gender.toLowerCase()}">${
            d.gender
          }</span>`,
      },
      {
        label: 'Age',
        format: (d) => calculateAge(d.dob),
      },
      {
        label: 'Department',
        format: (d) => `<span class="department-chip">${d.department}</span>`,
      },
      {
        label: 'Skills',
        format: (d) =>
          `<div class="skills-container">${d.skill
            .map((s) => `<span class="skill-chip">${s}</span>`)
            .join('')}</div>`,
      },
      {
        label: 'Wage',
        format: (d) => `<span class="wage">$${d.wage.toLocaleString()}</span>`,
      },
    ])
    .sortBy((d) => d.first)
    .order(d3.ascending)
    .on('filtered', () => {
      dc.redrawAll()
    })

  countChart.value.render()
  tableChart.value.render()
}
</script>

<style scoped>
.data-table-wrapper {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--v-primary-base);
  display: flex;
  align-items: center;
}

.data-count {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
}

.search-field {
  max-width: 300px;
}

.dc-table-wrapper {
  flex-grow: 1;
  overflow: auto;
}

:deep(.dc-table) {
  width: 100%;
  border-collapse: collapse;
}

:deep(.dc-table-head) {
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}

:deep(.dc-table-column) {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.dc-table-head .dc-table-column) {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

:deep(.dc-table-row:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Status chips */
:deep(.status-chip) {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

:deep(.status-chip.finished) {
  background-color: #e8f5e9;
  color: #2e7d32;
}

:deep(.status-chip.in-progress) {
  background-color: #fff3e0;
  color: #f57c00;
}

:deep(.status-chip.unfinished) {
  background-color: #ffebee;
  color: #c62828;
}

/* Gender chips */
:deep(.gender-chip) {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
}

:deep(.gender-chip.male) {
  background-color: #e3f2fd;
  color: #1565c0;
}

:deep(.gender-chip.female) {
  background-color: #fce4ec;
  color: #c2185b;
}

/* Department chip */
:deep(.department-chip) {
  padding: 4px 12px;
  border-radius: 16px;
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.85rem;
}

/* Skills */
:deep(.skills-container) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.skill-chip) {
  padding: 2px 8px;
  border-radius: 12px;
  background-color: #e3f2fd;
  color: #1565c0;
  font-size: 0.8rem;
}

/* Numbers */
:deep(.budget),
:deep(.wage) {
  font-family: 'Roboto Mono', monospace;
  color: #2e7d32;
}

/* Dark theme support */
:deep(.v-theme--dark) {
  .data-table-wrapper {
    background: #1e1e1e;
  }

  .dc-table-head {
    background-color: #2d2d2d;
  }

  .dc-table-column {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .dc-table-row:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .data-count {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
