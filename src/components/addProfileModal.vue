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
        <FilterInterface @filter-applied="handleFiltersApplied" />

        <div class="mt-4">
          <h3 class="text-h6 mb-3">Available Employees</h3>
          <v-row>
            <v-col
              v-for="employee in availableEmployees"
              :key="employee.id"
              cols="12"
              sm="6"
            >
              <v-card @click="showDetail(employee)" class="cursor-pointer">
                <v-card-text>
                  <v-card-title>{{ employee.name }}</v-card-title>
                  <v-card-subtitle>{{ employee.title }}</v-card-subtitle>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Detailed Profile Card -->
        <v-dialog v-model="showDetailModal" max-width="600px">
          <v-card>
            <v-card-title
              class="headline d-flex justify-space-between align-center"
            >
              <span>{{ selectedEmployee.name }}</span>
              <v-btn icon @click="closeDetailModal">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <p><strong>Title:</strong> {{ selectedEmployee.title }}</p>
              <p>
                <strong>Department:</strong> {{ selectedEmployee.department }}
              </p>
              <p><strong>Salary:</strong> {{ selectedEmployee.salary }}</p>
              <p>
                <strong>Employment Type:</strong>
                {{ selectedEmployee.employment }}
              </p>
              <p><strong>Skills:</strong></p>
              <v-chip
                v-for="skill in selectedEmployee.skills"
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

.cursor-pointer {
  cursor: pointer;
}
</style>
