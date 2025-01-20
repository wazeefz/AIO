<!-- Marcus/index.vue -->
<template>
  <div>
    <h2>Active Filters</h2>
    <base-chips
      :chips="filterChips"
      :closable="true"
      @remove-chip="handleFilterRemoval"
    />

    <!-- Results Display -->
    <div class="mt-6">
      <h2>Filtered Results ({{ filteredResults.length }} matches)</h2>
      <v-card
        v-for="result in filteredResults"
        :key="result.id"
        class="mb-4 pa-4"
      >
        <v-card-title>{{ result.title }}</v-card-title>
        <v-card-subtitle>{{ result.company }}</v-card-subtitle>
        <v-card-text>
          <div><strong>Role:</strong> {{ result.role }}</div>
          <div><strong>Salary:</strong> {{ result.salary }}</div>
          <div>
            <strong>Skills:</strong>
            <v-chip
              v-for="skill in result.skills"
              :key="skill"
              size="small"
              class="mr-2 mt-2"
            >
              {{ skill }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import BaseChips from '@/components/Chips.vue'
import { useFilters } from '@/composables/useFilters'

export default {
  name: 'MarcusPage',
  components: {
    BaseChips,
  },
  setup() {
    const {
      filters,
      removeFilter,
      activeFilters,
      filteredResults,
      initializeFilters,
    } = useFilters()

    // Initial chip data remains the same
    const initialChips = {
      skills: [
        { label: 'Javascript', color: 'amber darken-3' },
        { label: 'HTML', color: 'deep-orange' },
        { label: 'CSS', color: 'blue' },
        { label: 'Bootstrap', color: 'purple' },
        { label: 'Adobe Photoshop', color: 'blue-grey' },
      ],
      salary: [{ label: 'RM6,000-RM10,000', color: 'light-green lighten-1' }],
      role: [{ label: 'Developer', color: 'blue lighten-1' }],
    }

    onMounted(() => {
      initializeFilters(initialChips)
    })

    const filterChips = computed(() =>
      activeFilters.value.map((filter) => ({
        label: filter.value,
        color: getColorForCategory(filter.category),
        category: filter.category,
        value: filter.value, // Add this line
      }))
    )

    // Update the handleFilterRemoval function
    const handleFilterRemoval = (chip) => {
      removeFilter(chip.category, chip.value)
    }

    const getColorForCategory = (category) => {
      const colors = {
        skills: 'amber darken-3',
        salary: 'light-green lighten-1',
        role: 'blue lighten-1',
      }
      return colors[category] || 'grey'
    }

    return {
      filterChips,
      handleFilterRemoval,
      filteredResults,
    }
  },
}
</script>
