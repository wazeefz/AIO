<template>
  <v-card elevation="2">
    <!-- Added Heading -->
    <v-card-title class="projects-page-title">Projects</v-card-title>

    <v-toolbar flat>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
        density="compact"
        class="mr-4 search-input"
      ></v-text-field>
      <v-btn
        prepend-icon="mdi-filter-variant"
        color="#B1A184"
        @click="showFilterDialog = true"
        class="filter-btn"
        variant="outlined"
      >
        Filter
      </v-btn>
    </v-toolbar>

    <v-data-table
      height="500"
      density="compact"
      :headers="headers"
      :items="filteredProjects"
      :search="search"
      :loading="store.isLoading"
      class="custom-table"
      hover
    >
      <template v-slot:item="{ item }">
        <tr>
          <td>
            <v-btn
              icon
              @click="handleStarToggle(item)"
              class="elevation-0"
              variant="text"
            >
              <v-icon :color="item.starred ? 'yellow-darken-2' : 'grey'">
                mdi-star
              </v-icon>
            </v-btn>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.teamSize }}</td>
          <!-- Changed from cvCount to teamSize -->
          <td>{{ formatCurrency(item.budget) }}</td>
          <td>
            <v-chip
              :color="getStatusColor(item.status)"
              style="width: 120px; justify-content: center"
              size="small"
            >
              {{ item.status }}
            </v-chip>
          </td>
          <td class="action-cell">
            <div class="d-flex align-center justify-center">
              <v-btn
                icon="mdi-pencil"
                size="x-small"
                color="#B1A184"
                class="mr-2"
                @click="editItem(item)"
                variant="text"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="x-small"
                color="error"
                @click="confirmDelete(item)"
                variant="text"
              ></v-btn>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="table-dialog-title">
          <span>Edit Project</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Project Name"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.status"
                  :items="statusOptions"
                  item-title="text"
                  item-value="value"
                  label="Status"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.budgetFormatted"
                  label="Budget (MYR)"
                  variant="outlined"
                  density="compact"
                  prefix="MYR "
                  @input="formatBudgetInput"
                  @blur="parseBudgetInput"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="#B1A184"
            text
            @click="saveItem"
            :loading="isSaving"
            :disabled="isSaving"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="table-dialog-title">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this project?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" text @click="deleteDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="#B1A184" text @click="deleteItemConfirmed"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showError = false">Close</v-btn>
      </template>
    </v-snackbar>

    <!-- Filter Dialog -->
    <v-dialog v-model="showFilterDialog" max-width="600">
      <v-card>
        <!-- Add this new header section with close button -->
        <v-card-title
          class="d-flex justify-space-between align-center pa-4 table-dialog-title"
        >
          <span>Filter Options</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="showFilterDialog = false"
          ></v-btn>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <!-- Status -->
              <v-col cols="12">
                <v-select
                  v-model="filters.status"
                  :items="[
                    'All',
                    'Not Started',
                    'In Progress',
                    'Completed',
                    'On Hold',
                    'Delayed',
                  ]"
                  label="Status"
                  variant="outlined"
                  density="compact"
                ></v-select>
              </v-col>
              <!-- Budget Range -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="filters.budgetMin"
                  label="Min Budget"
                  type="number"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="filters.budgetMax"
                  label="Max Budget"
                  type="number"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="resetFilters">Reset</v-btn>
          <v-btn color="#B1A184" @click="applyFilters">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useProjects } from '../composables/useProjects'

