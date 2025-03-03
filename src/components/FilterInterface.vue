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
        <!-- Role Filter - Hide in modal context -->
        <div class="mb-4" v-if="!isModal">
          <h4>Role</h4>
          <v-select
            v-model="selectedRole"
            :items="['All', 'Lead', 'Non-Lead']"
            label="Select role type"
            variant="outlined"
            density="compact"
            @update:modelValue="handleRoleChange"
            clearable
          />
        </div>
      </v-col>
    </v-row>

    <!-- Job Title Filter -->
    <div class="mb-4">
      <h4>Job Title</h4>
      <v-text-field
        v-model="title"
        label="Search job title"
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
import { parseSalaryRange } from '@/utils/salary'
import axios from 'axios'

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
const availableSkills = ref([])
const salaryMin = ref('')
const salaryMax = ref('')
const salaryError = ref('')
const title = ref('')
const selectedRole = ref('All')
const selectedDepartments = ref([])
const selectedEmployment = ref([])
const availableDepartments = ref([])
const availableEmploymentTypes = ref([
  'Full Time',
  'Part Time',
  'Contract',
  'Intern',
])

// Local state for temporary filter values
const tempFilters = ref({
  skills: [],
  basic_salary: '',
  title: '',
  role: '',
  department: [],
  employment: [],
})

// Function to fetch departments from backend
const fetchDepartments = async () => {
  try {
    const response = await axios.get('http://localhost:8000/departments')
    availableDepartments.value = response.data
      .map((dept) => dept.department_name)
      .sort()
  } catch (error) {
    console.error('Error fetching departments:', error)
    availableDepartments.value = []
  }
}

// Function to fetch skills from backend
const fetchSkills = async () => {
  try {
    const response = await axios.get('http://localhost:8000/skills')
    availableSkills.value = response.data
      .map((skill) => skill.skill_name)
      .sort()
  } catch (error) {
    console.error('Error fetching skills:', error)
    availableSkills.value = []
  }
}

// Helper function to get current filters
const getCurrentFilters = () => {
  return props.isModal ? filterStore.modalFilters : filterStore.teamFilters
}

// Event handlers
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
      range = `${salaryMin.value}-${salaryMax.value}`
    } else if (salaryMin.value) {
      range = `${salaryMin.value}+`
    } else if (salaryMax.value) {
      range = `Up to ${salaryMax.value}`
    }

    tempFilters.value.basic_salary = range
  } catch (error) {
    console.error('Error handling salary change:', error)
  }
}

const handleRoleChange = () => {
  tempFilters.value.role =
    selectedRole.value === 'All' ? '' : selectedRole.value
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
      if (tempFilters.value.basic_salary) {
        filterStore.addModalFilter(
          'basic_salary',
          tempFilters.value.basic_salary
        )
      }
      if (tempFilters.value.title) {
        filterStore.addModalFilter('title', tempFilters.value.title)
      }
      // Skip adding role filter in modal mode
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
      if (tempFilters.value.basic_salary) {
        filterStore.addTeamFilter(
          'basic_salary',
          tempFilters.value.basic_salary
        )
      }
      if (tempFilters.value.title) {
        filterStore.addTeamFilter('title', tempFilters.value.title)
      }
      if (tempFilters.value.role) {
        filterStore.addTeamFilter('role', tempFilters.value.role)
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

  // Only reset role when not in modal mode
  if (!props.isModal) {
    selectedRole.value = 'All'
  }

  selectedDepartments.value = []
  selectedEmployment.value = []

  // Clear temporary filters
  tempFilters.value = {
    skills: [],
    basic_salary: '',
    title: '',
    role: props.isModal ? '' : 'All',
    department: [],
    employment: [],
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
  () => getCurrentFilters().basic_salary,
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
onMounted(async () => {
  try {
    // Fetch both skills and departments
    await Promise.all([fetchSkills(), fetchDepartments()])

    const currentFilters = getCurrentFilters()
    selectedSkills.value = currentFilters.skills || []
    title.value = currentFilters.title?.[0] || ''
    selectedDepartments.value = currentFilters.department || []
    selectedEmployment.value = currentFilters.employment || []

    // Only set role selection when not in modal mode
    if (!props.isModal) {
      selectedRole.value = currentFilters.role?.[0] || 'All'
    }

    if (currentFilters.basic_salary?.length) {
      const { min, max } = parseSalaryRange(currentFilters.basic_salary[0])
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
