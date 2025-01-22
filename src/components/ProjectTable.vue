<template>
  <v-card>
    <v-data-table
      height="500"
      density="default"
      :headers="headers"
      :items="projects"
      :search="search"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field
            class="bg-primaryBrown"
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
            <v-btn icon @click="toggleStar(item.id)" class="elevation-0">
              <v-icon :color="item.starred ? 'yellow-darken-2' : 'grey'">
                mdi-star
              </v-icon>
            </v-btn>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.cvCount }}</td>
          <td>RM {{ formatCurrency(item.budget) }}</td>
          <td>
            <v-chip
              :color="getStatusColor(item.status)"
              style="width: 120px; justify-content: center"
            >
              {{ item.status }}
            </v-chip>
          </td>
          <td>{{ formatDuration(item.duration) }}</td>
          <td class="d-flex align-center">
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              color="primaryBrown"
              class="mr-1 mr-xl-3"
              @click="editItem(item)"
            ></v-btn>
            <v-btn
              icon="mdi-close-circle"
              size="x-small"
              color="#DB848C"
              @click="deleteItem(item)"
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
              <!-- <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.cvCount"
                  label="CV Count"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.budget"
                  label="Budget"
                  type="number"
                ></v-text-field>
              </v-col> -->
              <v-col cols="12">
                <v-select
                  v-model="editedItem.status"
                  :items="['finished', 'unfinished', 'in progress']"
                  label="Status"
                ></v-select>
              </v-col>
              <!-- <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.duration.years"
                  label="Years"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.duration.months"
                  label="Months"
                  type="number"
                ></v-text-field>
              </v-col> -->
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { ref } from 'vue'
import { useProjects } from '../composables/useProjects'

export default {
  name: 'ProjectTable',
  setup() {
    const { projects, toggleStar, deleteProject, updateProject } = useProjects()
    const search = ref('')
    const dialog = ref(false)
    const editedItem = ref({
      name: '',
      cvCount: 0,
      budget: 0,
      status: '',
      duration: { years: 0, months: 0 },
    })

    const headers = [
      { title: 'Star', key: 'starred', sortable: false, align: 'start' },
      { title: 'Project Name', key: 'name', align: 'start' },
      { title: 'CV Count', key: 'cvCount', align: 'start' },
      { title: 'Budget', key: 'budget', align: 'start' },
      { title: 'Status', key: 'status', align: 'start' },
      { title: 'Duration', key: 'duration', align: 'start' },
      { title: 'Actions', key: 'actions', sortable: false, align: 'start' },
    ]

    const formatCurrency = (value) => {
      return value.toLocaleString('en-MY')
    }

    const getStatusColor = (status) => {
      const colors = {
        finished: 'success',
        unfinished: 'error',
        'in progress': 'warning',
      }
      return colors[status]
    }

    const formatDuration = (duration) => {
      const years = duration.years
        ? `${duration.years} year${duration.years > 1 ? 's' : ''}`
        : ''
      const months = duration.months
        ? `${duration.months} month${duration.months > 1 ? 's' : ''}`
        : ''
      return [years, months].filter(Boolean).join(' ')
    }

    const editItem = (item) => {
      editedItem.value = { ...item }
      dialog.value = true
    }

    const deleteItem = (item) => {
      if (confirm('Are you sure you want to delete this item?')) {
        deleteProject(item.id)
      }
    }

    const closeDialog = () => {
      dialog.value = false
    }

    const save = () => {
      updateProject(editedItem.value)
      closeDialog()
    }

    return {
      search,
      headers,
      projects,
      dialog,
      editedItem,
      toggleStar,
      formatCurrency,
      getStatusColor,
      formatDuration,
      editItem,
      deleteItem,
      closeDialog,
      save,
    }
  },
}
</script>
