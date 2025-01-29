<template>
  <v-card class="pa-4">
    <!-- Close button at the top-right corner -->
    <div class="d-flex justify-end">
      <v-btn icon @click="closeFilterDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Skills Filter -->
    <Combobox2
      title="Skills"
      :items="availableSkills"
      label="Select skills"
      filter-type="skills"
      :multiple="true"
      chips
      @update:model-value="handleSkillsChange"
    />

    <!-- Salary Range Filter -->
    <SalaryRange />

    <v-row>
      <v-col>
        <!-- Departmnt Filter -->
        <Combobox2
          title="Department"
          :items="availableDepartments"
          label="Select department"
          filter-type="department"
          :multiple="true"
          chips
          @update:model-value="handleDepartmentChange"
        />
      </v-col>
      <v-col>
        <!-- Employment Filter -->
        <Combobox2
          title="Employment Type"
          :items="availableEmploymentTypes"
          label="Select employment type"
          filter-type="employment"
          :multiple="true"
          chips
          @update:model-value="handleEmploymentChange"
        />
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
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { mockData } from '@/mockdata/mockData'
import Combobox2 from '@/components/items/Combobox.vue'

const filterStore = useFilterStore()
const emit = defineEmits(['close-filter-dialog'])

// Local state
const selectedSkills = ref([])
const title = ref('')
const selectedDepartments = ref([])
const selectedEmployment = ref([])

// Get unique skills from mockData
const availableSkills = [
  ...new Set(mockData.flatMap((item) => item.skills)),
].sort()

// Get unique departments from mockData
const availableDepartments = [
  ...new Set(mockData.map((item) => item.department)),
].sort()

// Get unique employment types from mockData
const availableEmploymentTypes = [
  ...new Set(mockData.map((item) => item.employment)),
].sort()

// Handle Skills Change
const handleSkillsChange = () => {
  filterStore.clearFilters('skills')
  if (selectedSkills.value.length > 0) {
    selectedSkills.value.forEach((skill) => {
      filterStore.addFilter('skills', skill)
    })
  }
}

// Handle Department Change
const handleDepartmentChange = () => {
  filterStore.clearFilters('department')
  if (selectedDepartments.value.length > 0) {
    selectedDepartments.value.forEach((dept) => {
      filterStore.addFilter('department', dept)
    })
  }
}

// Handle Title Change
const handleTitleChange = () => {
  filterStore.clearFilters('title')
  if (title.value.trim()) {
    filterStore.addFilter('title', title.value.trim())
  }
}

// Handle Employment Change
const handleEmploymentChange = () => {
  filterStore.clearFilters('employment')
  if (selectedEmployment.value.length > 0) {
    selectedEmployment.value.forEach((type) => {
      filterStore.addFilter('employment', type)
    })
  }
}

// Watch store changes to update local state
watch(
  () => ({
    skills: filterStore.filters.skills,
    title: filterStore.filters.title,
    department: filterStore.filters.department,
    employment: filterStore.filters.employment,
  }),
  (newFilters) => {
    selectedSkills.value = newFilters.skills
    title.value = newFilters.title[0] || ''
    selectedDepartments.value = newFilters.department
    selectedEmployment.value = newFilters.employment
  },
  { deep: true }
)

// Close filter dialog
const closeFilterDialog = () => {
  emit('close-filter-dialog')
}
</script>

<style scoped>
.v-card {
  box-shadow: none;
}
</style>