export default defineComponent({
  setup() {
    const store = useProjects() // Correctly using Pinia store
    const search = ref('')
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const editedItem = ref({})
    const itemToDelete = ref(null)
    const isSaving = ref(false)
    const showError = ref(false)
    const errorMessage = ref('')
    const showFilterDialog = ref(false)
    const formatCurrency = store.formatCurrency

    const sortedProjects = computed(() => store.sortedProjects) // Access the sorted projects
    const projects = computed(() => store.projects) // ✅ Fix: Ensure `projects` is accessible

    const headers = [
      { title: 'Starred', key: 'starred', sortable: false, width: '80px' },
      { title: 'Project Name', key: 'name', align: 'start' },
      { title: 'Team Size', key: 'teamSize' }, // Changed header title
      { title: 'Budget', key: 'budget' },
      { title: 'Status', key: 'status' },
      { title: 'Actions', key: 'actions', sortable: false, width: '120px' },
    ]

    const getStatusColor = (status) => {
      const colors = {
        'Not Started': 'grey',
        'In Progress': 'warning',
        Completed: 'success',
        'On Hold': 'info',
        Delayed: 'error',
      }
      return colors[status] || 'grey'
    }

    const editItem = (item) => {
      editedItem.value = { ...item }
      // Format the budget for display in the text field
      editedItem.value.budgetFormatted = formatNumber(item.budget)
      dialog.value = true
    }

    const confirmDelete = (item) => {
      itemToDelete.value = item
      deleteDialog.value = true
    }

    const deleteItemConfirmed = async () => {
      try {
        if (itemToDelete.value) {
          await store.deleteProject(itemToDelete.value.id)
          deleteDialog.value = false
          itemToDelete.value = null
        }
      } catch (error) {
        handleError(error)
      }
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = {}
    }

    const handleError = (error) => {
      errorMessage.value = error.message
      showError.value = true
      console.error('Error:', error)
    }

    const saveItem = async () => {
      try {
        isSaving.value = true
        // Parse the formatted budget back to a number before saving
        editedItem.value.budget = parseNumber(editedItem.value.budgetFormatted)
        await store.updateProject(editedItem.value)
        dialog.value = false
        await store.fetchProjects()
      } catch (error) {
        handleError(error)
      } finally {
        isSaving.value = false
      }
    }

    const handleStarToggle = async (item) => {
      try {
        await store.toggleProjectStar(item)
      } catch (error) {
        handleError(error)
      }
    }

    const statusOptions = ref([
      { text: 'Not Started', value: 'Not Started' },
      { text: 'In Progress', value: 'In Progress' },
      { text: 'Completed', value: 'Completed' },
      { text: 'On Hold', value: 'On Hold' },
      { text: 'Delayed', value: 'Delayed' },
    ])

    onMounted(() => {
      store.fetchProjects()
    })

    // Filter state
    const filters = ref({
      status: 'All',
      budgetMin: null,
      budgetMax: null,
    })

    const applyFilters = () => {
      showFilterDialog.value = false
    }

    const resetFilters = () => {
      filters.value = {
        status: 'All',
        budgetMin: null,
        budgetMax: null,
      }
    }

    const filteredProjects = computed(() => {
      let filtered = [...sortedProjects.value]

      if (filters.value.status !== 'All') {
        filtered = filtered.filter(
          (item) => item.status === filters.value.status
        )
      }

      if (filters.value.budgetMin !== null && filters.value.budgetMin !== '') {
        filtered = filtered.filter(
          (item) => item.budget >= parseFloat(filters.value.budgetMin)
        )
      }

      if (filters.value.budgetMax !== null && filters.value.budgetMax !== '') {
        filtered = filtered.filter(
          (item) => item.budget <= parseFloat(filters.value.budgetMax)
        )
      }

      return filtered
    })

    // Helper functions for formatting and parsing numbers
    const formatNumber = (number) => {
      if (number === null || number === undefined) {
        return '0.00'
      }
      return new Intl.NumberFormat('en-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number)
    }

    const parseNumber = (formattedNumber) => {
      if (!formattedNumber) {
        return null
      }
      try {
        // Remove spaces and "MYR" or "RM"
        const numberString = formattedNumber
          .replace(/[^\d.,-]/g, '')
          .replace(/,/g, '')
        const parsedNumber = parseFloat(numberString)
        return isNaN(parsedNumber) ? null : parsedNumber
      } catch (error) {
        console.error('Error parsing number:', error)
        return null
      }
    }

    const formatBudgetInput = (value) => {
      // Allow only numbers, commas, and periods
      const cleanedValue = value.replace(/[^\d.,]/g, '')
      editedItem.value.budgetFormatted = cleanedValue
    }

    const parseBudgetInput = () => {
      if (editedItem.value.budgetFormatted) {
        editedItem.value.budgetFormatted = formatNumber(
          parseNumber(editedItem.value.budgetFormatted)
        )
      }
    }

    return {
      store,
      projects,
      sortedProjects,
      search,
      dialog,
      deleteDialog,
      editedItem,
      headers,
      getStatusColor,
      editItem,
      confirmDelete,
      deleteItemConfirmed,
      closeDialog,
      saveItem,
      isSaving,
      handleStarToggle,
      showError,
      errorMessage,
      formatCurrency,
      statusOptions, // ✅ FIXED: Ensure statusOptions is available in the template
      showFilterDialog,
      filters,
      applyFilters,
      resetFilters,
      filteredProjects,
      formatBudgetInput,
      parseBudgetInput,
    }
  },
})
</script>

<style scoped>
.v-data-table {
  background: transparent !important;
}

:deep(.v-data-table-header) {
  background-color: #b1a184 !important;
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: white !important;
  text-transform: none !important;
  padding: 12px 16px !important;
}

:deep(.v-data-table__tr:hover) {
  background-color: #f9fafb !important;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.search-input {
  width: 300px; /* Adjust as needed */
}

.filter-btn {
  height: 48px !important;
}

/* Add this style */
.action-cell {
  height: 100%; /* Make the cell take up full height */
}

/* Consistent Heading Style for Dialogs */
.table-dialog-title {
  color: #b1a184;
  font-size: 1.5rem; /* Roughly equivalent to text-h6 */
  font-weight: 500; /* Roughly equivalent to font-weight-medium */
  padding: 16px; /* Adjust as needed */
}

/* Heading Style for Page Title */
.projects-page-title {
  color: #b1a184;
  font-size: 2.25rem; /* Roughly equivalent to text-h4 */
  font-weight: 500; /* Roughly equivalent to font-weight-medium */
  padding: 24px; /* Adjust as needed */
}
</style>
