<template>
  <v-card
    class="mb-4 profile-card cursor-pointer"
    @click="openModal"
    color="#c2b7a4"
    rounded="lg"
  >
    <v-card-text class="pa-6">
      <!-- Card Header -->
      <slot name="card-header" :result="result">
        <v-card-title class="text-h5 font-weight-medium pa-0 text-white mb-1">
          {{ result.name }}
        </v-card-title>
        <v-card-subtitle class="pa-0 text-white mb-2">
          {{ result.title }}
        </v-card-subtitle>
        <v-card-subtitle class="pa-0 text-white mb-2">
          {{ result.department }}
        </v-card-subtitle>
        <v-card-subtitle class="pa-0 text-white mb-4">
          {{ result.salary }}
        </v-card-subtitle>
        <v-card-subtitle class="pa-0 text-white mb-4">
          {{ result.employment }}
        </v-card-subtitle>
      </slot>

      <!-- Skills Slot -->
      <slot name="skills" :skills="skillChips">
        <ProfileCardSkills :skills="skillChips" />
      </slot>
    </v-card-text>
  </v-card>
</template>

<script setup>
import ProfileCardSkills from '@/components/items/ProfileCardSkills.vue'
import { computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open-modal'])

const skillChips = computed(() => {
  return props.result.skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})

const openModal = () => {
  emit('open-modal')
}
</script>

<style scoped>
.profile-card {
  position: relative;
  overflow: hidden;
  --ring-color: rgba(255, 255, 255, 0.05);
}

/* First ring */
.profile-card::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Second ring */
.profile-card::after {
  content: '';
  position: absolute;
  top: -150px;
  right: -150px;
  width: 400px;
  height: 400px;
  border: 2px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

/* Third ring */
.profile-card .v-card-text::before {
  content: '';
  position: absolute;
  top: -200px;
  right: -200px;
  width: 500px;
  height: 500px;
  border: 2px solid var(--ring-color);
  border-radius: 50%;
}

/* Fourth ring */
.profile-card .v-card-text::after {
  content: '';
  position: absolute;
  top: -250px;
  right: -250px;
  width: 600px;
  height: 600px;
  border: 2px solid var(--ring-color);
  border-radius: 50%;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>
