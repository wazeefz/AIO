<template>
  <div class="d-flex flex-wrap gap-2">
    <v-chip
      v-for="skill in skillChips"
      :key="skill.label"
      variant="elevated"
      class="mr-2 mb-2"
      color="#2d2d2d"
      text-color="white"
    >
      {{ skill.label }}
    </v-chip>
  </div>
</template>

<script setup>
import BaseChips from '@/components/Chips.vue'
import { ref, computed } from 'vue'

const skillChips = computed(() => {
  return props.result.skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem;
}
</style>
