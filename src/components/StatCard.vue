<template>
  <v-card class="stat-card" outlined>
    <v-card-title class="stat-card-title">
      <v-icon :size="48" class="stat-card-icon">{{ icon }}</v-icon>
      <div class="stat-card-content">
        <h3 class="stat-card-value">{{ value }}</h3>
        <h4 class="stat-card-title-text">{{ title }}</h4>
        <p class="stat-card-subtitle">{{ subtitle }}</p>
      </div>
    </v-card-title>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'

// Props for the StatCard component
defineProps({
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
    required: false,
    default: '',
  },
  icon: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: start;
  padding: 16px;
}

.stat-card-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
}

.stat-card-icon {
  color: var(--v-primary-base);
}

.stat-card-content {
  display: flex;
  flex-direction: column;
}

.stat-card-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.stat-card-title-text {
  font-size: 1.25rem;
  margin: 0;
}

.stat-card-subtitle {
  font-size: 0.875rem;
  color: var(--v-secondary-darken4);
}
</style>
