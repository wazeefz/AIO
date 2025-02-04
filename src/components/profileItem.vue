<template>
  <v-card class="pa-4">
    <v-card-title>{{ profile.name }}</v-card-title>
    <v-card-subtitle>{{ profile.department }}</v-card-subtitle>

    <v-card-text>
      <p><strong>Title:</strong> {{ profile.title }}</p>
      <p><strong>Salary:</strong> {{ profile.salary }}</p>
      <p><strong>Skills:</strong> {{ profile.skills.join(', ') }}</p>
      <p><strong>Email:</strong> {{ profile.email }}</p>
      <p><strong>Employment:</strong> {{ profile.employment }}</p>
    </v-card-text>

    <!-- Cancel Button -->
    <v-btn color="error" @click="cancelProfile">Cancel</v-btn>
  </v-card>
</template>

<script setup>
const props = defineProps({
  profile: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['cancel'])

const cancelProfile = () => {
  emit('cancel', props.profile.id)
}
</script>

<style scoped>
/* Add custom styles here */
</style>
