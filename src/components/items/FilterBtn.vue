<template>
  <v-btn :icon="iconOnly" @click="handleClick">
    <v-icon :color="iconColor">mdi-tune-vertical</v-icon>
  </v-btn>

  <v-dialog v-model="showFilterDialog" max-width="800px" persistent>
    <v-card class="pa-4">
      <!-- Close button -->
      <div class="d-flex justify-end">
        <v-btn icon @click="closeFilterDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Skills Filter -->
      <div class="mb-4">
        <h4>Skills</h4>
        <v-combobox
          v-model="selectedSkills"
          :items="availableSkills"
          label="Select skills"
          variant="outlined"
          density="compact"
          multiple
          chips
          clearable
          @update:modelValue="handleSkillsChange"
        />
      </div>

      <!-- Salary Range Filter -->
      <div class="mb-4">
        <h4>Salary Range</h4>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="salaryMin"
              label="Min (RM)"
              type="number"
              variant="outlined"
              density="compact"
              :error-messages="salaryError"
              @input="handleSalaryChange"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="salaryMax"
              label="Max (RM)"
              type="number"
              variant="outlined"
              density="compact"
              :error-messages="salaryError"
              @input="handleSalaryChange"
            />
          </v-col>
        </v-row>
      </div>

      <v-row>
        <v-col>
          <!-- Department Filter -->
          <div class="mb-4">
            <h4>Department</h4>
            <v-combobox
              v-model="selectedDepartments"
              :items="availableDepartments"
              label="Select department"
              variant="outlined"
              density="compact"
              multiple
              chips
              clearable
              @update:modelValue="handleDepartmentChange"
            />
          </div>
        </v-col>
        <v-col>
          <!-- Employment Filter -->
          <div class="mb-4">
            <h4>Employment Type</h4>
            <v-combobox
              v-model="selectedEmployment"
              :items="availableEmploymentTypes"
              label="Select employment type"
              variant="outlined"
              density="compact"
              multiple
              chips
              clearable
              @update:modelValue="handleEmploymentChange"
            />
          </div>
        </v-col>
      </v-row>

      <!-- Title Filter -->
      <div class="mb-4">
        <h4>Role</h4>
        <v-text-field
          v-model="title"
          label="Search role"
          variant="outlined"
          density="compact"
          @update:modelValue="handleTitleChange"
          clearable
        />
      </div>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn color="error" @click="clearAllFilters">
          Clear All Filters
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Filter Dialog -->
  <slot name="employee">
    <v-dialog v-model="showFilterDialog" max-width="600">
      <v-card>
        <!-- Add this new header section with close button -->
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span class="text-h6">Filter Options</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="showFilterDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <!-- Age Range -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="filters.ageMin"
                label="Min Age"
                type="number"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="filters.ageMax"
                label="Max Age"
                type="number"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <!-- Experience Range -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="filters.expMin"
                label="Min Experience"
                type="number"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="filters.expMax"
                label="Max Experience"
                type="number"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <!-- Salary Range -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="filters.salaryMin"
                label="Min Salary"
                prefix="MYR"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="filters.salaryMax"
                label="Max Salary"
                prefix="MYR"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </v-col>

            <!-- Gender -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="filters.gender"
                :items="['All', 'Male', 'Female']"
                label="Gender"
                variant="outlined"
                density="comfortable"
              ></v-select>
            </v-col>

            <!-- Location -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="filters.location"
                :items="locations"
                label="Location"
                variant="outlined"
                density="comfortable"
                :filter="customLocationFilter"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-map-marker</v-icon>
                </template>
              </v-select>
            </v-col>

            <!-- Skills -->
            <v-col cols="12">
              <v-combobox
                v-model="filters.skills"
                :items="availableSkills"
                label="Skills"
                multiple
                chips
                variant="outlined"
                density="comfortable"
                :filter="customSkillFilter"
              >
                <template v-slot:prepend-inner>
                  <v-icon>mdi-code-tags</v-icon>
                </template>
              </v-combobox>
            </v-col>
            <v-col cols="12" sm="12">
              <v-select
                v-model="filters.status"
                :items="['All', 'Valid', 'Incomplete', 'Duplicated']"
                label="Status"
                variant="outlined"
                density="comfortable"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="resetFilters">Reset</v-btn>
          <v-btn color="#B1A184" @click="applyFilters">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </slot>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { mockData } from '@/mockdata/mockData'
import { parseSalaryRange } from '@/utils/salary'

const props = defineProps({
  iconColor: {
    type: String,
    default: '#292D32',
  },
  iconOnly: {
    type: Boolean,
    default: true,
  },
  isModal: {
    type: Boolean,
    default: false,
  },
})

const handleClick = () => {
  emit('click')
}

const emit = defineEmits(['close-filter-dialog', 'click'])
const filterStore = useFilterStore()

// Local state
const selectedSkills = ref([])
const salaryMin = ref('')
const salaryMax = ref('')
const salaryError = ref('')
const title = ref('')
const selectedDepartments = ref([])
const selectedEmployment = ref([])

// Static data
const availableSkills = [
  ...new Set(mockData.flatMap((item) => item.skills)),
].sort()
const availableDepartments = [
  ...new Set(mockData.map((item) => item.department)),
].sort()
const availableEmploymentTypes = [
  ...new Set(mockData.map((item) => item.employment)),
].sort()

