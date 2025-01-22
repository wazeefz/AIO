<template>
  <v-container>
    <v-card class="pa-4">
      <v-form @submit.prevent="handleFilter">
        <h3 class="text-h6 mb-4">Skillsets</h3>
        <SkillsetFilter v-model:skills="filterData.skills" class="mb-6" />

        <h3 class="text-h6 mb-4">Salary</h3>
        <SalaryRange v-model:range="filterData.salaryRange" class="mb-6" />

        <v-row>
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-4">Department</h3>
            <DepartmentSelect
              v-model:department="filterData.department"
              class="mb-6"
            />
          </v-col>
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-4">Employment</h3>
            <EmploymentType
              v-model:type="filterData.employmentType"
              class="mb-6"
            />
          </v-col>
        </v-row>

        <h3 class="text-h6 mb-4">Title</h3>
        <JobTitleInput v-model:title="filterData.jobTitle" class="mb-6" />

        <v-btn block color="primary" type="submit" :loading="isLoading">
          Filter
        </v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import SkillsetFilter from '@/components/SkillsetFilter.vue'
import SalaryRange from '@/components/SalaryRange.vue'
import DepartmentSelect from '@/components/DepartmentSelect.vue'
import EmploymentType from '@/components/EmploymentType.vue'
import JobTitleInput from '@/components/JobTitleInput.vue'
import { useJobFilter } from '@/plugins/useJobFilter'

const { filterJobs, isLoading } = useJobFilter()

const filterData = ref({
  skills: [],
  salaryRange: {
    min: 6000,
    max: 20000,
  },
  department: '',
  employmentType: 'Full time',
  jobTitle: '',
})

const handleFilter = async () => {
  await filterJobs(filterData.value)
}
</script>
