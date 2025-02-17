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
  chartType: {
    type: String,
    default: 'budget',
    validator: (value) => ['budget', 'salary', 'count'].includes(value)
  },
  barColor: {
    type: String,
    default: '#5c6bc0'
  }
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

// Format value based on chart type
const formatValue = (value, type) => {
  if (!value) return type === 'count' ? '0' : '$0'
  switch (type) {
    case 'budget':
    case 'salary':
      return `$${d3.format(',.0f')(value)}`
    case 'count':
      return d3.format(',.0f')(value)
    default:
      return value
  }
}

// Get y-axis label based on chart type
const getYAxisLabel = (type) => {
  switch (type) {
    case 'budget':
      return 'Budget ($)'
    case 'salary':
      return 'Salary ($)'
    case 'count':
      return 'Count'
    default:
      return ''
  }
}

function generateBarChart() {
  if (!containerRef.value || !scrollRef.value) return

  const container = containerRef.value
  const scrollWrapper = scrollRef.value
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  const numberOfBars = props.group.all().length
  const minBarWidth = 40
  const calculatedWidth = Math.max(containerWidth, numberOfBars * minBarWidth)

  chart.value = dc.barChart(`#${props.chartId}`)

  const xScale = d3.scaleBand()
    .domain(props.group.all().map(d => d.key))
    .range([0, calculatedWidth - 80])

  chart.value
    .width(calculatedWidth)
    .height(containerHeight - 20)
    .margins({ top: 30, right: 20, bottom: 50, left: 60 })
    .dimension(props.dimension)
    .group(props.group)
    .x(xScale)
    .xUnits(() => props.group.all().length)
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .brushOn(false)
    .barPadding(0.2)
    .title(d => `${formatStatus(d.key)}: ${formatValue(d.value, props.chartType)}`)
    // Enable clicking on bars for filtering
    .renderLabel(true)
    .transitionDuration(500)
    // Add click handler for filtering
    .on('renderlet', function(chart) {
      chart.selectAll('rect.bar').on('click', function(event, d) {
        // Toggle filter
        chart.filter(d.x);
        dc.redrawAll();
      });
    });

  // Configure axes
  chart.value.yAxis()
    .tickFormat(d => formatValue(d, props.chartType))
    .ticks(5)

  chart.value.xAxis()
    .tickFormat(formatStatus)

  // Add pretransition event
  chart.value.on('pretransition', function(chart) {
    // Style bars
    chart.selectAll('.bar')
      .style('fill', props.barColor)
      .style('stroke', 'none')
      .style('cursor', 'pointer') // Add pointer cursor
      // Add hover effect
      .on('mouseover', function() {
        d3.select(this).style('opacity', 0.8)
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 1)
      })

    // Rotate x-axis labels
    chart.selectAll('.x.axis text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    // Add y-axis label
    const svg = d3.select(`#${props.chartId} svg`)
    svg.selectAll('.y-axis-label').remove()
    
    svg.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', 20)
      .attr('x', -(containerHeight / 2))
      .attr('text-anchor', 'middle')
      .text(getYAxisLabel(props.chartType))
  })

  // Register and render the chart
  dc.registerChart(chart.value)
  chart.value.render()
}

const formatStatus = (status) => {
  if (!status) return ''
  return status.split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

const handleResize = async () => {
  if (!chart.value || !containerRef.value) return

  const container = containerRef.value
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  const numberOfBars = props.group.all().length
  const minBarWidth = 40
  const calculatedWidth = Math.max(containerWidth, numberOfBars * minBarWidth)

  const xScale = d3.scaleBand()
    .domain(props.group.all().map(d => d.key))
    .range([0, calculatedWidth - 80])

  chart.value
    .width(calculatedWidth)
    .height(containerHeight - 20)
    .x(xScale)

  chart.value.rescale()
  chart.value.redraw()
}

const debouncedResize = debounce(handleResize, 250)

onMounted(async () => {
  await nextTick()
  generateBarChart()
  window.addEventListener('resize', debouncedResize)
})
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: 100%;
  min-height: 250px; /* Increased minimum height */
  display: flex;
  flex-direction: column;
  background-color: var(--v-background-base, white);
  padding: 12px;
}

.scrollable-wrapper {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  min-height: 200px; /* Added minimum height */
}

:deep(.dc-chart) {
  user-select: none;
  width: 100%;
  height: 100%;
}

:deep(.dc-chart rect.bar) {
  fill: var(--bar-color, #5c6bc0);
  stroke: none;
}

:deep(.dc-chart .axis line, .dc-chart .axis path) {
  stroke: var(--v-border-color, rgba(0, 0, 0, 0.12));
}

:deep(.dc-chart .grid-line) {
  stroke: var(--v-border-color, rgba(0, 0, 0, 0.08));
  stroke-dasharray: 2, 2;
}

:deep(.dc-chart .axis text) {
  font-size: 12px;
  fill: var(--v-medium-emphasis-color, #666);
}

:deep(.dc-chart .axis path, .dc-chart .axis line) {
  stroke: var(--v-border-color, #ccc);
}

:deep(.dc-chart .grid-line line) {
  stroke: var(--v-border-color, #e0e0e0);
  stroke-dasharray: 2, 2;
}

:deep(.dc-chart .bar) {
  transition: fill 0.2s;
}

:deep(.dc-chart .bar:hover) {
  opacity: 0.8;
}

:deep(.y-axis-label) {
  font-size: 12px;
  fill: var(--v-medium-emphasis-color, #666);
}

/* Dark theme support */
:deep(.v-theme--dark) {
  .dc-chart .axis text,
  .dc-chart .y-axis-label {
    fill: rgba(255, 255, 255, 0.7);
  }

  .dc-chart .axis path,
  .dc-chart .axis line,
  .dc-chart .grid-line line {
    stroke: rgba(255, 255, 255, 0.12);
  }
}

/* Scrollbar styling */
.scrollable-wrapper::-webkit-scrollbar {
  height: 8px;
}

.scrollable-wrapper::-webkit-scrollbar-track {
  background: var(--v-surface-variant, #f1f1f1);
  border-radius: 4px;
}

.scrollable-wrapper::-webkit-scrollbar-thumb {
  background: var(--v-border-color, #888);
  border-radius: 4px;
}

.scrollable-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--v-medium-emphasis-color, #555);
}

:deep(.dc-chart .bar) {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

:deep(.dc-chart .bar:hover) {
  opacity: 0.8;
}

:deep(.dc-chart .selected) {
  opacity: 1;
}

:deep(.dc-chart rect.bar) {
  fill: var(--bar-color, #5c6bc0);
  stroke: none;
  cursor: pointer;
}

:deep(.dc-chart rect.bar.deselected) {
  opacity: 0.4;
}

:deep(.dc-chart rect.bar.selected) {
  opacity: 1;
}
</style>