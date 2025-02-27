<template>
  <v-card>
    <v-data-table
      height="500"
      density="default"
      :headers="headers"
      :items="sortedProjects"
      :search="search"
      :loading="store.isLoading"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-toolbar>
      </template>

      <template v-slot:item="{ item }">
        <tr>
          <td>
            <v-btn icon @click="handleStarToggle(item)" class="elevation-0">
              <v-icon :color="item.starred ? 'yellow-darken-2' : 'grey'">
                mdi-star
              </v-icon>
            </v-btn>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.cvCount }}</td>
          <td>{{ formatCurrency(item.budget) }}</td>
          <td>
            <v-chip
              :color="getStatusColor(item.status)"
              style="width: 120px; justify-content: center"
            >
              {{ item.status }}
            </v-chip>
          </td>
          <td class="d-flex align-center">
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              color="primary"
              class="mr-2"
              @click="editItem(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="x-small"
              color="error"
              @click="confirmDelete(item)"
            ></v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span>Edit Project</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.name"
                  label="Project Name"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.status"
                  :items="statusOptions"
                  item-title="text"
                  item-value="value"
                  label="Status"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model.number="editedItem.budget"
                  label="Budget"
                  type="number"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
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
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this project?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="deleteItemConfirmed"
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
  </v-card>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
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

    const formatCurrency = store.formatCurrency

    const sortedProjects = computed(() => store.sortedProjects) // Access the sorted projects
    const projects = computed(() => store.projects) // ✅ Fix: Ensure `projects` is accessible

    const headers = [
      { title: 'Starred', key: 'starred', sortable: false, width: '80px' },
      { title: 'Project Name', key: 'name', align: 'start' },
      { title: 'CV Count', key: 'cvCount' },
      { title: 'Budget', key: 'budget' },
      { title: 'Status', key: 'status' },
      { title: 'Actions', key: 'actions', sortable: false, width: '100px' },
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
    }
  },
})
</script>

<style scoped>
.v-data-table {
  background: transparent !important;
}
</style>
