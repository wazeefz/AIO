<template>
  <v-card>
    <v-data-table
      v-if="isDataReady"
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
            label="Search Name"
            single-line
            hide-details
            class="search-field"
          ></v-text-field>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            class="ml-2"
            @click="addNewItem"
          >
            Add Talent
          </v-btn>
        </v-toolbar>
      </template>

      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.first_name }} {{ item.last_name }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.phone }}</td>
          <td>{{ item.job_title }}</td>
          <td>
            <v-chip :color="getEmploymentTypeColor(item.employment_type)">
              {{ formatEmploymentType(item.employment_type) }}
            </v-chip>
          </td>
          <td>
            <v-chip :color="getDepartmentColor(item.department_id)">
              {{ getDepartmentName(item.department_id) }}
            </v-chip>
          </td>
          <td>{{ formatCurrency(item.basic_salary) }}</td>
          <td>
            <v-chip :color="getGenderColor(item.gender)">
              {{ item.gender }}
            </v-chip>
          </td>
          <td>{{ calculateAge(item.date_of_birth) }}</td>
          <td>{{ item.total_experience_years }} years</td>
          <td>
            <v-chip :color="getAvailabilityColor(item.availability_status)">
              {{ item.availability_status }}
            </v-chip>
          </td>
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

    <v-skeleton-loader v-else type="table" height="500"></v-skeleton-loader>

    <!-- Edit/Add Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span>{{ editedItem.talent_id ? 'Edit' : 'Add' }} Talent</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.first_name"
                  label="First Name"
                  :rules="[(v) => !!v || 'First name is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.last_name"
                  label="Last Name"
                  :rules="[(v) => !!v || 'Last name is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  type="email"
                  :rules="[
                    (v) => !!v || 'Email is required',
                    (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.phone"
                  label="Phone"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.job_title"
                  label="Job Title"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editedItem.employment_type"
                  :items="employmentTypes"
                  label="Employment Type"
                  :rules="[(v) => !!v || 'Employment type is required']"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editedItem.department_id"
                  :items="departments"
                  item-title="title"
                  item-value="value"
                  label="Department"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.basic_salary"
                  label="Basic Salary"
                  type="number"
                  prefix="$"
                  :rules="[(v) => !!v || 'Salary is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editedItem.gender"
                  :items="genderTypes"
                  label="Gender"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedItem.date_of_birth"
                  label="Date of Birth"
                  type="date"
                  :rules="[(v) => !!v || 'Date of birth is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editedItem.total_experience_years"
                  label="Total Experience (Years)"
                  type="number"
                  :rules="[(v) => !!v || 'Experience is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editedItem.availability_status"
                  :items="availabilityStatuses"
                  label="Availability Status"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.career_preferences"
                  label="Career Preferences"
                ></v-textarea>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="editedItem.remarks"
                  label="Remarks"
                ></v-textarea>
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
            @click="save"
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
        <v-card-title>Delete Talent</v-card-title>
        <v-card-text>
          Are you sure you want to delete this talent? This action cannot be
          undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            text
            @click="confirmDelete"
            :loading="isDeleting"
            :disabled="isDeleting"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" text @click="showError = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTalentStore } from '@/stores/talent'
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

const talentStore = useTalentStore()

// Refs
const search = ref('')
const dialog = ref(false)
const deleteDialog = ref(false)
const editedItem = ref({})
const deletingItem = ref(null)
const countChart = ref(null)
const filterChanged = ref(0)
const isDataReady = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// Constants
const employmentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY']
const genderTypes = ['MALE', 'FEMALE', 'OTHER']
const availabilityStatuses = ['Available', 'Unavailable', 'On Leave']
const departments = [
  { value: 1, title: 'IT' },
  { value: 2, title: 'Design' },
  { value: 3, title: 'Management' },
  { value: 4, title: 'Marketing' },
  { value: 5, title: 'Data' },
  { value: 6, title: 'HR' },
]

// Default talent structure
const defaultTalent = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  job_title: '',
  employment_type: 'FULL_TIME',
  department_id: 1,
  basic_salary: 0,
  gender: 'MALE',
  date_of_birth: null,
  marital_status: false,
  total_experience_years: 0,
  career_preferences: '',
  availability_status: 'Available',
  remarks: '',
}

// Computed
const countId = computed(() => 'talent-stats')

const headers = computed(() => [
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Email', key: 'email', align: 'start' },
  { title: 'Phone', key: 'phone', align: 'start' },
  { title: 'Job Title', key: 'job_title', align: 'start' },
  { title: 'Employment Type', key: 'employment_type', align: 'start' },
  { title: 'Department', key: 'department_id', align: 'start' },
  { title: 'Salary', key: 'basic_salary', align: 'start' },
  { title: 'Gender', key: 'gender', align: 'start' },
  { title: 'Age', key: 'age', align: 'start' },
  { title: 'Experience', key: 'total_experience_years', align: 'start' },
  { title: 'Status', key: 'availability_status', align: 'start' },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'center',
    width: '100px',
  },
])

