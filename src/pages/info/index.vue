<template>
  <div>
    <v-card>
      <v-card-text>
        <!-- Error State -->
        <v-alert v-if="error" type="error" closable class="mb-4">
          {{ error }}
        </v-alert>

        <!-- Loading State -->
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
        ></v-progress-circular>

        <div v-else>
          <v-row>
            <!-- Results -->
            <v-col cols="12" md="11">
              <!-- Results Display -->
              <div class="ma-6">
                <!-- Team Members Section -->
                <div class="team-members-section">
                  <div class="ma-4">
                    <!-- ProfileCard Component -->
                    <div class="scrollable-cards-container">
                      <div class="ma-9">
                        <v-row>
                          <v-col
                            v-for="employee in Employees"
                            :key="employee.talent_id"
                            cols="12"
                            sm="6"
                            class="pa-5"
                          >
                            <ProfileCard
                              :result="employee"
                              :is-editing="isEditing"
                              @click="handleModalOpen"
                              @modal-closed="handleModalClose"
                            />
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import BaseChips from '@/components/Chips.vue'
import FilterInterface from '@/components/FilterInterface.vue'
import { useFilterStore } from '@/stores/filterStore'
import { useProjectManagementStore } from '@/stores/projectStore'
import { useTalentStore } from '@/stores/talent' // Import Talent Store
import ProfileCard from '@/components/profileCard.vue'
import ProfileModal from '@/components/ProfileModal.vue'
import ActionBtn from '@/components/ActionBtn.vue'

const talentStore = useTalentStore() // Use Talent Store

// Local state
const isEditing = ref(false)
const loading = ref(true)
const error = ref(null)

//Computed properties
const Employees = computed(() => talentStore.getTalents) // Use Talent Store
console.log('Data from page talents', Employees)

// Fetch data on component mount
onMounted(async () => {
  try {
    loading.value = true
    error.value = null

    // Initialize projects to load available employees
    await talentStore.fetchTalents() // Initialize Talent Store
  } catch (e) {
    error.value = e.message || 'Error loading employees'
    console.error('Initialization error:', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.team-members-section {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 350px);
  min-height: 400px;
  margin-top: 16px;
  position: relative;
  padding-bottom: 24px;
}

.scrollable-cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  position: absolute;
  top: 40px;
  left: 0;
  right: 8px;
  bottom: 24px;
  margin-bottom: 2px;
}

.scrollable-cards-container .v-row {
  margin: -8px;
  min-height: min-content;
  height: auto;
  padding-bottom: 2px;
}

.scrollable-cards-container .v-col {
  padding: 10px;
}

/* Custom scrollbar styling */
.scrollable-cards-container::-webkit-scrollbar {
  width: 8px;
  margin-right: 8px;
}

.scrollable-cards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
  margin-bottom: 7px;
}

.scrollable-cards-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
  margin-bottom: 4px;
}

.scrollable-cards-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
