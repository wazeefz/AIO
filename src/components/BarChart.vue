<template>
  <div class="bar-chart-container" ref="containerRef">
    <div class="scrollable-wrapper" ref="scrollRef">
      <div :id="chartId"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
const containerRef = ref(null)
const scrollRef = ref(null)

const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

onMounted(async () => {
  await nextTick()
  generateBarChart()
  window.addEventListener('resize', debouncedResize)
})

const handleResize = async () => {
  if (chart.value && containerRef.value && scrollRef.value) {
    await nextTick()

    const container = containerRef.value
    const scrollWrapper = scrollRef.value
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate the width based on the number of bars
    const numberOfBars = props.group.all().length
    const minBarWidth = 40 // Minimum width per bar
    const calculatedWidth = Math.max(containerWidth, numberOfBars * minBarWidth)

    chart.value
      .width(calculatedWidth)
      .height(containerHeight - 20) // Subtract padding
      .margins({ top: 20, right: 20, bottom: 120, left: 80 })

    // Recalculate scales
    chart.value.rescale()

    // Redraw the chart
    chart.value.redraw()

    // Update x-axis labels
    chart.value
      .select('.x-axis-label text')
      .attr('transform', 'translate(-10,10) rotate(-45)')
  }
}

const debouncedResize = debounce(handleResize, 250)

function generateBarChart() {
  if (!containerRef.value || !scrollRef.value) return

  const container = containerRef.value
  const scrollWrapper = scrollRef.value
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  // Calculate the width based on the number of bars
  const numberOfBars = props.group.all().length
  const minBarWidth = 40 // Minimum width per bar
  const calculatedWidth = Math.max(containerWidth, numberOfBars * minBarWidth)

  chart.value = dc.barChart(`#${props.chartId}`)
  dc.registerChart(chart.value)

  chart.value
    .width(calculatedWidth)
    .height(containerHeight - 20)
    .margins({ top: 0, right: 20, bottom: 120, left: 80 })
    .dimension(props.dimension)
    .group(props.group)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .brushOn(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .renderTitle(true)
    .title(function (d) {
      return `${d.key}: $${d3.format(',')(d.value)}`
    })
    .on('filtered', () => {
      dc.redrawAll()
    })

  // Format y-axis labels
  chart.value
    .yAxis()
    .tickFormat((d) => `$${d3.format(',')(d)}`)
    .ticks(5)

  // Customize the chart appearance
  chart.value.on('pretransition', function (chart) {
    // Style the bars
    chart.selectAll('.bar').style('fill', '#5c6bc0').style('stroke', 'none')

    // Style the grid lines
    chart
      .selectAll('.grid-line')
      .style('stroke', '#e0e0e0')
      .style('stroke-dasharray', '2,2')

    // Rotate and style x-axis labels
    chart
      .selectAll('.x text')
      .attr('transform', 'translate(-10,10) rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px')

    // Style y-axis labels
    chart.selectAll('.y text').style('font-size', '12px')
  })

  chart.value.render()
}
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  max-height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  padding: 12px;
}

.scrollable-wrapper {
  width: 100%;
  height: 100%;
  max-height: 350px;
  overflow-x: auto;
  overflow-y: hidden;
}

:deep(.dc-chart) {
  user-select: none;
}

:deep(.dc-chart .axis text) {
  font-size: 12px;
  fill: #666;
}

:deep(.dc-chart .axis path, .dc-chart .axis line) {
  stroke: #ccc;
}

:deep(.dc-chart .grid-line line) {
  stroke: #e0e0e0;
  stroke-dasharray: 2, 2;
}

:deep(.dc-chart .bar) {
  fill: #5c6bc0;
  transition: fill 0.2s;
}

:deep(.dc-chart .bar:hover) {
  fill: #3949ab;
}

/* Custom scrollbar styles */
.scrollable-wrapper::-webkit-scrollbar {
  height: 8px;
}

.scrollable-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.scrollable-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.scrollable-wrapper::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
