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
        <!-- Chips component -->
        <base-chips
          :chips="filterChips"
          :closable="true"
          :use-color-mapping="true"
          @remove-chip="handleFilterRemoval"
        />

        <!-- Results Display -->
        <div class="mt-6">
          <h2>
            Filtered Results ({{ filterStore.filteredResults.length }} matches)
          </h2>
          <!-- ProfileCard Component -->
          <ProfileCard
            v-for="result in filterStore.filteredResults"
            :key="result.id"
            :result="result"
            @modal-opened="handleModalOpen"
            @modal-closed="handleModalClose"
          />
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
        category: filter.category,
        value: filter.value,
      }))
    )

    const handleFilterRemoval = (chip) => {
      filterStore.removeFilter(chip.category, chip.value)
    }

    const getColorForCategory = (category) => {
      const colors = {
        skills: 'blue-grey-darken-4',
        salary: 'light-green lighten-1',
        title: 'blue lighten-1',
        department: 'brown-lighten-2',
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
