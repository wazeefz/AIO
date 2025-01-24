<template>
  <div>
    <v-row>
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
          <!-- Action Buttons Card -->
          <div class="d-flex justify-end mb-4">
            <v-card
              class="action-buttons-card d-inline-flex align-center"
              rounded="pill"
              color="#EAE3D6"
              elevation="0"
            >
              <!-- Add Button (visible only in edit mode) -->
              <v-btn v-if="isEditing" icon color="green" @click="handleAddItem">
                <v-icon>mdi-plus</v-icon>
              </v-btn>

              <!-- Divider (visible only in edit mode) -->
              <v-divider
                v-if="isEditing"
                vertical
                class="mx-2"
                color="#292D32"
              ></v-divider>

              <!-- Edit Button -->
              <v-btn
                :color="isEditing ? 'error' : '#B1A184'"
                class="custom-edit-btn"
                icon
                @click="toggleEdit"
              >
                <v-icon color="#292D32">
                  {{ isEditing ? 'mdi-close' : 'mdi-pencil' }}
                </v-icon>
              </v-btn>

              <!-- Divider -->
              <v-divider vertical class="mx-2" color="#292D32"></v-divider>

              <!-- Filter Button -->
              <v-btn icon @click="toggleFilter">
                <v-icon color="#292D32">mdi-tune-vertical</v-icon>
              </v-btn>
            </v-card>
          </div>

          <h2>
            Filtered Results ({{ filterStore.filteredResults.length }} matches)
          </h2>
          <!-- ProfileCard Component -->
          <ProfileCard
            v-for="result in filterStore.filteredResults"
            :key="result.id"
            :result="result"
            :is-editing="isEditing"
            @click="handleModalOpen"
            @modal-closed="handleModalClose"
            @remove-item="handleRemoveItem"
          />
        </div>

        <!-- Filter Dialog -->
        <v-dialog v-model="showFilterDialog" max-width="800px" persistent>
          <v-card>
            <v-card-title class="headline">
              Filter Options
              <v-spacer></v-spacer>
              <v-btn icon @click="closeFilterDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-container>
                <FilterInterface @apply-filters="closeFilterDialog" />
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseChips from '@/components/Chips.vue'
import FilterInterface from '@/components/FilterInterface.vue'
import { useFilterStore } from '@/stores/filterStore'
import ProfileCard from '@/components/profileCard.vue'
import { useJobFilter } from '@/plugins/useJobFilter'
import { mockData } from '@/mockdata/mockData'

const filterStore = useFilterStore()
const { filterJobs, isLoading } = useJobFilter()

// Local state
const isEditing = ref(false)
const showFilterDialog = ref(false)

// Computed properties
const filterChips = computed(() =>
  filterStore.activeFilters.map((filter) => ({
    label: filter.value,
    category: filter.category,
    value: filter.value,
  }))
)

// Event handlers
const handleFilterRemoval = (chip) => {
  filterStore.removeFilter(chip.category, chip.value)
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const toggleFilter = () => {
  showFilterDialog.value = true
}

const closeFilterDialog = () => {
  showFilterDialog.value = false
}

const handleFilter = async () => {
  await filterJobs()
  closeFilterDialog()
}

const clearAllFilters = () => {
  filterStore.clearFilters()
}

const handleAddItem = () => {
  console.log('Add item clicked')
  // Implement add item logic here
}

const handleRemoveItem = (item) => {
  filterStore.removeResult(item.id)
}

const handleModalOpen = () => {
  showModal.value = true
  emit('modal-opened', props.result)
}

const handleModalClose = () => {
  showModal.value = false
  emit('modal-closed')
}

// Watcher for filter store changes
watch(
  () => filterStore.filters,
  () => {
    handleFilter()
  },
  { deep: true }
)
</script>

<style scoped>
.action-buttons-card {
  padding: 4px 8px;
}

.custom-edit-btn {
  height: 40px;
  width: 40px;
}

:deep(.v-btn) {
  box-shadow: none !important;
}

:deep(.v-btn:hover) {
  opacity: 0.8;
}

:deep(.v-divider) {
  border-color: #292d32 !important;
  opacity: 0.5;
}

:deep(.v-btn--icon) {
  background: transparent;
}

:deep(.v-btn--icon.custom-edit-btn .v-btn__content) {
  border-radius: 50%;
  background-color: currentColor;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.v-btn--icon .v-icon) {
  z-index: 1;
}
</style>
