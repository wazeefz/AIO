<template>
  <v-container>
    <h1>CapyBaiAI</h1>

    <!-- Filter Interface -->
    <ProfileFilter @filter="handleFilter" />
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProfileFilter from '@/components/profileFilter.vue'
import ProfileItem from '@/components/profileItem.vue'
import { mockData } from '@/mockdata/mockData'

// Local state
const profiles = ref(mockData)
const filters = ref({})

// Filtered profiles based on active filters
const filteredProfiles = computed(() => {
  return profiles.value.filter((profile) => {
    return (
      (!filters.value.department ||
        profile.department === filters.value.department) &&
      (!filters.value.title || profile.title === filters.value.title) &&
      (!filters.value.salary || profile.salary === filters.value.salary) &&
      (!filters.value.availability ||
        profile.availability === filters.value.availability) &&
      (!filters.value.skills ||
        filters.value.skills.every((skill) => profile.skills.includes(skill)))
    )
  })
})

// Handle filter changes
const handleFilter = (newFilters) => {
  filters.value = newFilters
}

// Handle profile cancellation
const handleCancel = (profileId) => {
  profiles.value = profiles.value.filter((profile) => profile.id !== profileId)
}
</script>

<style scoped>
/* Add custom styles here */
</style>
