<!-- Marcus/index.vue -->
<template>
  <div>
    <v-row>
      <!-- Filter Interface -->
      <v-col cols="12" md="4">
        <filter-interface />
      </v-col>

      <!-- Results -->
      <v-col cols="12" md="8">
        <h2>Active Filters</h2>
        <base-chips
          :chips="filterChips"
          :closable="true"
          @remove-chip="handleFilterRemoval"
        />

        <!-- Results Display -->
        <div class="mt-6">
          <h2>
            Filtered Results ({{ filterStore.filteredResults.length }} matches)
          </h2>
          <v-card
            v-for="result in filterStore.filteredResults"
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
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed } from 'vue'
import BaseChips from '@/components/Chips.vue'
import FilterInterface from '@/components/FilterInterface.vue'
import { useFilterStore } from '@/stores/filterStore'

export default {
  name: 'MarcusPage',
  components: {
    BaseChips,
    FilterInterface,
  },
  setup() {
    const filterStore = useFilterStore()

    const filterChips = computed(() =>
      filterStore.activeFilters.map((filter) => ({
        label: filter.value,
        color: getColorForCategory(filter.category),
        category: filter.category,
        value: filter.value,
      }))
    )

    const handleFilterRemoval = (chip) => {
      filterStore.removeFilter(chip.category, chip.value)
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
      filterStore,
      filterChips,
      handleFilterRemoval,
    }
  },
}
</script>
