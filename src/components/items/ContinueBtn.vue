<!-- Continue Button -->
<template>
  <div class="d-flex justify-end mt-6">
    <v-btn
      color="#B1A184"
      size="large"
      class="px-8"
      elevation="0"
      @click="handleContinue"
    >
      Continue
    </v-btn>
  </div>

  <!-- Add this new Confirmation Dialog -->
  <v-dialog v-model="showConfirmationDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">Confirmation Required</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="showConfirmationDialog = false"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <p>{{ confirmationMessage }}</p>
        <v-list
          v-if="statusSummary.length"
          class="bg-grey-lighten-4 mt-3 rounded"
        >
          <v-list-item
            v-for="(status, index) in statusSummary"
            :key="index"
            :prepend-icon="getStatusIcon(status.status)"
            :class="getStatusTextColor(status.status)"
          >
            {{ status.count }} {{ status.status }} entries
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="grey-darken-1"
          @click="showConfirmationDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn color="#B1A184" @click="proceedWithContinue">
          Proceed Anyway
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const showConfirmationDialog = ref(false)
const confirmationMessage = ref('')
const statusSummary = ref([])

const getStatusCounts = () => {
  const counts = {
    Incomplete: 0,
    Duplicated: 0,
    Valid: 0,
  }

  cvData.value.forEach((item) => {
    const status = getEntryStatus(item)
    counts[status]++
  })

  return counts
}

// State
const search = ref('')
const itemsPerPage = ref(10)
const showFilterDialog = ref(false)
const showDeleteDialog = ref(false)
const itemToDelete = ref(null)
</script>
