<template>
  <v-card class="pa-4">
    <!-- Close button -->
    <div class="d-flex justify-end">
      <v-btn icon @click="closeFilterDialog" variant="plain">
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
      <v-btn color="primary" @click="applyFilters">Apply Filters</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="error" @click="clearFilters">Clear All Filters</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { mockData } from '@/mockdata/mockData'
import { parseSalaryRange } from '@/utils/salary'

const props = defineProps({
  isModal: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close-filter-dialog'])
const filterStore = useFilterStore()

// Local state
const selectedSkills = ref([])
const salaryMin = ref('')
const salaryMax = ref('')
const salaryError = ref('')
const title = ref('')
const selectedDepartments = ref([])
const selectedEmployment = ref([])
// Local state for temporary filter values
const tempFilters = ref({
  skills: [],
  salary: '',
  department: [],
  employment: [],
  title: '',
})

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
// Modified event handlers to update temporary state instead of store
const handleSkillsChange = () => {
  tempFilters.value.skills = selectedSkills.value || []
}

const handleDepartmentChange = () => {
  tempFilters.value.department = selectedDepartments.value || []
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

    let range = ''
    if (salaryMin.value && salaryMax.value) {
      range = `RM${salaryMin.value}-RM${salaryMax.value}`
    } else if (salaryMin.value) {
      range = `RM${salaryMin.value}+`
    } else if (salaryMax.value) {
      range = `Up to RM${salaryMax.value}`
    }

    tempFilters.value.salary = range
  } catch (error) {
    console.error('Error handling salary change:', error)
  }
}

const handleTitleChange = () => {
  tempFilters.value.title = title.value?.trim() || ''
}

const handleEmploymentChange = () => {
  tempFilters.value.employment = selectedEmployment.value || []
}

// New function to apply all filters
const applyFilters = () => {
  try {
    if (props.isModal) {
      filterStore.clearModalFilters('all')

      // Apply all filters at once
      if (tempFilters.value.skills.length) {
        tempFilters.value.skills.forEach((skill) =>
          filterStore.addModalFilter('skills', skill)
        )
      }
      if (tempFilters.value.department.length) {
        tempFilters.value.department.forEach((dept) =>
          filterStore.addModalFilter('department', dept)
        )
      }
      if (tempFilters.value.employment.length) {
        tempFilters.value.employment.forEach((type) =>
          filterStore.addModalFilter('employment', type)
        )
      }
      if (tempFilters.value.salary) {
        filterStore.addModalFilter('salary', tempFilters.value.salary)
      }
      if (tempFilters.value.title) {
        filterStore.addModalFilter('title', tempFilters.value.title)
      }
    } else {
      filterStore.clearTeamFilters('all')

      // Apply all filters at once
      if (tempFilters.value.skills.length) {
        tempFilters.value.skills.forEach((skill) =>
          filterStore.addTeamFilter('skills', skill)
        )
      }
      if (tempFilters.value.department.length) {
        tempFilters.value.department.forEach((dept) =>
          filterStore.addTeamFilter('department', dept)
        )
      }
      if (tempFilters.value.employment.length) {
        tempFilters.value.employment.forEach((type) =>
          filterStore.addTeamFilter('employment', type)
        )
      }
      if (tempFilters.value.salary) {
        filterStore.addTeamFilter('salary', tempFilters.value.salary)
      }
      if (tempFilters.value.title) {
        filterStore.addTeamFilter('title', tempFilters.value.title)
      }
    }
    emit('close-filter-dialog')
  } catch (error) {
    console.error('Error applying filters:', error)
  }
}

// Modified clear filters function
const clearFilters = () => {
  // Clear store filters based on context
  filterStore.clearFilters(props.isModal ? 'modal' : 'team')

  // Reset local state
  selectedSkills.value = []
  salaryMin.value = ''
  salaryMax.value = ''
  salaryError.value = ''
  title.value = ''
  selectedDepartments.value = []
  selectedEmployment.value = []

  // Clear temporary filters
  tempFilters.value = {
    skills: [],
    salary: '',
    department: [],
    employment: [],
    title: '',
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
  emit('close-filter-dialog')
}
</script>

<style scoped>
.v-card {
  box-shadow: none;
}
</style>
