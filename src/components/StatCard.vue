<template>
  <v-card
    :class="['stat-card', { dense: dense }]"
    :elevation="hover ? 2 : 1"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="stat-card-wrapper">
      <!-- Icon Section -->
      <div class="icon-section" :class="iconColor">
        <v-icon :size="20" color="white">{{ icon }}</v-icon>
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <!-- Title and Trend -->
        <div class="header-section">
          <span class="stat-title">{{ title }}</span>
        </div>

        <!-- Value and Subtitle -->
        <div class="value-section">
          <span class="stat-value">{{ computedValue }}</span>
          <span class="stat-subtitle">{{ subtitle }}</span>
        </div>

        <!-- Progress Bar (Optional) -->
        <v-progress-linear
          v-if="progress !== undefined"
          :value="progress"
          :color="progressColor"
          height="2"
          class="stat-progress"
        ></v-progress-linear>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as dc from 'dc'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    required: true,
  },
  iconColor: {
    type: String,
    default: 'primary',
  },
  progress: {
    type: Number,
    default: undefined,
  },
  progressColor: {
    type: String,
    default: 'primary',
  },
  dense: {
    type: Boolean,
    default: false,
  },
  ndx: {
    type: Object,
    required: true,
  },
  valueType: {
    type: String,
    required: true,
    validator: (value) =>
      [
        'totalRevenue',
        'projectCount',
        'completedProjects',
        'resourceCount',
        'totalWage',
        'peopleCount',
        'avgWage',
        'skillCount',
      ].includes(value),
  },
  formatOptions: {
    type: Object,
    default: () => ({}),
  },
})

const hover = ref(false)
const previousValue = ref(null)
const currentValue = ref(null)
const dummyChart = ref(null)

// Compute the displayed value based on valueType and current filters
const computedValue = computed(() => {
  if (!currentValue.value) return '0'

  switch (props.valueType) {
    case 'totalRevenue':
    case 'totalWage':
    case 'avgWage':
      return formatCurrency(currentValue.value)
    case 'projectCount':
    case 'completedProjects':
    case 'resourceCount':
    case 'peopleCount':
    case 'skillCount':
      return formatNumber(currentValue.value)
    default:
      return currentValue.value
  }
})

// Compute trend direction and percentage
const trendDirection = computed(() => {
  if (!previousValue.value || !currentValue.value) return 0
  return Math.round(
    ((currentValue.value - previousValue.value) / previousValue.value) * 100
  )
})

const showTrend = computed(() => {
  return previousValue.value !== null && currentValue.value !== null
})

// Calculate values based on valueType
function calculateValue() {
  const group = props.ndx.groupAll()

  switch (props.valueType) {
    case 'totalRevenue':
      return group.reduceSum((d) => d.budget || 0).value()

    case 'projectCount':
      return group.reduceCount().value()

    case 'completedProjects':
      return (
        props.ndx
          .dimension((d) => d.status)
          .group()
          .all()
          .find((g) => g.key === 'Finished')?.value || 0
      )

    case 'resourceCount':
      return group.reduceSum((d) => d.cvCount || 1).value()

    case 'totalWage':
      return group.reduceSum((d) => d.wage || 0).value()

    case 'peopleCount':
      return group.reduceCount().value()

    case 'avgWage':
      const total = group.reduceSum((d) => d.wage || 0).value()
      const count = group.reduceCount().value()
      return count ? total / count : 0

    case 'skillCount':
      if (props.ndx.dimension((d) => d.skill)) {
        return props.ndx
          .dimension((d) => d.skill)
          .group()
          .all()
          .reduce((sum, g) => sum + g.value, 0)
      }
      return 0

    default:
      return 0
  }
}

// Formatting functions
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...props.formatOptions,
  }).format(value)
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US', props.formatOptions).format(value)
}

// Update values when filters change
function updateValues() {
  previousValue.value = currentValue.value
  currentValue.value = calculateValue()
}

// Setup DC.js chart for reactivity
onMounted(() => {
  dummyChart.value = {
    render: () => {
      updateValues()
    },
    redraw: () => {
      updateValues()
    },
    filterAll: () => {
      updateValues()
    },
  }

  dc.registerChart(dummyChart.value)
  updateValues()
})

onUnmounted(() => {
  if (dummyChart.value) {
    dc.deregisterChart(dummyChart.value)
    dummyChart.value = null
  }
})

// Watch for filter changes
watch(
  () => props.ndx.allFiltered(),
  () => {
    updateValues()
  }
)
</script>

<style scoped>
.stat-card {
  overflow: hidden;
  transition: all 0.2s ease;
  border-radius: 8px;
  background: var(--v-background-base, #ffffff);
}

.stat-card-wrapper {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}

/* Icon Section */
.icon-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(
    135deg,
    var(--gradient-start),
    var(--gradient-end)
  );
}

/* Color variants */
.icon-section.primary {
  --gradient-start: #1976d2;
  --gradient-end: #64b5f6;
}

.icon-section.success {
  --gradient-start: #2e7d32;
  --gradient-end: #81c784;
}

.icon-section.warning {
  --gradient-start: #f57c00;
  --gradient-end: #ffb74d;
}

.icon-section.error {
  --gradient-start: #c62828;
  --gradient-end: #ef5350;
}

.icon-section.info {
  --gradient-start: #0288d1;
  --gradient-end: #4fc3f7;
}

/* Content Section */
.content-section {
  flex-grow: 1;
  min-width: 0; /* Prevents flex item from overflowing */
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.stat-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--v-medium-emphasis-color, rgba(0, 0, 0, 0.6));
}

/* Value Section */
.value-section {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--v-high-emphasis-color, rgba(0, 0, 0, 0.87));
  margin-right: 8px;
  white-space: nowrap;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: var(--v-medium-emphasis-color, rgba(0, 0, 0, 0.6));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Trend Indicator */
.trend-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--v-surface-variant, rgba(0, 0, 0, 0.05));
}

.trend-value {
  font-size: 0.75rem;
  font-weight: 600;
}

/* Progress Bar */
.stat-progress {
  margin-top: 6px;
}

/* Dark Theme Support */
:deep(.v-theme--dark) {
  .stat-card {
    background-color: var(--v-surface-variant, #1e1e1e);
  }

  .stat-title {
    color: rgba(255, 255, 255, 0.7);
  }

  .stat-value {
    color: rgba(255, 255, 255, 0.87);
  }

  .stat-subtitle {
    color: rgba(255, 255, 255, 0.6);
  }

  .trend-indicator {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .stat-card-wrapper {
    padding: 8px;
  }

  .icon-section {
    min-width: 28px;
    height: 28px;
  }

  .stat-value {
    font-size: 1rem;
  }
}
</style>
