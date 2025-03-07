<template>
  <v-dialog
    v-model="localShowModal"
    max-width="800px"
    @update:model-value="handleDialogUpdate"
  >
    <v-card>
      <!-- <v-card-title class="headline d-flex justify-space-between align-center">
        <span>Add Team Members to {{ currentProject.name }}</span>
        <v-btn icon @click="closeModal" variant="plain">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title> -->

      <v-card-text>
        <!-- Error Alert -->
        <v-alert v-if="error" type="error" closable class="mb-4">
          {{ error }}
        </v-alert>

        <!-- Loading State -->
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="mb-4"
        ></v-progress-circular>

        <div v-else>
          <div class="mt-4">
            <h3 class="text-h6 mb-3">
              Available Employees ({{ availableEmployees.length }})
            </h3>
            <v-row class="gap-4">
              <v-col
                v-for="employee in availableEmployees"
                :key="employee.talent_id"
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
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { useProjectManagementStore } from '@/stores/projectStore'
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
const projectStore = useProjectManagementStore()
const localShowModal = ref(props.showModal)
const selectedProfiles = ref([])
const showDetailModal = ref(false)
const selectedEmployee = ref(null)
const showFilterDialog = ref(false)
const loading = ref(false)
const error = ref(null)

// Get available employees with modal filters
const availableEmployees = computed(() => {
  try {
    // if (!props.currentProject?.project_id) return []

    // Use the store's getter for available employees
    const available = projectStore.getAvailableEmployees

    // Apply filters from filterStore
    return filterStore.filteredModalMembers
  } catch (e) {
    console.error('Error computing available employees:', e)
    error.value = 'Error loading available employees'
    return []
  }
})

const handleFiltersApplied = () => {
  emit('filter-chips-updated', filterStore.activeModalFilters)
}

const confirmAddProfile = async (employee) => {
  try {
    loading.value = true
    error.value = null

    // Add the team member using the store
    await projectStore.createProjectAssignment(
      props.currentProject.project_id,
      [employee.talent_id]
    )

    // Emit the event with the added employee
    emit('profiles-added', [employee])
    closeDetailModal()
  } catch (e) {
    error.value = e.message || 'Error adding team member'
    console.error('Error adding team member:', e)
  } finally {
    loading.value = false
  }
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

const handleDialogUpdate = (value) => {
  if (!value) {
    cleanupModal()
  }
}

const cleanupModal = () => {
  selectedProfiles.value = []
  filterStore.clearModalFilters()
  showFilterDialog.value = false
  showDetailModal.value = false
  selectedEmployee.value = null
  error.value = null
  emit('update:showModal', false)
}

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
    if (newShowModal !== oldShowModal) {
      localShowModal.value = newShowModal
    }

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

.v-progress-circular {
  display: block;
  margin: 0 auto;
}
</style>
