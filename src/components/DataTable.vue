<template>
  <v-card v-if="tableType === 'projects'">
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
              <v-col cols="12">
                <v-select
                  v-model="editedItem.status"
                  :items="['Finished', 'Unfinished', 'In Progress']"
                  label="Status"
                ></v-select>
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

  <div v-else-if="tableType === 'people'">
    <div>
      <b>People by Department</b>
    </div>
    <div>
      <div id="mystats2" class="dc-data-count">
        <span class="filter-count"></span> selected out of
        <span class="total-count"></span>
      </div>
    </div>

    <div>
      <div id="mytable"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useProjectStore } from '../stores/project'
import * as d3 from 'd3'
import * as dc from 'dc'
import 'dc/src/compat/d3v6'

export default {
  name: 'DataTable',
  props: {
    tableType: {
      type: String,
      required: true,
      validator: (value) => ['projects', 'people'].includes(value)
    },
    ndx: {
      type: Object,
      required: false
    }
  },
  setup(props) {
    const projectStore = useProjectStore()
    const search = ref('')
    const dialog = ref(false)
    const editedItem = ref({
      id: null,
      name: '',
      cvCount: 0,
      budget: 0,
      status: '',
      duration: { years: 0, months: 0 },
      starred: false
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

    // People table setup
    const countChart = ref(null)
    const tableChart = ref(null)

    onMounted(() => {
      if (props.tableType === 'people') {
        generateCharts()
      }
    })

    const projects = computed(() => projectStore.projects)

    const toggleStar = (id) => {
      const project = projects.value.find(p => p.id === id)
      if (project) {
        projectStore.updateProject({
          ...project,
          starred: !project.starred
        })
      }
    }

    const formatCurrency = (value) => {
      return value.toLocaleString('en-MY')
    }

    const getStatusColor = (status) => {
      const colors = {
        'Finished': 'success',
        'Unfinished': 'error',
        'In Progress': 'warning',
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
        projectStore.deleteProject(item.id)
      }
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = {
        id: null,
        name: '',
        cvCount: 0,
        budget: 0,
        status: '',
        duration: { years: 0, months: 0 },
        starred: false
      }
    }

    const save = () => {
      projectStore.updateProject(editedItem.value)
      closeDialog()
    }

    function calculateAge(dob) {
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

    function generateCharts() {
      if (!props.ndx) return

      const departmentDimension = props.ndx.dimension((d) => d.department)
      const all = props.ndx.groupAll()

      countChart.value = dc.dataCount('#mystats2')
      tableChart.value = dc.dataTable('#mytable')

      countChart.value.crossfilter(props.ndx).groupAll(all)

      tableChart.value
        .dimension(departmentDimension)
        .section((d) => d.department)
        .size(Infinity)
        .columns([
          'first',
          {
            label: 'Gender',
            format: (d) => d.gender,
          },
          {
            label: 'Age',
            format: (d) => calculateAge(d.dob),
          },
          {
            label: 'Marital Status',
            format: (d) => (d.MaritalStatus ? 'Married' : 'Single'),
          },
          {
            label: 'Department',
            format: (d) => d.department,
          },
          {
            label: 'Skills',
            format: (d) => d.skill.join(', '),
          },
          {
            label: 'Wage',
            format: (d) => `$${d.wage.toLocaleString()}`,
          },
        ])
        .sortBy((d) => d.first)
        .order(d3.ascending)

      countChart.value.render()
      tableChart.value.render()
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
      
      // People table returns
      countChart,
      tableChart,
      generateCharts
    }
  },
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>