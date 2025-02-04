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
                <v-btn
                  v-if="isEditing"
                  icon
                  color="green"
                  @click="openAddProfileModal"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>

                <v-divider
                  v-if="isEditing"
                  vertical
                  class="mx-2"
                  color="#292D32"
                ></v-divider>

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

                <v-divider vertical class="mx-2" color="#292D32"></v-divider>

                <v-btn icon @click="toggleFilter">
                  <v-icon color="#292D32">mdi-tune-vertical</v-icon>
                </v-btn>
              </v-card>
            </div>

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
import { useJobFilter } from '@/plugins/useJobFilter'

const filterStore = useFilterStore()
const projectStore = useProjectStore()
const { filterJobs } = useJobFilter()

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

const handleFilterAndClose = async () => {
  try {
    await filterJobs()
    closeFilterDialog()
  } catch (e) {
    error.value = 'Error applying filters'
    console.error(e)
  }
}

const clearAllFilters = () => {
  filterStore.clearTeamFilters()
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
