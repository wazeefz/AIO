<template>
  <div class="pie-chart-container" ref="containerRef">
    <div :id="chartId"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
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
    required: true,
  },
})

const chart = ref(null)
const containerRef = ref(null)

const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

// Watch for changes in dimension and group
watch(
  [() => props.dimension, () => props.group],
  ([newDimension, newGroup]) => {
    if (newDimension && newGroup && chart.value) {
      chart.value.dimension(newDimension).group(newGroup)
      dc.redrawAll()
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Only generate chart if dimension and group are available
  if (props.dimension && props.group) {
    generatePieChart()
  }
  window.addEventListener('resize', debouncedResize)
})

const handleResize = () => {
  if (chart.value && containerRef.value) {
    const container = containerRef.value
    const width = container.clientWidth
    const height = container.clientHeight
    const radius = Math.min(width, height) / 3

    chart.value
      .width(width)
      .height(height)
      .radius(radius)
      .innerRadius(radius / 2)
      .cx(width / 2)
      .cy(height / 2)

    chart.value.redraw()
  }
}

const debouncedResize = debounce(handleResize, 250)

function generatePieChart() {
  if (!containerRef.value || !props.dimension || !props.group) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const radius = Math.min(width, height) / 3

  // Cleanup existing chart if any
  if (chart.value) {
    chart.value.on('filtered', null)
    dc.deregisterChart(chart.value)
  }

  chart.value = dc.pieChart(`#${props.chartId}`)

  // Set dimension and group first
  chart.value.dimension(props.dimension).group(props.group)

  // Then configure the rest
  chart.value
    .width(width)
    .height(height)
    .radius(radius)
    .innerRadius(radius / 2)
    .cx(width / 2)
    .cy(height / 2)
    .colors(
      d3
        .scaleOrdinal()
        .domain(Object.keys(props.colors))
        .range(Object.values(props.colors))
    )
    .externalLabels(radius * 0.2)
    .drawPaths(true)
    .label((d) => {
      if (!props.group) return ''
      const percentage = (
        (d.value / props.group.all().reduce((a, b) => a + b.value, 0)) *
        100
      ).toFixed(1)
      return percentage > 5 ? `${d.key}` : ''
    })
    .title((d) => {
      if (!props.group) return ''
      const percentage = (
        (d.value / props.group.all().reduce((a, b) => a + b.value, 0)) *
        100
      ).toFixed(1)
      return `${d.key}\n${d.value} (${percentage}%)`
    })
    .on('filtered', () => {
      dc.redrawAll()
    })

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

  dc.registerChart(chart.value)
  chart.value.render()
}
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 350px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
</style>
