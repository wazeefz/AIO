<template>
  <v-card 
    :class="['stat-card', { 'dense': dense }]" 
    :elevation="hover ? 3 : 1"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="stat-card-wrapper">
      <div class="content-wrapper">
        <!-- Title with inline icon -->
        <div class="title-row">
          <v-icon :size="dense ? 16 : 18" :color="iconColor" class="title-icon">{{ icon }}</v-icon>
          <span class="stat-title">{{ title }}</span>
        </div>

        <!-- Value and Trend -->
        <div class="value-section">
          <h3 class="stat-value">{{ value }}</h3>
          <div class="trend-indicator" v-if="trend">
            <v-icon 
              :color="trend > 0 ? 'success' : 'error'"
              :size="dense ? 14 : 16"
            >
              {{ trend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
            </v-icon>
            <span :class="trend > 0 ? 'success--text' : 'error--text'">
              {{ Math.abs(trend) }}%
            </span>
          </div>
        </div>

        <!-- Subtitle -->
        <p class="stat-subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Progress Bar (Optional) -->
    <v-progress-linear
      v-if="progress !== undefined"
      :value="progress"
      :color="progressColor"
      height="3"
      class="stat-progress"
    ></v-progress-linear>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
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
  trend: {
    type: Number,
    default: null,
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
})

const hover = ref(false)
</script>

<style scoped>
.stat-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.stat-card-wrapper {
  padding: var(--card-padding, 16px);
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  opacity: 0.9;
}

.value-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 4px 0;
}

.stat-value {
  font-size: var(--value-font-size, 1.5rem);
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-title {
  font-size: var(--title-font-size, 0.875rem);
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  margin: 0;
}

.stat-subtitle {
  font-size: var(--subtitle-font-size, 0.75rem);
  color: rgba(0, 0, 0, 0.5);
  margin: 0;
}

.stat-progress {
  margin-top: 8px;
}

/* Dense mode */
.dense {
  --card-padding: 12px;
  --value-font-size: 1.25rem;
  --title-font-size: 0.813rem;
  --subtitle-font-size: 0.75rem;
}

.dense .stat-card-wrapper {
  padding: 12px;
}

/* Hover effects */
.stat-card:hover {
  transform: translateY(-2px);
}

/* Dark theme support */
:deep(.v-theme--dark) {
  .stat-title {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .stat-subtitle {
    color: rgba(255, 255, 255, 0.6);
  }
}
</style>