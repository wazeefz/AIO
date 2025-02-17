<template>
  <div>
    <!-- Loading State -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
    ></v-progress-circular>

    <div v-else>
      <!-- Error State -->
      <v-alert v-if="error" type="error" closable class="mb-4">
        {{ error }}
      </v-alert>

      <!-- Project Selection -->
      <v-card v-if="projectItems.length > 0" class="mb-4">
        <v-card-title>
          <h2>Project Management</h2>
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedProjectId"
            :items="projectItems"
            label="Select Project"
            item-title="title"
            item-value="id"
            @update:model-value="handleProjectChange"
          />
        </v-card-text>
      </v-card>

      <!-- No Projects State -->
      <v-alert v-else type="info" class="mb-4">
        No projects available.
      </v-alert>

      <v-row v-if="selectedProjectId">
        <!-- Results -->
        <v-col cols="12" md="11">
          <FunCards />

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
            <!-- Replace the existing action buttons with ActionBtn -->
            <ActionBtn
              :isEditing="isEditing"
              @add-profile="openAddProfileModal"
              @edit-toggled="toggleEdit"
              @filter-toggled="toggleFilter"
            />

            <!-- Team Members Section -->
            <h2>Team Members ({{ filterStore.filteredTeamMembers.length }})</h2>

            <!-- ProfileCard Component -->
            <v-row class="gap-4">
              <v-col
                v-for="result in filterStore.filteredTeamMembers"
                :key="result.id"
                cols="12"
                sm="6"
              >
                <ProfileCard
                  :result="result"
                  :is-editing="isEditing"
                  @click="handleModalOpen"
                  @modal-closed="handleModalClose"
                  @remove-profile="handleRemoveItem"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Filter Dialog -->
          <v-dialog v-model="showFilterDialog" max-width="800px" persistent>
            <v-card>
              <v-card-text>
                <v-container>
                  <FilterInterface
                    :is-modal="false"
                    @close-filter-dialog="closeFilterDialog"
                  />
                </v-container>
              </v-card-text>
            </v-card>
          </v-dialog>

          <!-- Add Profile Modal -->
          <AddProfileModal
            v-if="currentProject"
            v-model:showModal="showAddProfileModal"
            :current-project="currentProject"
            @profiles-added="handleProfilesAdded"
            @filter-chips-updated="updateFilterChipsAddProfile"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import BaseChips from '@/components/Chips.vue'
import FilterInterface from '@/components/FilterInterface.vue'
import { useFilterStore } from '@/stores/filterStore'
import { useProjectStore } from '@/stores/projectStore'
import ProfileCard from '@/components/profileCard.vue'
import AddProfileModal from '@/components/addProfileModal.vue'
import ActionBtn from './ActionBtn.vue' // Import the ActionBtn component
import FunCards from './FunCards.vue'

const filterStore = useFilterStore()
const projectStore = useProjectStore()

// Local state
const isEditing = ref(false)
const showFilterDialog = ref(false)
const showAddProfileModal = ref(false)
const selectedProjectId = ref(null)
const loading = ref(true)
const error = ref(null)

// Project-related computed properties
const projectItems = computed(() => {
  try {
    if (!projectStore.projects) return []
    return projectStore.projects.map((project) => ({
      title: project.projectName,
      id: project.id,
    }))
  } catch (e) {
    error.value = 'Error loading projects'
    return []
  }
})

const currentProject = computed(() => projectStore.currentProject)

// Computed properties
const filterChips = computed(() => {
  try {
    return filterStore.activeTeamFilters.map((filter) => ({
      label: filter.value,
      category: filter.category,
      value: filter.value,
    }))
  } catch (e) {
    console.error('Error computing filter chips:', e)
    return []
  }
})

// Event handlers
const handleProjectChange = async (projectId) => {
  try {
    loading.value = true
    await projectStore.setCurrentProject(projectId)
    filterStore.clearTeamFilters() // Reset filters when changing projects
  } catch (e) {
    error.value = 'Error changing project'
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleFilterRemoval = (chip) => {
  filterStore.removeTeamFilter(chip.category, chip.value)
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const toggleFilter = () => {
  showFilterDialog.value = true
}

const openAddProfileModal = () => {
  showAddProfileModal.value = true
}

const handleRemoveItem = (memberId) => {
  try {
    if (currentProject.value) {
      projectStore.removeTeamMember(currentProject.value.id, memberId)
    }
  } catch (e) {
    error.value = 'Error removing team member'
    console.error(e)
  }
}

const handleProfilesAdded = (selectedEmployees) => {
  try {
    if (currentProject.value) {
      const memberIds = selectedEmployees.map((emp) => emp.id)
      projectStore.addTeamMembers(currentProject.value.id, memberIds)
    }
    showAddProfileModal.value = false
  } catch (e) {
    error.value = 'Error adding team members'
    console.error(e)
  }
}

const filterChipsAddProfile = ref([])
const updateFilterChipsAddProfile = (chips) => {
  filterChipsAddProfile.value = chips
}

// Initialize
onMounted(async () => {
  try {
    loading.value = true
    // Wait for projects to load
    await new Promise((resolve) => setTimeout(resolve, 0))

    if (projectItems.value.length > 0) {
      selectedProjectId.value = projectItems.value[0].id
      await handleProjectChange(selectedProjectId.value)
    }
  } catch (e) {
    error.value = 'Error initializing page'
    console.error(e)
  } finally {
    loading.value = false
  }
})

// Close filter dialog
const closeFilterDialog = () => {
  showFilterDialog.value = false
}
</script>

<style scoped>
/* Add your styles here */
</style>
