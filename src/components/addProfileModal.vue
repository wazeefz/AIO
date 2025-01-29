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
          <v-card
            class="action-buttons-card d-inline-flex align-center"
            rounded="pill"
            color="#EAE3D6"
            elevation="0"
          >
            <v-btn icon @click="showFilterDialog = true">
              <v-icon color="#292D32">mdi-tune-vertical</v-icon>
            </v-btn>
          </v-card>
        </div>

        <!-- Filter Dialog -->
        <v-dialog v-model="showFilterDialog" max-width="800px" persistent>
          <v-card>
            <FilterInterface
              @filter-applied="handleFiltersApplied"
              @close-filter-dialog="closeFilterDialog"
            />
          </v-card>
        </v-dialog>

        <div class="mt-4">
          <h3 class="text-h6 mb-3">Available Employees</h3>
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

// Get available employees (unchanged)
const availableEmployees = computed(() => {
  const available = projectStore.getAvailableEmployees(props.currentProject.id)

  if (Object.values(filterStore.filters).some((filter) => filter.length > 0)) {
    return available.filter((employee) => {
      return Object.entries(filterStore.filters).every(
        ([category, selectedFilters]) => {
          if (!selectedFilters.length) return true

          switch (category) {
            case 'skills':
              return selectedFilters.every((skill) =>
                employee.skills.includes(skill)
              )
            case 'salary':
              return selectedFilters.some((range) =>
                isSalaryInRange(employee.salary, range)
              )
            case 'title':
              return selectedFilters.some((searchTerm) =>
                employee.title.toLowerCase().includes(searchTerm.toLowerCase())
              )
            case 'department':
              return selectedFilters.includes(employee.department)
            case 'employment':
              return selectedFilters.includes(employee.employment)
            default:
              return true
          }
        }
      )
    })
  }

  return available
})

const closeModal = () => {
  localShowModal.value = false
  selectedProfiles.value = []
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
  emit('filter-chips-updated', filterStore.activeFilters)
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
    }
  }
)

watch(
  () => localShowModal.value,
  (newVal) => {
    if (!newVal) {
      selectedProfiles.value = []
    }
  }
)

const isSalaryInRange = (salary, range) => {
  const salaryValue = parseInt(salary.replace(/[^\d]/g, ''))

  if (range.includes('-')) {
    const [minStr, maxStr] = range.split('-')
    const min = parseInt(minStr.replace(/[^\d]/g, ''))
    const max = parseInt(maxStr.replace(/[^\d]/g, ''))
    return salaryValue >= min && salaryValue <= max
  } else if (range.includes('+')) {
    const min = parseInt(range.replace(/[^\d]/g, ''))
    return salaryValue >= min
  } else if (range.startsWith('Up to')) {
    const max = parseInt(range.replace(/[^\d]/g, ''))
    return salaryValue <= max
  }
  return false
}
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
