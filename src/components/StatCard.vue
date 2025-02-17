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
        <!-- Title -->
        <div class="header-section">
          <span class="stat-title">{{ title }}</span>
        </div>

        <!-- Value or Subtitle -->
        <div class="value-section">
          <span v-if="hasValue" class="stat-value">{{ computedValue }}</span>
          <span v-else class="stat-value">{{ subtitle }}</span>
        </div>
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
  dense: {
    type: Boolean,
    default: false,
  },
  ndx: {
    type: Object,
    default: null,
  },
  valueType: {
    type: String,
    default: null,
    validator: (value) =>
      !value ||
      [
        // Talent metrics
        'totalSalary',
        'peopleCount',
        'avgSalary',
        'departmentCount',
        'fullTimeCount',
        'partTimeCount',
        'availableCount',
        'avgExperience',
        // Project metrics
        'totalRevenue',
        'projectCount',
        'resourceCount',
        'completedProjects',
        'activeProjects',
        'totalBudget',
        'avgBudget'
      ].includes(value),
  },
})

const hover = ref(false)
const currentValue = ref(null)
const dummyChart = ref(null)

const hasValue = computed(() => {
  return props.ndx && props.valueType
})

const computedValue = computed(() => {
  if (!currentValue.value) return '0'

  switch (props.valueType) {
    case 'totalSalary':
    case 'avgSalary':
    case 'totalRevenue':
    case 'totalBudget':
    case 'avgBudget':
      return formatCurrency(currentValue.value)
    
    case 'peopleCount':
    case 'departmentCount':
    case 'fullTimeCount':
    case 'partTimeCount':
    case 'availableCount':
    case 'projectCount':
    case 'resourceCount':
    case 'completedProjects':
    case 'activeProjects':
      return formatNumber(currentValue.value)
    
    case 'avgExperience':
      return formatDecimal(currentValue.value) + ' years'
    
    default:
      return currentValue.value
  }
})

function calculateValue() {
  if (!props.ndx || !props.valueType) return null

  const group = props.ndx.groupAll()

  switch (props.valueType) {
    // Talent metrics
    case 'totalSalary':
      return group.reduceSum((d) => d.basic_salary || 0).value()
    
    case 'peopleCount':
      return group.reduceCount().value()
    
    case 'avgSalary':
      const totalSalary = group.reduceSum((d) => d.basic_salary || 0).value()
      const count = group.reduceCount().value()
      return count ? totalSalary / count : 0
    
    case 'departmentCount':
      return props.ndx
        .dimension((d) => d.department_id)
        .group()
        .all()
        .length
    
    case 'fullTimeCount':
      return props.ndx
        .dimension((d) => d.employment_type)
        .group()
        .all()
        .find((g) => g.key === 'FULL_TIME')?.value || 0
    
    case 'partTimeCount':
      return props.ndx
        .dimension((d) => d.employment_type)
        .group()
        .all()
        .find((g) => g.key === 'PART_TIME')?.value || 0
    
    case 'availableCount':
      return props.ndx
        .dimension((d) => d.availability_status)
        .group()
        .all()
        .find((g) => g.key === 'Available')?.value || 0
    
    case 'avgExperience':
      const totalExp = group.reduceSum((d) => d.total_experience_years || 0).value()
      const empCount = group.reduceCount().value()
      return empCount ? totalExp / empCount : 0

    // Project metrics
    case 'totalRevenue':
    case 'totalBudget':
      return group.reduceSum((d) => d.budget || 0).value()
    
    case 'projectCount':
      return group.reduceCount().value()
    
    case 'resourceCount':
      return group.reduceSum((d) => d.cv_count || 0).value()
    
    case 'completedProjects':
      return props.ndx
        .dimension((d) => d.status)
        .group()
        .all()
        .find((g) => g.key === 'COMPLETED')?.value || 0
    
    case 'activeProjects':
      return props.ndx
        .dimension((d) => d.status)
        .group()
        .all()
        .find((g) => g.key === 'IN_PROGRESS')?.value || 0
    
    case 'avgBudget':
      const totalBudget = group.reduceSum((d) => d.budget || 0).value()
      const projectCount = group.reduceCount().value()
      return projectCount ? totalBudget / projectCount : 0
    
    default:
      return 0
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatDecimal(value) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

function updateValues() {
  if (props.ndx && props.valueType) {
    currentValue.value = calculateValue()
  }
}

onMounted(() => {
  if (props.ndx && props.valueType) {
    dummyChart.value = {
      render: updateValues,
      redraw: updateValues,
      filterAll: updateValues,
    }
    dc.registerChart(dummyChart.value)
    updateValues()
  }
})

watch(
  () => props.ndx?.allFiltered(),
  () => {
    if (props.ndx && props.valueType) {
      updateValues()
    }
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

.content-section {
  flex-grow: 1;
  min-width: 0;
}

.header-section {
  margin-bottom: 4px;
}

.stat-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--v-medium-emphasis-color, rgba(0, 0, 0, 0.6));
}

.value-section {
  display: flex;
  align-items: baseline;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--v-high-emphasis-color, rgba(0, 0, 0, 0.87));
}

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
}

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
