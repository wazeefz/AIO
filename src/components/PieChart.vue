<template>
  <div class="pie-chart-container">
    <div :id="chartId"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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
  chartId: {
    type: String,
    required: true,
  },
  colors: {
    type: Object,
    default: () => ({
      IT: '#1976D2',
      Design: '#E91E63',
      Management: '#FFA000',
      Marketing: '#388E3C',
      Data: '#5E35B1',
      HR: '#00ACC1',
      Development: '#43A047',
      Sales: '#FB8C00',
    }),
  },
})

const chart = ref(null)

onMounted(() => {
  generatePieChart()
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
    const radius = Math.min(width, height) / 2.2

    chart.value
      .width(width)
      .height(height)
      .radius(radius)
      .innerRadius(radius / 2)
      .render()
  }
}

function generatePieChart() {
  const container = document.getElementById(props.chartId)
  const width = container.offsetWidth * 0.7
  const height = container.offsetHeight * 0.9
  const radius = Math.min(width, height) / 2.2

  chart.value = dc.pieChart(`#${props.chartId}`)
  dc.registerChart(chart.value)

  chart.value
    .width(width)
    .height(height)
    .radius(radius)
    .innerRadius(radius / 2)
    .cx(width / 2)
    .cy(height / 2)
    .dimension(props.dimension)
    .group(props.group)
    .colors(
      d3
        .scaleOrdinal()
        .domain(Object.keys(props.colors))
        .range(Object.values(props.colors))
    )
    .legend(
      dc
        .legend()
        .x(1)
        .y(10)
        .gap(5)
        .legendText((d) => d.name)
    )
    .externalLabels(radius * 0.2)
    .drawPaths(true)
    .label((d) => {
      const percentage = (
        (d.value / props.group.all().reduce((a, b) => a + b.value, 0)) *
        100
      ).toFixed(1)
      return percentage > 5 ? `${percentage}%` : ''
    })
    .title((d) => {
      const percentage = (
        (d.value / props.group.all().reduce((a, b) => a + b.value, 0)) *
        100
      ).toFixed(1)
      return `${d.key}\n${d.value} (${percentage}%)`
    })
    .on('filtered', () => {
      dc.redrawAll()
    })

  // Custom label positioning and styling
  chart.value.on('pretransition', function (chart) {
    chart
      .selectAll('text.pie-slice')
      .style('font-size', '12px')
      .attr('fill', '#333')

    chart
      .selectAll('.pie-slice path')
      .style('stroke', '#fff')
      .style('stroke-width', '1px')

    chart
      .selectAll('polyline.pie-path')
      .style('stroke', '#333')
      .style('stroke-width', '1px')
      .style('fill', 'none')
  })

  chart.value.render()
}
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  height: 100%;
}

:deep(.dc-chart) {
  width: 100%;
  height: 100%;
}
</style>
