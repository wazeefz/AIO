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
          <div class="data-count" :id="countId">
            <v-icon color="primary" class="mr-2">{{
              tableType === 'projects'
                ? 'mdi-file-document-multiple'
                : 'mdi-account-group'
            }}</v-icon>
            <span class="filter-count"></span> selected out of
            <span class="total-count"></span>
            {{ tableType }}
          </div>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            :label="
              tableType === 'projects' ? 'Search Project Name' : 'Search Name'
            "
            single-line
            hide-details
            class="search-field"
          ></v-text-field>
        </v-toolbar>
      </template>

      <!-- Projects Table -->
      <template v-if="tableType === 'projects'" v-slot:item="{ item }">
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
          <td>$ {{ formatCurrency(item.budget) }}</td>
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

      <!-- People Table -->
      <template v-else v-slot:item="{ item }">
        <tr>
          <td>{{ item.first }} {{ item.last }}</td>
          <td>
            <v-chip :color="getGenderColor(item.gender)">
              {{ item.gender }}
            </v-chip>
          </td>
          <td>{{ calculateAge(item.dob) }}</td>
          <td>
            <v-chip color="surface-variant">{{ item.department }}</v-chip>
          </td>
          <td>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="skill in item.skill"
                :key="skill"
                size="small"
                color="primary"
                variant="outlined"
              >
                {{ skill }}
              </v-chip>
            </div>
          </td>
          <td>$ {{ formatCurrency(item.wage) }}</td>
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

    <!-- Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span
            >Edit {{ tableType === 'projects' ? 'Project' : 'Person' }}</span
          >
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <!-- Project Edit Form -->
              <template v-if="tableType === 'projects'">
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.name"
                    label="Project Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
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
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="editedItem.status"
                    :items="['finished', 'unfinished', 'in progress']"
                    label="Status"
                  ></v-select>
                </v-col>
                <v-col cols="6">
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
                </v-col>
              </template>

              <!-- People Edit Form -->
              <template v-else>
                <v-col cols="6">
                  <v-text-field
                    v-model="editedItem.first"
                    label="First Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="editedItem.last"
                    label="Last Name"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="editedItem.gender"
                    :items="['Male', 'Female']"
                    label="Gender"
                  ></v-select>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="editedItem.dob"
                    label="Date of Birth"
                    type="date"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editedItem.department"
                    label="Department"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="editedItem.skill"
                    :items="[]"
                    label="Skills"
                    multiple
                    chips
                  ></v-combobox>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model.number="editedItem.wage"
                    label="Wage"
                    type="number"
                    prefix="$"
                  ></v-text-field>
                </v-col>
              </template>
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
  tableType: {
    type: String,
    required: true,
    validator: (value) => ['projects', 'people'].includes(value),
  },
  dimension: {
    type: Object,
    required: true,
  },
})

const search = ref('')
const dialog = ref(false)
const editedItem = ref({})
const countChart = ref(null)
const filterChanged = ref(0)

const headers = computed(() => {
  if (props.tableType === 'projects') {
    return [
      { title: 'Star', key: 'starred', sortable: false, align: 'start' },
      { title: 'Project Name', key: 'name', align: 'start' },
      { title: 'CV Count', key: 'cvCount', align: 'start' },
      { title: 'Budget', key: 'budget', align: 'start' },
      { title: 'Status', key: 'status', align: 'start' },
      { title: 'Duration', key: 'duration', align: 'start' },
      { title: 'Actions', key: 'actions', sortable: false, align: 'start' },
    ]
  } else {
    return [
      { title: 'Name', key: 'name', align: 'start' },
      { title: 'Gender', key: 'gender', align: 'start' },
      { title: 'Age', key: 'age', align: 'start' },
      { title: 'Department', key: 'department', align: 'start' },
      { title: 'Skills', key: 'skills', align: 'start' },
      { title: 'Wage', key: 'wage', align: 'start' },
      { title: 'Actions', key: 'actions', sortable: false, align: 'start' },
    ]
  }
})

const countId = computed(() =>
  props.tableType === 'projects' ? 'project-stats' : 'mystats2'
)

const tableData = computed(() => {
  // Use filterChanged as a dependency to trigger recomputation
  filterChanged.value
  let data = props.dimension.top(Infinity)

  // Apply search filter for name
  if (search.value) {
    data = data.filter((item) => {
      if (props.tableType === 'projects') {
        // Search in project name
        return item.name.toLowerCase().includes(search.value.toLowerCase())
      } else {
        // Search in person's first and last name
        return `${item.first} ${item.last}`
          .toLowerCase()
          .includes(search.value.toLowerCase())
      }
    })
  }

  return data
})

const formatCurrency = (value) => {
  return value.toLocaleString('en-US')
}

const getStatusColor = (status) => {
  const colors = {
    finished: 'success',
    unfinished: 'error',
    'in progress': 'warning',
  }
  return colors[status.toLowerCase()]
}

const getGenderColor = (gender) => {
  return gender.toLowerCase() === 'male' ? 'primary' : 'secondary'
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

const calculateAge = (dob) => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }
  return age
}

const editItem = (item) => {
  editedItem.value = { ...item }
  dialog.value = true
}

const deleteItem = (item) => {
  if (confirm('Are you sure you want to delete this item?')) {
    // Implement delete functionality
  }
}

const closeDialog = () => {
  dialog.value = false
  editedItem.value = {}
}

const save = () => {
  // Implement save functionality
  closeDialog()
}

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
</script>

<style scoped>
.search-field {
  max-width: 300px;
}

.data-count {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  display: flex;
  align-items: center;
}
</style>
