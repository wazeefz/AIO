<!-- components/FilterInterface.vue -->
<template>
  <v-card class="pa-4">
    <h3>Filters</h3>

    <!-- Skills Filter -->
    <div class="mb-4">
      <h4>Skills</h4>
      <v-chip-group
        v-model="selectedSkills"
        column
        multiple
        @update:modelValue="handleSkillsChange"
      >
        <v-chip
          v-for="skill in availableSkills"
          :key="skill"
          filter
          variant="outlined"
        >
          {{ skill }}
        </v-chip>
      </v-chip-group>
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
            @update:modelValue="handleSalaryChange"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="salaryMax"
            label="Max (RM)"
            type="number"
            variant="outlined"
            density="compact"
            @update:modelValue="handleSalaryChange"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Title Filter (replaced Role Filter) -->
    <div class="mb-4">
      <h4>Search Title</h4>
      <v-text-field
        v-model="title"
        label="Search job titles"
        variant="outlined"
        density="compact"
        @update:modelValue="handleTitleChange"
        clearable
      />
    </div>

    <!-- Department Filter -->
    <div class="mb-4">
      <h4>Department</h4>
      <v-checkbox
        v-for="dept in availableDepartments"
        :key="dept"
        v-model="selectedDepartments"
        :label="dept"
        :value="dept"
        density="compact"
        @update:modelValue="handleDepartmentChange"
      />
    </div>

    <!-- Clear Filters Button -->
    <v-btn
      color="error"
      variant="outlined"
      @click="clearAllFilters"
      class="mt-4"
    >
      Clear All Filters
    </v-btn>
  </v-card>
</template>

<script>
import { ref, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { mockData } from '@/mockdata/mockData'

export default {
  name: 'FilterInterface',
  setup() {
    const filterStore = useFilterStore()

    // Local state
    const selectedSkills = ref([])
    const salaryMin = ref('')
    const salaryMax = ref('')
    const title = ref('')
    const selectedDepartments = ref([])

    // Get unique skills from mockData
    const availableSkills = [
      ...new Set(mockData.flatMap((item) => item.skills)),
    ].sort()

    // Handle Skills Change
    const handleSkillsChange = (skills) => {
      filterStore.clearFilters('skills')
      skills.forEach((skill) => {
        filterStore.addFilter('skills', availableSkills[skill])
      })
    }

    // Get unique departments from mockData
    const availableDepartments = [
      ...new Set(mockData.map((item) => item.department)),
    ].sort()

    // Handle Department Change
    const handleDepartmentChange = () => {
      filterStore.clearFilters('department')
      if (selectedDepartments.value.length > 0) {
        selectedDepartments.value.forEach((dept) => {
          filterStore.addFilter('department', dept)
        })
      }
    }

    // Handle Salary Change
    const handleSalaryChange = () => {
      if (salaryMin.value && salaryMax.value) {
        filterStore.clearFilters('salary')
        const range = `RM${salaryMin.value}-RM${salaryMax.value}`
        filterStore.addFilter('salary', range)
      }
    }

    // Handle Title Change
    const handleTitleChange = () => {
      filterStore.clearFilters('title')
      if (title.value.trim()) {
        filterStore.addFilter('title', title.value.trim())
      }
    }

    // Clear all filters
    const clearAllFilters = () => {
      filterStore.clearFilters()
      selectedSkills.value = []
      salaryMin.value = ''
      salaryMax.value = ''
      title.value = ''
      selectedDepartments.value = []
    }

    // Watch store changes to update local state
    watch(
      () => filterStore.filters,
      (newFilters) => {
        // Update skills selection
        selectedSkills.value = newFilters.skills.map((skill) =>
          availableSkills.indexOf(skill)
        )

        // Update salary range
        if (newFilters.salary.length > 0) {
          const range = newFilters.salary[0]
          const [min, max] = range
            .split('-')
            .map((v) => parseInt(v.replace(/[^\d]/g, '')))
          salaryMin.value = min
          salaryMax.value = max
        }

        // Update title
        title.value = newFilters.title[0] || ''

        // Update departments
        selectedDepartments.value = newFilters.department
      },
      { deep: true }
    )

    return {
      availableSkills,
      selectedSkills,
      salaryMin,
      salaryMax,
      title,
      availableDepartments,
      selectedDepartments,
      handleSkillsChange,
      handleSalaryChange,
      handleTitleChange,
      handleDepartmentChange,
      clearAllFilters,
    }
  },
}
</script>
