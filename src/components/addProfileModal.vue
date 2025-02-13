<template>
  <v-dialog
    v-model="localShowModal"
    max-width="800px"
    @update:model-value="handleDialogUpdate"
  >
    <v-card>
      <v-card-title class="headline d-flex justify-space-between align-center">
        <span>Add Team Members to {{ currentProject.projectName }}</span>
        <v-btn icon @click="closeModal" variant="plain">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- Filter Button -->
        <div class="d-flex justify-end mb-4">
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
            </v-col>
          </v-row>
          <v-btn color="#EAE3D6" icon @click="showFilterDialog = true">
            <v-icon color="#292D32">mdi-tune-vertical</v-icon>
          </v-btn>
        </div>

        <!-- Filter Dialog -->
        <v-dialog v-model="showFilterDialog" max-width="800px" persistent>
          <v-card>
            <FilterInterface
              :is-modal="true"
              @filter-applied="handleFiltersApplied"
              @close-filter-dialog="closeFilterDialog"
            />
          </v-card>
        </v-dialog>

        <div class="mt-4">
          <h3 class="text-h6 mb-3">
            Available Employees ({{ availableEmployees.length }})
          </h3>
          <v-row class="gap-4">
            <v-col
              v-for="employee in availableEmployees"
              :key="employee.id"
              cols="12"
              sm="6"
            >
              <ProfileCard
                :result="employee"
                :selectable="true"
                :is-add-mode="true"
                @click="showDetail(employee)"
                @modal-closed="closeDetailModal"
                @confirm-add-profile="confirmAddProfile"
              />
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { useProjectStore } from '@/stores/projectStore'
import FilterInterface from '@/components/FilterInterface.vue'
import ProfileCard from '@/components/profileCard.vue'
import BaseChips from '@/components/Chips.vue'

const props = defineProps({
  showModal: {
    type: Boolean,
    default: false,
  },
  currentProject: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'update:showModal',
  'profiles-added',
  'filter-chips-updated',
])

const filterStore = useFilterStore()
const projectStore = useProjectStore()
const localShowModal = ref(props.showModal)
const selectedProfiles = ref([])
const showDetailModal = ref(false)
const selectedEmployee = ref(null)
const showFilterDialog = ref(false)

// Get available employees with modal filters
const availableEmployees = computed(() => {
  try {
    const available = projectStore.getAvailableEmployees(
      props.currentProject.id
    )
    return filterStore.filteredModalMembers
  } catch (error) {
    console.error('Error computing available employees:', error)
    return []
  }
})

const handleFiltersApplied = () => {
  emit('filter-chips-updated', filterStore.activeModalFilters)
}

const confirmAddProfile = (employee) => {
  // Just emit the single employee being added
  emit('profiles-added', [employee])
  closeDetailModal()
}

const filterChips = computed(() => {
  try {
    return filterStore.activeModalFilters.map((filter) => ({
      label: filter.value,
      category: filter.category,
      value: filter.value,
    }))
  } catch (e) {
    console.error('Error computing filter chips:', e)
    return []
  }
})

const handleFilterRemoval = (chip) => {
  filterStore.removeModalFilter(chip.category, chip.value)
}

const closeFilterDialog = () => {
  showFilterDialog.value = false
}

// Add this new function to handle dialog updates to prevent it from not opening if you dont click close button
const handleDialogUpdate = (value) => {
  if (!value) {
    // If the dialog is being closed
    cleanupModal()
  }
}

// Create a cleanup function to handle all cleanup operations
const cleanupModal = () => {
  selectedProfiles.value = []
  filterStore.clearModalFilters()
  showFilterDialog.value = false // Make sure filter dialog is closed
  showDetailModal.value = false // Make sure detail modal is closed
  selectedEmployee.value = null
  emit('update:showModal', false)
}

// Modify your existing closeModal function to use cleanupModal
const closeModal = () => {
  cleanupModal()
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedEmployee.value = null
}

const showDetail = (employee) => {
  selectedEmployee.value = employee
  showDetailModal.value = true
}

watch(
  [() => props.showModal, () => localShowModal.value],
  ([newShowModal, newLocalShowModal], [oldShowModal, oldLocalShowModal]) => {
    // Only sync from props to local when props changes
    if (newShowModal !== oldShowModal) {
      localShowModal.value = newShowModal
    }

    // Only cleanup when actually closing (both values transitioning to false)
    if (
      oldShowModal &&
      oldLocalShowModal &&
      !newShowModal &&
      !newLocalShowModal
    ) {
      cleanupModal()
    }
  }
)
</script>

<style scoped>
.v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.action-buttons-card {
  padding: 4px 8px;
}

:deep(.v-btn--icon) {
  background: transparent;
}

:deep(.v-btn:hover) {
  opacity: 0.8;
}
</style>
