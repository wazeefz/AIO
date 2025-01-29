<template>
  <ProjectSelection />
  <ActionButton />
  <h2>Team Members ({{ filteredTeamMembers.length }})</h2>

  <!-- ProfileCard Component -->
  <v-row class="gap-4">
    <v-col
      v-for="result in filteredTeamMembers"
      :key="result.id"
      cols="12"
      sm="6"
    >
      <ProfileCard
        :result="result"
        :is-editing="isEditing"
        @click="handleModalOpen(result)"
        @modal-closed="handleModalClose"
        @remove-profile="handleRemoveItem"
      />
    </v-col>
  </v-row>

  <!-- Filter Dialog -->
  <v-dialog v-model="showFilterDialog" max-width="800px" persistent>
    <v-card>
      <v-card-text>
        <v-container>
          <FilterInterface />
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="handleFilterAndClose">
          Apply Filters
        </v-btn>
        <v-btn color="error" @click="clearAllFilters">
          Clear All Filters
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { useProjectStore } from '@/stores/projectStore'
import { useJobFilter } from '@/plugins/useJobFilter'
import ProjectSelection from '@/components/final/ProjectSelection.vue'
import ActionButton from '@/components/final/ActionButton.vue'
import ProfileCard from '@/components/final/ProfileCard.vue'
import FilterInterface from '@/components/final/FilterInterface.vue'

const filterStore = useFilterStore()
const projectStore = useProjectStore()
const { filterJobs } = useJobFilter()

const isEditing = ref(false)
const showFilterDialog = ref(false)

// Computed property to get the current project's team members
const currentProject = computed(() => projectStore.currentProject)
const filteredTeamMembers = computed(() => filterStore.filteredResults)

const handleRemoveItem = (memberId) => {
  if (currentProject.value) {
    projectStore.removeTeamMember(currentProject.value.id, memberId)
    filterStore.filteredResults = filterStore.filteredResults.filter(
      (result) => result.id !== memberId
    )
  }
}

const handleFilterAndClose = async () => {
  await filterJobs() // Apply filters
  closeFilterDialog() // Close the dialog
}

const closeFilterDialog = () => {
  showFilterDialog.value = false
}

const clearAllFilters = () => {
  filterStore.clearFilters() // Clear all filters
}

const handleModalOpen = (result) => {
  // Handle modal open logic here
  console.log('Modal opened for:', result)
}

const handleModalClose = () => {
  // Handle modal close logic here
  console.log('Modal closed')
}
</script>
