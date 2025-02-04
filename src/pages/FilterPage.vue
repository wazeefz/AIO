<template>
  <div>
    <v-container>
      <!-- Page Title -->
      <v-row justify="center">
        <v-col cols="12" md="8">
          <h2 class="text-center">Team Filter Page</h2>
        </v-col>
      </v-row>

      <!-- Filter Card -->
      <v-row justify="center">
        <v-col cols="12" md="8">
          <FilterDialog
            :skills="skills"
            :departments="departments"
            :employmentTypes="employmentTypes"
            v-model:selectedSkills="selectedSkills"
            v-model:salaryRange="salaryRange"
            v-model:selectedDepartment="selectedDepartment"
            v-model:selectedEmployment="selectedEmployment"
            v-model:title="title"
            @applyFilter="applyFilter"
          />
        </v-col>
      </v-row>

      <!-- Results Section -->
      <v-row>
        <v-col cols="12">
          <h3 class="text-center">Filtered Results</h3>
          <p class="text-center">
            <strong>Skills:</strong> {{ selectedSkills.join(', ') || 'None'
            }}<br />
            <strong>Salary Range:</strong> {{ salaryRange.min || 'N/A' }} -
            {{ salaryRange.max || 'N/A' }}<br />
            <strong>Department:</strong> {{ selectedDepartment || 'N/A' }}<br />
            <strong>Employment:</strong> {{ selectedEmployment || 'N/A' }}<br />
            <strong>Title:</strong> {{ title || 'N/A' }}
          </p>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import FilterDialog from '@/components/FilterDialog.vue'

export default {
  components: {
    FilterDialog,
  },
  data() {
    return {
      // Filter dialog data
      skills: ['Javascript', 'HTML', 'CSS', 'Bootstrap', 'Adobe Photoshop'],
      departments: ['IT', 'HR', 'Sales', 'Marketing'],
      employmentTypes: ['Full-time', 'Part-time', 'Contract'],
      selectedSkills: [],
      salaryRange: { min: null, max: null },
      selectedDepartment: null,
      selectedEmployment: null,
      title: '',
    }
  },
  methods: {
    applyFilter() {
      console.log('Filter applied with the following data:')
      console.log({
        selectedSkills: this.selectedSkills,
        salaryRange: this.salaryRange,
        selectedDepartment: this.selectedDepartment,
        selectedEmployment: this.selectedEmployment,
        title: this.title,
      })
    },
  },
}
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
