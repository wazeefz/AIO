<template>
  <v-card>
    <v-data-table
      height="500"
      density="default"
      :headers="headers"
      :items="tableData"
      :search="undefined"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search Project Name"
            single-line
            hide-details
            class="search-field"
          ></v-text-field>
        </v-toolbar>
      </template>

      <template v-slot:item="{ item }">
        <tr>
          <td>
            <v-btn
              icon
              @click="toggleStar(item.project_id)"
              class="elevation-0"
            >
              <v-icon :color="item.starred ? 'yellow-darken-2' : 'grey'">
                mdi-star
              </v-icon>
            </v-btn>
          </td>
          <td>{{ item.name }}</td>
          <td>{{ item.cv_count }}</td>
          <td>
            <v-progress-linear
              :model-value="item.progress"
              height="20"
              :color="getProgressColor(item.progress)"
            >
              <template v-slot:default="{ value }">
                <strong>{{ value }}%</strong>
              </template>
            </v-progress-linear>
          </td>
          <td>$ {{ formatCurrency(item.budget) }}</td>
          <td>
            <v-chip
              :color="getStatusColor(item.status)"
              style="width: 120px; justify-content: center"
            >
              {{ formatStatus(item.status) }}
            </v-chip>
          </td>
          <td>{{ formatDate(item.due_date) }}</td>
          <td>{{ item.team_size }}</td>
          <td class="d-flex align-center">
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              color="primary"
              class="mr-1"
              @click="editItem(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="x-small"
              color="error"
              @click="deleteItem(item)"
            ></v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>

    <!-- Project Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
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
                  :rules="[(v) => !!v || 'Project name is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.cv_count"
                  label="CV Count"
                  type="number"
                  min="0"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.progress"
                  label="Progress"
                  type="number"
                  min="0"
                  max="100"
                  suffix="%"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.budget"
                  label="Budget"
                  type="number"
                  prefix="$"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editedItem.status"
                  :items="projectStatuses"
                  label="Status"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.due_date"
                  label="Due Date"
                  type="date"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.team_size"
                  label="Team Size"
                  type="number"
                  min="1"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.project_description"
                  label="Project Description"
                  :rules="[(v) => !!v || 'Description is required']"
                ></v-textarea>
              </v-col>
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

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as dc from 'dc'

const props = defineProps({
  ndx: {
    type: Object,
    required: true,
  },
  dimension: {
    type: Object,
    required: true,
  },
})

// Refs
const search = ref('')
const dialog = ref(false)
const editedItem = ref({})
const countChart = ref(null)
const filterChanged = ref(0)

// Constants
const projectStatuses = ['IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']

// Default project structure
const defaultProject = {
  name: '',
  starred: false,
  cv_count: 0,
  progress: 0,
  status: 'IN_PROGRESS',
  budget: 0,
  team_size: 1,
  project_description: '',
  due_date: new Date().toISOString().split('T')[0],
}

// Computed
const countId = computed(() => 'project-stats')

const headers = computed(() => [
  {
    title: 'Star',
    key: 'starred',
    sortable: false,
    align: 'start',
    width: '50px',
  },
  { title: 'Project Name', key: 'name', align: 'start' },
  { title: 'CV Count', key: 'cv_count', align: 'start', width: '100px' },
  { title: 'Progress', key: 'progress', align: 'start', width: '150px' },
  { title: 'Budget', key: 'budget', align: 'start' },
  { title: 'Status', key: 'status', align: 'start', width: '120px' },
  { title: 'Due Date', key: 'due_date', align: 'start' },
  { title: 'Team Size', key: 'team_size', align: 'start', width: '100px' },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center',
    width: '100px',
  },
])

const tableData = computed(() => {
  filterChanged.value // Dependency for recomputation
  let data = props.dimension.top(Infinity)

  if (search.value) {
    data = data.filter((item) =>
      item.name.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  return data
})

// Helper Functions
const formatCurrency = (value) => {
  if (!value) return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatStatus = (status) => {
  if (!status) return ''
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

const getStatusColor = (status) => {
  if (!status) return 'default'
  const colors = {
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    ON_HOLD: 'error',
    CANCELLED: 'grey',
  }
  return colors[status] || 'default'
}

const getProgressColor = (progress) => {
  if (!progress) return 'error'
  if (progress >= 75) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

// CRUD Operations
const toggleStar = (projectId) => {
  console.log('Toggle star for project:', projectId)
  // Implement star toggle functionality
}

const editItem = (item) => {
  editedItem.value = { ...defaultProject, ...item }
  dialog.value = true
}

const deleteItem = (item) => {
  if (confirm('Are you sure you want to delete this project?')) {
    console.log('Delete project:', item)
    // Implement delete functionality
  }
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultProject }
}

const save = () => {
  // Validate required fields
  const requiredFields = ['name', 'status', 'project_description']
  const missingFields = requiredFields.filter(
    (field) => !editedItem.value[field]
  )

  if (missingFields.length > 0) {
    alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
    return
  }

  console.log('Save project:', editedItem.value)
  closeDialog()
}

// Lifecycle Hooks
onMounted(() => {
  const all = props.ndx.groupAll()
  countChart.value = dc.dataCount(`#${countId.value}`)
  countChart.value
    .crossfilter(props.ndx)
    .groupAll(all)
    .on('renderlet', () => {
      filterChanged.value++
    })

  countChart.value.render()

  // Listen for global filter changes
  props.ndx.onChange(() => {
    filterChanged.value++
  })
})

// Watch for search changes
watch(search, () => {
  filterChanged.value++
})
</script>

<style scoped>
.v-data-table {
  width: 100%;
}

.search-field {
  max-width: 300px;
  margin-right: 16px;
}

.data-count {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.v-chip {
  font-size: 0.875rem;
}

.v-dialog .v-card-title {
  font-size: 1.25rem;
  font-weight: 500;
  padding: 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.v-dialog .v-card-text {
  padding-top: 20px;
}

.v-dialog .v-card-actions {
  padding: 16px;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Progress bar styling */
:deep(.v-progress-linear) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.v-progress-linear__content) {
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .search-field {
    max-width: 100%;
    margin-right: 0;
  }

  .data-count {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 16px;
  }

  .v-data-table {
    font-size: 0.875rem;
  }

  .v-chip {
    font-size: 0.75rem;
  }
}

/* Table cell spacing */
:deep(.v-data-table-header th) {
  font-weight: 600;
  white-space: nowrap;
}

:deep(.v-data-table td) {
  padding: 8px 16px;
}

/* Form styling */
.v-text-field {
  margin-bottom: 8px;
}

.v-select {
  margin-bottom: 8px;
}

.v-textarea {
  margin-bottom: 16px;
}
</style>