// Helper function to get current filters
const getCurrentFilters = () => {
  return props.isModal ? filterStore.modalFilters : filterStore.teamFilters
}

// Event handlers
const handleSkillsChange = () => {
  try {
    if (props.isModal) {
      filterStore.clearModalFilters('skills')
      selectedSkills.value?.forEach((skill) =>
        filterStore.addModalFilter('skills', skill)
      )
    } else {
      filterStore.clearTeamFilters('skills')
      selectedSkills.value?.forEach((skill) =>
        filterStore.addTeamFilter('skills', skill)
      )
    }
  } catch (error) {
    console.error('Error handling skills change:', error)
  }
}

const handleDepartmentChange = () => {
  try {
    if (props.isModal) {
      filterStore.clearModalFilters('department')
      selectedDepartments.value?.forEach((dept) =>
        filterStore.addModalFilter('department', dept)
      )
    } else {
      filterStore.clearTeamFilters('department')
      selectedDepartments.value?.forEach((dept) =>
        filterStore.addTeamFilter('department', dept)
      )
    }
  } catch (error) {
    console.error('Error handling department change:', error)
  }
}

const clearAllFilters = () => {
  filterStore.clearTeamFilters()
}

const handleSalaryChange = () => {
  try {
    salaryError.value = ''

    if (
      salaryMin.value &&
      salaryMax.value &&
      parseInt(salaryMin.value) > parseInt(salaryMax.value)
    ) {
      salaryError.value = 'Min salary cannot be greater than max salary'
      return
    }

    if (props.isModal) {
      filterStore.clearModalFilters('salary')
    } else {
      filterStore.clearTeamFilters('salary')
    }

    if (!salaryMin.value && !salaryMax.value) return

    let range = ''
    if (salaryMin.value && salaryMax.value) {
      range = `RM${salaryMin.value}-RM${salaryMax.value}`
    } else if (salaryMin.value) {
      range = `RM${salaryMin.value}+`
    } else if (salaryMax.value) {
      range = `Up to RM${salaryMax.value}`
    }

    if (props.isModal) {
      filterStore.addModalFilter('salary', range)
    } else {
      filterStore.addTeamFilter('salary', range)
    }
  } catch (error) {
    console.error('Error handling salary change:', error)
  }
}

const handleTitleChange = () => {
  try {
    if (props.isModal) {
      filterStore.clearModalFilters('title')
      if (title.value?.trim()) {
        filterStore.addModalFilter('title', title.value.trim())
      }
    } else {
      filterStore.clearTeamFilters('title')
      if (title.value?.trim()) {
        filterStore.addTeamFilter('title', title.value.trim())
      }
    }
  } catch (error) {
    console.error('Error handling title change:', error)
  }
}

const handleEmploymentChange = () => {
  try {
    if (props.isModal) {
      filterStore.clearModalFilters('employment')
      selectedEmployment.value?.forEach((type) =>
        filterStore.addModalFilter('employment', type)
      )
    } else {
      filterStore.clearTeamFilters('employment')
      selectedEmployment.value?.forEach((type) =>
        filterStore.addTeamFilter('employment', type)
      )
    }
  } catch (error) {
    console.error('Error handling employment change:', error)
  }
}

// Watch for changes in store filters
watch(
  () => ({
    skills: getCurrentFilters().skills,
    title: getCurrentFilters().title,
    department: getCurrentFilters().department,
    employment: getCurrentFilters().employment,
  }),
  (newFilters) => {
    try {
      selectedSkills.value = newFilters.skills || []
      title.value = newFilters.title?.[0] || ''
      selectedDepartments.value = newFilters.department || []
      selectedEmployment.value = newFilters.employment || []
    } catch (error) {
      console.error('Error updating filter values:', error)
    }
  },
  { deep: true }
)

watch(
  () => getCurrentFilters().salary,
  (newSalary) => {
    try {
      if (!newSalary?.length) {
        salaryMin.value = ''
        salaryMax.value = ''
        return
      }

      const { min, max } = parseSalaryRange(newSalary[0])
      salaryMin.value = min !== 0 ? min.toString() : ''
      salaryMax.value = max !== Infinity ? max.toString() : ''
    } catch (error) {
      console.error('Error updating salary values:', error)
    }
  },
  { deep: true }
)

// Initialize filters
onMounted(() => {
  try {
    const currentFilters = getCurrentFilters()
    selectedSkills.value = currentFilters.skills || []
    title.value = currentFilters.title?.[0] || ''
    selectedDepartments.value = currentFilters.department || []
    selectedEmployment.value = currentFilters.employment || []

    if (currentFilters.salary?.length) {
      const { min, max } = parseSalaryRange(currentFilters.salary[0])
      salaryMin.value = min !== 0 ? min.toString() : ''
      salaryMax.value = max !== Infinity ? max.toString() : ''
    }
  } catch (error) {
    console.error('Error initializing filters:', error)
  }
})

const closeFilterDialog = () => {
  showFilterDialog.value = false
}
</script>

<style scoped>
.v-card {
  box-shadow: none;
}
</style>
