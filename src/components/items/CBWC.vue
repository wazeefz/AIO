<template>
  <div>
    <v-btn
      color="#B1A184"
      size="large"
      class="px-8"
      elevation="0"
      @click="handleContinue"
    >
      Continue
    </v-btn>

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
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showConfirmationDialog = ref(false)
const confirmationMessage = ref('')
const statusSummary = ref([])

const handleContinue = () => {
  const counts = getStatusCounts()

  // If all entries are valid, proceed directly
  if (counts.Incomplete === 0 && counts.Duplicated === 0) {
    proceedWithContinue()
    return
  }

  // Prepare status summary
  statusSummary.value = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({ status, count }))

  // Set confirmation message based on status
  let message = 'You have: \n'
  if (counts.Incomplete > 0 && counts.Duplicated > 0) {
    confirmationMessage.value =
      'There are both incomplete and duplicated entries in your data. Do you want to proceed anyway?'
  } else if (counts.Incomplete > 0) {
    confirmationMessage.value =
      'There are incomplete entries in your data. Do you want to proceed anyway?'
  } else if (counts.Duplicated > 0) {
    confirmationMessage.value =
      'There are duplicated entries in your data. Do you want to proceed anyway?'
  }

  showConfirmationDialog.value = true
}

const proceedWithContinue = () => {
  // Add your continue logic here
  console.log('Proceeding with continue action')
  showConfirmationDialog.value = false
  // You can add your navigation or form submission logic here
}

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

const getStatusIcon = (status) => {
  switch (status) {
    case 'Valid':
      return 'mdi-check-circle'
    case 'Incomplete':
      return 'mdi-alert-circle'
    case 'Duplicated':
      return 'mdi-content-copy'
    default:
      return 'mdi-information'
  }
}

const getStatusTextColor = (status) => {
  switch (status) {
    case 'Valid':
      return 'text-success'
    case 'Incomplete':
      return 'text-error'
    case 'Duplicated':
      return 'text-warning'
    default:
      return ''
  }
}
</script>
