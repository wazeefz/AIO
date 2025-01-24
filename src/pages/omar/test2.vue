<template>
  <div>
    <v-row>
      <!-- Results -->
      <v-col cols="12" md="8">
        <h2>Active Filters</h2>
        <!-- Chips component -->
        <base-chips
          :chips="filterChips"
          :closable="true"
          :use-color-mapping="true"
          @remove-chip="handleFilterRemoval"
        />

        <!-- Results Display -->
        <div class="mt-6">
          <!-- Action Buttons Card -->
          <div class="d-flex justify-end mb-4">
            <v-card
              class="action-buttons-card d-inline-flex align-center"
              rounded="pill"
              color="#EAE3D6"
              elevation="0"
            >
              <!-- Edit Button -->
              <v-btn
                :color="isEditing ? 'error' : '#B1A184'"
                class="custom-edit-btn"
                icon
                @click="toggleEdit"
              >
                <v-icon color="#292D32">
                  {{ isEditing ? 'mdi-close' : 'mdi-pencil' }}
                </v-icon>
              </v-btn>

              <!-- Divider -->
              <v-divider vertical class="mx-2" color="#292D32"></v-divider>

              <!-- Filter Button -->
              <v-btn icon @click="toggleFilter">
                <v-icon color="#292D32">mdi-tune-vertical</v-icon>
              </v-btn>
            </v-card>
          </div>

          <h2>
            Filtered Results ({{ filterStore.filteredResults.length }} matches)
          </h2>
          <!-- ProfileCard Component -->
          <ProfileCard
            v-for="result in filterStore.filteredResults"
            :key="result.id"
            :result="result"
            :is-editing="isEditing"
            @modal-opened="handleModalOpen"
            @modal-closed="handleModalClose"
          />
        </div>

        <!-- Filter Dialog -->
        <v-dialog v-model="showFilterDialog" max-width="800px">
          <v-card>
            <v-card-title class="headline">
              Filter Options
              <v-spacer></v-spacer>
              <v-btn icon @click="closeFilterDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-form @submit.prevent="handleFilter">
                  <!-- Your existing filter form content -->
                  <h3 class="text-h6 mb-4">Skillsets</h3>
                  <SkillsetFilter
                    v-model:skills="filterData.skills"
                    class="mb-6"
                  />

                  <h3 class="text-h6 mb-4">Salary</h3>
                  <SalaryRange
                    v-model:range="filterData.salaryRange"
                    class="mb-6"
                  />

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
                  <JobTitleInput
                    v-model:title="filterData.jobTitle"
                    class="mb-6"
                  />

                  <v-btn
                    block
                    color="primary"
                    type="submit"
                    :loading="isLoading"
                  >
                    Filter
                  </v-btn>
                </v-form>
              </v-container>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import BaseChips from '@/components/Chips.vue'
import FilterInterface from '@/components/FilterInterface.vue'
import { useFilterStore } from '@/stores/filterStore'
import ProfileCard from '@/components/profileCard.vue'
import SkillsetFilter from '@/components/SkillsetFilter.vue'
import SalaryRange from '@/components/SalaryRange.vue'
import DepartmentSelect from '@/components/DepartmentSelect.vue'
import EmploymentType from '@/components/EmploymentType.vue'
import JobTitleInput from '@/components/JobTitleInput.vue'
import { useJobFilter } from '@/plugins/useJobFilter'

const filterStore = useFilterStore()
const isEditing = ref(false)
const showFilterDialog = ref(false)
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

const filterChips = computed(() =>
  filterStore.activeFilters.map((filter) => ({
    label: filter.value,
    category: filter.category,
    value: filter.value,
  }))
)

const handleFilterRemoval = (chip) => {
  filterStore.removeFilter(chip.category, chip.value)
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
}

const toggleFilter = () => {
  showFilterDialog.value = true
}

const closeFilterDialog = () => {
  showFilterDialog.value = false
}

const handleFilter = async () => {
  await filterJobs(filterData.value)
  closeFilterDialog()
}

const handleModalOpen = () => {
  // Your modal open logic
}

const handleModalClose = () => {
  // Your modal close logic
}
</script>

<style scoped>
.action-buttons-card {
  padding: 4px 8px;
}

.custom-edit-btn {
  height: 40px;
  width: 40px;
}

:deep(.v-btn) {
  box-shadow: none !important;
}

:deep(.v-btn:hover) {
  opacity: 0.8;
}

:deep(.v-divider) {
  border-color: #292d32 !important;
  opacity: 0.5;
}

:deep(.v-btn--icon) {
  background: transparent;
}

:deep(.v-btn--icon.custom-edit-btn .v-btn__content) {
  border-radius: 50%;
  background-color: currentColor;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.v-btn--icon .v-icon) {
  z-index: 1;
}
</style>
