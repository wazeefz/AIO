<template>
  <v-card class="pa-4">
    <div class="d-flex justify-end">
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Skills Filter -->
    <div class="mb-4">
      <h4>Skills</h4>
      <v-combobox
        v-model="filters.skills"
        :items="availableSkills"
        label="Select skills"
        variant="outlined"
        density="compact"
        multiple
        chips
        clearable
        @update:modelValue="emitFilters"
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

    <v-row>
      <v-col>
        <!-- Department Filter -->
        <div class="mb-4">
          <h4>Department</h4>
          <v-combobox
            v-model="filters.department"
            :items="availableDepartments"
            label="Select department"
            variant="outlined"
            density="compact"
            multiple
            chips
            clearable
            @update:modelValue="emitFilters"
          />
        </div>
      </v-col>
      <v-col>
        <!-- Employment Filter -->
        <div class="mb-4">
          <h4>Employment Type</h4>
          <v-combobox
            v-model="filters.employment"
            :items="availableEmploymentTypes"
            label="Select employment type"
            variant="outlined"
            density="compact"
            multiple
            chips
            clearable
            @update:modelValue="emitFilters"
          />
        </div>
      </v-col>
    </v-row>

    <!-- Title Filter -->
    <div class="mb-4">
      <h4>Role</h4>
      <v-text-field
        v-model="filters.title"
        label="Search role"
        variant="outlined"
        density="compact"
        @update:modelValue="emitFilters"
        clearable
      />
    </div>
  </v-card>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { mockData } from '@/mockdata/mockData'

const emit = defineEmits(['update:filters', 'close'])

// Local state
const filters = reactive({
  skills: [],
  title: '',
  department: [],
  employment: [],
  salary: [],
})

const salaryMin = ref('')
const salaryMax = ref('')

// Get unique values from mockData
const availableSkills = [
  ...new Set(mockData.flatMap((item) => item.skills)),
].sort()
const availableDepartments = [
  ...new Set(mockData.map((item) => item.department)),
].sort()
const availableEmploymentTypes = [
  ...new Set(mockData.map((item) => item.employment)),
].sort()

// Validate salary input
const validateSalary = () => {
  const min = Number(salaryMin.value)
  const max = Number(salaryMax.value)

  if (min && max && max < min) return false
  if (min < 0 || max < 0) return false
  if ((min && isNaN(min)) || (max && isNaN(max))) return false

  return true
}

// Handle salary change
const handleSalaryChange = () => {
  if (!salaryMin.value && !salaryMax.value) {
    filters.salary = []
  } else if (validateSalary()) {
    let range = ''
    if (salaryMin.value && salaryMax.value) {
      range = `RM${salaryMin.value}-RM${salaryMax.value}`
    } else if (salaryMin.value) {
      range = `RM${salaryMin.value}+`
    } else if (salaryMax.value) {
      range = `Up to RM${salaryMax.value}`
    }

    filters.salary = range ? [range] : []
  }
  emitFilters()
}

// Emit filter changes
const emitFilters = () => {
  emit('update:filters', filters)
}
</script>

<style scoped>
.v-card {
  box-shadow: none;
}
</style>
