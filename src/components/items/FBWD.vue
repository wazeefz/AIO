<template>
  <div>
    <v-btn
      prepend-icon="mdi-filter-variant"
      variant="outlined"
      color="#B1A184"
      @click="showFilterDialog = true"
      height="48px"
      class="filter-btn"
    >
      Filter
    </v-btn>

    <v-dialog v-model="showFilterDialog" max-width="600">
      <v-card>
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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showFilterDialog = ref(false)
const filters = ref({
  ageMin: '',
  ageMax: '',
  expMin: '',
  expMax: '',
  salaryMin: '',
  salaryMax: '',
  gender: 'All',
  location: 'All',
  skills: [],
  status: 'All',
})

const applyFilters = () => {
  showFilterDialog.value = false
}

const resetFilters = () => {
  filters.value = {
    ageMin: '',
    ageMax: '',
    expMin: '',
    expMax: '',
    salaryMin: '',
    salaryMax: '',
    gender: 'All',
    location: 'All',
    skills: [],
    status: 'All',
  }
}
</script>
