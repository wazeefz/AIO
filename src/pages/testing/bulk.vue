<!-- <template>
  <EmployeeTable />
</template>

<script setup>
import EmployeeTable from '@/components/items/EmployeeTable.vue'
</script> -->

<template>
  <v-container>
    <h2 class="text-h4 mb-8" style="color: #b1a184">
      Bulk Upload CV - Details
    </h2>

    <!-- Header Section -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h3 class="text-h5"></h3>
      <div class="d-flex align-center gap-2">
        <v-text-field
          v-model="search"
          placeholder="Search"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          class="search-field"
          hide-details
          bg-color="white"
          style="width: 600px"
        />

        <FilterButtonWithDialog />
      </div>
    </div>

    <!-- Table -->
    <EmployeeTableComponent />

    <!-- Continue Button -->
    <div class="d-flex justify-end mt-6">
      <ContinueButtonWithConfirmation />
    </div>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>Are you sure you want to delete this entry?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import FilterButtonWithDialog from '@/components/items/FBWD.vue'
import EmployeeTableComponent from '@/components/items/ET.vue'
import ContinueButtonWithConfirmation from '@/components/items/CBWC.vue'

const search = ref('')
const showDeleteDialog = ref(false)
const itemToDelete = ref(null)

const confirmDelete = () => {
  const index = cvData.value.findIndex(
    (item) => item.id === itemToDelete.value.id
  )
  if (index !== -1) {
    cvData.value.splice(index, 1)
  }
  showDeleteDialog.value = false
  itemToDelete.value = null
}
</script>
