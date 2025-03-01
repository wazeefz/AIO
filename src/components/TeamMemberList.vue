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
            item-title="name"
            item-value="project_id"
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
            <div class="team-members-section">
              <h2 class="mb-4">
                Team Members ({{ filterStore.filteredTeamMembers.length }})
              </h2>

              <!-- ProfileCard Component -->
              <div class="scrollable-cards-container">
                <v-row>
                  <v-col
                    v-for="result in filterStore.filteredTeamMembers"
                    :key="result.id"
                    cols="12"
                    sm="6"
                    class="pa-2"
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
            </div>
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
import { useProjectManagementStore } from '@/stores/projectStore'
import ProfileCard from '@/components/profileCard.vue'
import AddProfileModal from '@/components/addProfileModal.vue'
import ActionBtn from '@/components/ActionBtn.vue'

const filterStore = useFilterStore()
const projectStore = useProjectManagementStore()

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
      name: project.name,
      project_id: project.project_id,
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
  if (!projectId) return

  try {
    loading.value = true
    error.value = null
    await projectStore.setCurrentProject(projectId)
    filterStore.clearTeamFilters() // Reset filters when changing projects
  } catch (e) {
    error.value = e.message || 'Error changing project'
    console.error('Project change error:', e)
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

const handleRemoveItem = async (memberId) => {
  try {
    if (!currentProject.value) {
      error.value = 'No project selected'
      return
    }
    loading.value = true
    error.value = null
    await projectStore.removeTeamMember(
      currentProject.value.project_id,
      memberId
    )
  } catch (e) {
    error.value = e.message || 'Error removing team member'
    console.error('Remove member error:', e)
  } finally {
    loading.value = false
  }
}

const handleProfilesAdded = async (selectedEmployees) => {
  try {
    if (!currentProject.value) {
      error.value = 'No project selected'
      return
    }
    if (!selectedEmployees?.length) {
      error.value = 'No employees selected'
      return
    }
    loading.value = true
    error.value = null
    const memberIds = selectedEmployees.map((emp) => emp.talent_id)
    await projectStore.addTeamMembers(
      currentProject.value.project_id,
      memberIds
    )
    showAddProfileModal.value = false
  } catch (e) {
    error.value = e.message || 'Error adding team members'
    console.error('Add members error:', e)
  } finally {
    loading.value = false
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
    error.value = null
    await projectStore.initializeProjects()

    if (projectItems.value.length > 0) {
      selectedProjectId.value = projectItems.value[0].project_id
      await handleProjectChange(selectedProjectId.value)
    } else {
      error.value = 'No projects available'
    }
  } catch (e) {
    error.value = e.message || 'Error initializing page'
    console.error('Initialization error:', e)
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
.team-members-section {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 350px);
  min-height: 400px;
  margin-top: 16px;
  position: relative;
  padding-bottom: 24px;
}

.scrollable-cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  position: absolute;
  top: 40px;
  left: 0;
  right: 8px;
  bottom: 24px;
  margin-bottom: 2px;
}

.scrollable-cards-container .v-row {
  margin: -8px;
  min-height: min-content;
  height: auto;
  padding-bottom: 2px;
}

.scrollable-cards-container .v-col {
  padding: 10px;
}

/* Custom scrollbar styling */
.scrollable-cards-container::-webkit-scrollbar {
  width: 8px;
  margin-right: 8px;
}

.scrollable-cards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin-bottom: 7px;
}

.scrollable-cards-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
  margin-bottom: 4px;
}

.scrollable-cards-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
