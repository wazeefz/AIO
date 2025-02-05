<template>
  <v-dialog v-model="localShowModal" max-width="800px">
    <v-card>
      <v-card-title class="headline d-flex justify-space-between align-center">
        <span>Add Team Members to {{ currentProject.projectName }}</span>
        <v-btn icon @click="closeModal">
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
                @click="showDetail(employee)"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Detailed Profile Card Modal -->
        <v-dialog v-model="showDetailModal" max-width="600px" persistent>
          <v-card>
            <v-card-title
              class="headline d-flex justify-space-between align-center"
            >
              <span>{{ selectedEmployee?.name }}</span>
              <v-btn icon @click="closeDetailModal">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <p><strong>Title:</strong> {{ selectedEmployee?.title }}</p>
              <p>
                <strong>Department:</strong> {{ selectedEmployee?.department }}
              </p>
              <p><strong>Salary:</strong> {{ selectedEmployee?.salary }}</p>
              <p>
                <strong>Employment Type:</strong>
                {{ selectedEmployee?.employment }}
              </p>
              <p><strong>Skills:</strong></p>
              <v-chip
                v-for="skill in selectedEmployee?.skills"
                :key="skill"
                class="mr-2 mb-2"
              >
                {{ skill }}
              </v-chip>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="closeDetailModal">Cancel</v-btn>
              <v-btn color="primary" @click="confirmAddProfile">Confirm</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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

const closeModal = () => {
  localShowModal.value = false
  selectedProfiles.value = []
  filterStore.clearModalFilters() // Clear modal filters when closing
  emit('update:showModal', false)
}

const showDetail = (employee) => {
  selectedEmployee.value = employee
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedEmployee.value = null
}

const confirmAddProfile = () => {
  selectedProfiles.value.push(selectedEmployee.value)
  emit('profiles-added', selectedProfiles.value)
  closeDetailModal()
}

const handleFiltersApplied = () => {
  emit('filter-chips-updated', filterStore.activeModalFilters)
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

watch(
  () => props.showModal,
  (newVal) => {
    localShowModal.value = newVal
    if (!newVal) {
      selectedProfiles.value = []
      filterStore.clearModalFilters() // Clear filters when modal is closed
    }
  }
)

watch(
  () => localShowModal.value,
  (newVal) => {
    if (!newVal) {
      selectedProfiles.value = []
      filterStore.clearModalFilters() // Clear filters when modal is closed
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
