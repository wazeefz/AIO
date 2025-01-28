<template>
  <div>
    <div>
      <b>People by Department</b>
    </div>
    <div>
      <div id="mystats2" class="dc-data-count">
        <span class="filter-count"></span> selected out of
        <span class="total-count"></span>
      </div>
    </div>

    <div>
      <div id="mytable"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'
import * as dc from 'dc'
import 'dc/src/compat/d3v6'

const props = defineProps({
  ndx: Object,
})

const countChart = ref(null)
const tableChart = ref(null)

onMounted(() => {
  generateCharts()
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

function generateCharts() {
  const departmentDimension = props.ndx.dimension((d) => d.department)
  const all = props.ndx.groupAll()

  countChart.value = dc.dataCount('#mystats2')
  tableChart.value = dc.dataTable('#mytable')

  countChart.value.crossfilter(props.ndx).groupAll(all)

  tableChart.value
    .dimension(departmentDimension)
    .section((d) => d.department)
    .size(Infinity)
    .columns([
      'name',
      {
        label: 'Gender',
        format: (d) => d.gender,
      },
      {
        label: 'Age',
        format: (d) => calculateAge(d.dob),
      },
      {
        label: 'Marital Status',
        format: (d) => (d.MaritalStatus ? 'Married' : 'Single'),
      },
      {
        label: 'Department',
        format: (d) => d.department,
      },
      {
        label: 'Skills',
        format: (d) => d.skill.join(', '),
      },
      {
        label: 'Wage',
        format: (d) => `$${d.wage.toLocaleString()}`,
      },
    ])
    .sortBy((d) => d.name)
    .order(d3.ascending)

  countChart.value.render()
  tableChart.value.render()
}
</script>
