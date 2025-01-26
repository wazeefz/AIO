<template>
  <div>
    <div>
      <b>{{ title }}</b>
    </div>
    <div :id="chartId"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as dc from 'dc'
import * as d3 from 'd3'
import 'dc/src/compat/d3v6'

const props = defineProps({
  dimension: {
    type: Object,
    required: true,
  },
  group: {
    type: Object,
    required: true,
  },
  title: String,
  chartId: String,
})

const barChart = ref(null)

onMounted(() => {
  generateBarChart()
})

function generateBarChart() {
  barChart.value = dc.barChart(`#${props.chartId}`)
  barChart.value
    .width(500)
    .height(300)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .dimension(props.dimension)
    .group(props.group)
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .barPadding(0.1)
    .outerPadding(0.05)
    .on('filtered', function (chart) {
      dc.redrawAll()
    })

  barChart.value.render()
}
</script>
