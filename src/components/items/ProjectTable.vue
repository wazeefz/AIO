<template>
  <div class="table-wrapper">
    <main class="table">
      <div class="table__header">
        <h1>Projects</h1>
        <div class="input-group">
          <SearchBar v-model="search" />
          <!-- <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
            class="search-input"
          ></v-text-field> -->
        </div>
      </div>

      <div class="table__body">
        <v-data-table
          height="500"
          density="default"
          :headers="headers"
          :items="projects"
          :search="search"
        >
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.key">
                {{ header.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in projects" :key="item.id">
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
                <!-- <v-chip
                  :class="`status ${item.status
                    .toLowerCase()
                    .replace(' ', '-')}`"
                >
                  {{ item.status }}
                </v-chip>
              </td>
              <td>{{ formatDuration(item.duration) }}</td>
              <td class="actions"> -->

                <v-chip
                  :color="getStatusColor(item.status)"
                  style="width: 120px; justify-content: center"
                >
                  {{ item.status }}
                </v-chip>
              </td>
              <td>{{ formatDuration(item.duration) }}</td>
              <td class="d-flex align-center">
                <EditBtn />
                <RemoveBtn color="#DB848C" @remove="deleteItem(item)" />
                <!-- <v-btn
                  icon="mdi-pencil"
                  size="x-small"
                  color="primaryBrown"
                  class="mr-1 mr-xl-3"
                  @click="editItem(item)"
                ></v-btn> -->
                <!-- <v-btn
                  icon="mdi-close-circle"
                  size="x-small"
                  color="#DB848C"
                  @click="deleteItem(item)"
                ></v-btn> -->
              </td>
            </tr>
          </tbody>
        </v-data-table>
      </div>
    </main>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useProjects } from '@/composables/useProjects'
import SearchBar from '@/components/items/SearchBar.vue'
import RemoveBtn from '@/components/items/RemoveBtn.vue'

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
      deleteProject(item.id)
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

<style scoped>
.table-wrapper {
  opacity: 0.9; /* Adjust opacity for the entire table */
}

.table {
  width: 82vw;
  height: 90vh;
  background-color: rgba(234, 227, 214, 0.4); /* Adjust background opacity */
  backdrop-filter: blur(10px); /* Apply a blur effect for the glassy look */
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.8); /* Soft shadow for depth */
  border-radius: 0.8rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2); /* Light border for a polished look */
}

.table__header {
  width: 100%;
  height: 10%;
  background-color: rgba(
    234,
    227,
    214,
    0.8
  ); /* Adjust header background opacity */
  padding: 0.8rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(5px); /* Add blur to the header for consistency */
  border-bottom: 1px solid rgba(255, 255, 255, 0.2); /* Light border for separation */
}

.table__body {
  width: 95%;
  max-height: calc(89% - 1.6rem);
  background-color: rgba(
    145,
    145,
    145,
    0.3
  ); /* Adjust body background opacity */
  margin: 0.8rem auto;
  border-radius: 0.6rem;
  overflow: auto;
  overflow: overlay;
  backdrop-filter: blur(5px); /* Add blur to the body */
}

.table__header h1 {
  font-size: 1.5rem;
  color: #000000;
}

.input-group {
  height: 100%;
  background-color: #fff;
  border-radius: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.2s;
}

.input-group:hover {
  box-shadow: 0 0.1rem 0.4rem #0002;
}

.search-input {
  width: 100%;
  padding: 0 0.5rem 0 0.3rem;
  background-color: transparent;
  border: none;
  outline: none;
}

.table__body::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;
}

.table__body::-webkit-scrollbar-thumb {
  border-radius: 0.5rem;
  background-color: #0004;
  visibility: hidden;
}

.table__body:hover::-webkit-scrollbar-thumb {
  visibility: visible;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 1rem;
  text-align: left;
}

thead th {
  position: sticky;
  top: 0;
  left: 0;
  background-color: rgba(145, 145, 145, 0.9);
  cursor: pointer;
  text-transform: capitalize;
  font-weight: 600;
  color: #000000;
}

tbody tr:hover {
  background-color: #f1f1f1 !important;
}
/* 
.status {
  padding: 0.4rem 0.8rem;
  border-radius: 2rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
}

.status.finished {
  background-color: #86e49d;
  color: #006b21;
}

.status.unfinished {
  background-color: #d893a3;
  color: #b30021;
}

.status.in-progress {
  background-color: #ebc474;
  color: #8a6d3b;
}

.actions {
  display: flex;
  gap: 0.5rem;
} */

@media (max-width: 1000px) {
  td:not(:first-of-type) {
    min-width: 12.1rem;
  }
}
</style>