const tableData = computed(() => {
  if (!props.dimension || !isDataReady.value) return []

  filterChanged.value // Dependency for recomputation
  try {
    let data = props.dimension.top(Infinity)

    if (search.value) {
      data = data.filter((item) => {
        const fullName = `${item.first_name} ${item.last_name}`.toLowerCase()
        return fullName.includes(search.value.toLowerCase())
      })
    }

    return data
  } catch (error) {
    console.error('Error getting table data:', error)
    showError.value = true
    errorMessage.value = 'Error loading table data'
    return []
  }
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

const formatEmploymentType = (type) => {
  if (!type) return ''
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

const getEmploymentTypeColor = (type) => {
  if (!type) return 'default'
  const colors = {
    FULL_TIME: 'primary',
    PART_TIME: 'secondary',
    CONTRACT: 'warning',
    TEMPORARY: 'info',
  }
  return colors[type] || 'default'
}

const getDepartmentName = (id) => {
  if (!id) return 'Unknown'
  const dept = departments.find((d) => d.value === id)
  return dept ? dept.title : 'Unknown'
}

const getDepartmentColor = (id) => {
  if (!id) return 'default'
  const colors = {
    1: '#1976D2', // IT
    2: '#E91E63', // Design
    3: '#FFA000', // Management
    4: '#388E3C', // Marketing
    5: '#5E35B1', // Data
    6: '#00ACC1', // HR
  }
  return colors[id] || 'default'
}

const getGenderColor = (gender) => {
  if (!gender) return 'default'
  const colors = {
    MALE: '#2196F3',
    FEMALE: '#E91E63',
    OTHER: '#9C27B0',
  }
  return colors[gender] || 'default'
}

const getAvailabilityColor = (status) => {
  if (!status) return 'default'
  const colors = {
    Available: 'success',
    Unavailable: 'error',
    'On Leave': 'warning',
  }
  return colors[status] || 'default'
}

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age
}

// CRUD Operations
const addNewItem = () => {
  editedItem.value = {
    ...defaultTalent,
    date_of_birth: new Date().toISOString().split('T')[0],
  }
  dialog.value = true
}

const editItem = (item) => {
  editedItem.value = { ...defaultTalent, ...item }
  dialog.value = true
}

const deleteItem = (item) => {
  deletingItem.value = item
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!deletingItem.value) return

  isDeleting.value = true
  try {
    await talentStore.deleteTalent(deletingItem.value.talent_id)
    filterChanged.value++
    deleteDialog.value = false
  } catch (error) {
    console.error('Error deleting talent:', error)
    showError.value = true
    errorMessage.value = 'Error deleting talent'
  } finally {
    isDeleting.value = false
    deletingItem.value = null
  }
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = { ...defaultTalent }
}

const save = async () => {
  try {
    isSaving.value = true

    // Validate required fields
    const requiredFields = [
      'first_name',
      'last_name',
      'email',
      'employment_type',
      'basic_salary',
      'date_of_birth',
      'total_experience_years',
    ]

    const missingFields = requiredFields.filter(
      (field) => !editedItem.value[field]
    )

    if (missingFields.length > 0) {
      throw new Error(
        `Please fill in all required fields: ${missingFields.join(', ')}`
      )
    }

    if (editedItem.value.talent_id) {
      await talentStore.updateTalent(editedItem.value)
    } else {
      await talentStore.addTalent(editedItem.value)
    }

    filterChanged.value++
    closeDialog()
  } catch (error) {
    console.error('Error saving talent:', error)
    showError.value = true
    errorMessage.value = error.message || 'Error saving talent'
  } finally {
    isSaving.value = false
  }
}

// Watch for dimension changes
watch(
  () => props.dimension,
  (newDimension) => {
    if (newDimension) {
      isDataReady.value = true
    } else {
      isDataReady.value = false
    }
  },
  { immediate: true }
)

// Lifecycle Hooks
onMounted(async () => {
  if (props.ndx && props.dimension) {
    try {
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

      isDataReady.value = true
    } catch (error) {
      console.error('Error initializing table:', error)
      showError.value = true
      errorMessage.value = 'Error initializing table'
    }
  }
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

/* Dark theme support */
:deep(.v-theme--dark) {
  .v-card-title {
    border-bottom-color: rgba(255, 255, 255, 0.12);
  }

  .data-count {
    color: rgba(255, 255, 255, 0.7);
  }
}

/* Dialog transitions */
.v-dialog-transition-enter-active,
.v-dialog-transition-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.v-dialog-transition-enter-from,
.v-dialog-transition-leave-to {
  opacity: 0;
}

/* Error handling */
.error-text {
  color: rgb(var(--v-theme-error));
  font-size: 0.875rem;
  margin-top: 4px;
}

.v-btn.loading {
  pointer-events: none;
}

/* Table row hover effect */
:deep(.v-data-table-row:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

/* Dialog responsive width */
.v-dialog {
  margin: 24px;
}

@media (max-width: 600px) {
  .v-dialog {
    margin: 16px;
  }
}
</style>
