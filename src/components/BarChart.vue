<template>
  <div class="bar-chart-container">
    <div :id="chartId"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as dc from 'dc'
import * as d3 from 'd3'

const props = defineProps({
  dimension: {
    type: Object,
    required: true,
  },
  group: {
    type: Object,
    required: true,
  },
  chartId: {
    type: String,
    required: true,
  },
})

const chart = ref(null)

onMounted(() => {
  generateBarChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart.value) {
    dc.deregisterChart(chart.value)
    chart.value.destroy()
  }
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (chart.value) {
    const container = document.getElementById(props.chartId)
    const width = container.offsetWidth
    const height = container.offsetHeight

    chart.value.width(width).height(height).render()
  }
}

function generateBarChart() {
  const container = document.getElementById(props.chartId)
  const width = container.offsetWidth
  const height = container.offsetHeight

  chart.value = dc.barChart(`#${props.chartId}`)
  dc.registerChart(chart.value)

  chart.value
    .width(width)
    .height(height)
    .margins({ top: 20, right: 20, bottom: 50, left: 60 })
    .dimension(props.dimension)
    .group(props.group)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .brushOn(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .on('filtered', () => {
      dc.redrawAll()
    })

  // Format y-axis labels as currency
  chart.value.yAxis().tickFormat((d) => `$${d3.format(',')(d)}`)

  // Rotate x-axis labels
  chart.value.on('renderlet', function (chart) {
    chart
      .selectAll('.x text')
      .attr('transform', 'translate(-10,10) rotate(-45)')
  })

  chart.value.render()
}
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.dc-chart) {
  width: 100%;
  height: 100%;
}

:deep(.dc-chart .axis text) {
  font-size: 12px;
}
</style>
