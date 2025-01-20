<template>
  <div class="ma-8">
    <h1 class="text-md-center">Projects</h1>
  </div>

  <div class="data-table-container">
    <!-- Search and Filter Section -->
    <div class="controls">
      <div class="search-box">
        <input
          v-model="search"
          placeholder="Search projects..."
          @input="filterData"
        />
      </div>
      <div class="filter-box">
        <select v-model="statusFilter" @change="filterData">
          <option value="">All Status</option>
          <option value="Active">Unfinished</option>
          <option value="Completed">Finished</option>
          <option value="Hold">In Progress</option>
        </select>
      </div>
    </div>

    <!-- Data Table -->
    <table class="data-table">
      <thead>
        <tr>
          <th class="star-btn" color="secondaryBrown">★</th>
          <th>
            Project Name
            <span class="sort-icon">{{ getSortIcon('projectName') }}</span>
          </th>
          <th @click="sort('numberOfCv')">
            Number of CV
            <span class="sort-icon">{{ getSortIcon('numberOfCv') }}</span>
          </th>
          <th @click="sort('estimatedBudget')">
            Estimated Budget
            <span class="sort-icon">{{ getSortIcon('estimatedBudget') }}</span>
          </th>
          <th @click="sort('status')">
            Status
            <span class="sort-icon">{{ getSortIcon('status') }}</span>
          </th>
          <th @click="sort('duration')">
            Duration
            <span class="sort-icon">{{ getSortIcon('duration') }}</span>
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="project in paginatedData" :key="project.id">
          <td>
            <button
              @click="toggleStar(project)"
              class="star-btn"
              :class="{ starred: project.starred }"
            >
              {{ project.starred ? '★' : '☆' }}
            </button>
          </td>
          <td>{{ project.projectName }}</td>
          <td>{{ project.numberOfCv }}</td>
          <td>${{ formatNumber(project.estimatedBudget) }}</td>
          <td>
            <span :class="['status-badge', project.status.toLowerCase()]">
              {{ project.status }}
            </span>
          </td>
          <td>{{ project.duration }} months</td>
          <td class="actions">
            <button @click="openEditModal(project)" class="edit-btn">
              Edit
            </button>
            <button @click="deleteProject(project.id)" class="delete-btn">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">
        Previous
      </button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">
        Next
      </button>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Edit Project</h2>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label>Project Name:</label>
            <input v-model="editingProject.projectName" required />
          </div>

          <div class="form-group">
            <label>Number of CV:</label>
            <input
              type="number"
              v-model.number="editingProject.numberOfCv"
              required
              min="0"
            />
          </div>

          <div class="form-group">
            <label>Estimated Budget:</label>
            <input
              type="number"
              v-model.number="editingProject.estimatedBudget"
              required
              min="0"
            />
          </div>

          <div class="form-group">
            <label>Status:</label>
            <select v-model="editingProject.status">
              <option>Unfinished</option>
              <option>Finished</option>
              <option>In Progress</option>
            </select>
          </div>

          <div class="form-group">
            <label>Duration (months):</label>
            <input
              type="number"
              v-model.number="editingProject.duration"
              required
              min="1"
            />
          </div>

          <div class="modal-actions">
            <button type="submit" class="save-btn">Save</button>
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  data() {
    return {
      projects: [
        {
          id: 1,
          projectName: 'Market Research',
          numberOfCv: 2,
          estimatedBudget: 25000000,
          status: 'Finished',
          duration: 6,
          starred: false,
        },
        {
          id: 2,
          projectName: 'CapyBaAI Website',
          numberOfCv: 4,
          estimatedBudget: 475000,
          status: 'Unfinished',
          duration: 8,
          starred: false,
        },
        {
          id: 3,
          projectName: 'Data Mining',
          numberOfCv: 10,
          estimatedBudget: 30000,
          status: 'In Progress',
          duration: 1,
          starred: false,
        },

        {
          id: 4,
          projectName: 'Backend Dev - AIO',
          numberOfCv: 5,
          estimatedBudget: 43990,
          status: 'In Progress',
          duration: 3,
          starred: false,
        },

        {
          id: 5,
          projectName: 'School Construction',
          numberOfCv: 50,
          estimatedBudget: 3887960,
          status: 'Unfinished',
          duration: 1,
          starred: false,
        },
        {
          id: 6,
          projectName: 'Market Outreach (flyers)',
          numberOfCv: 7,
          estimatedBudget: 2100,
          status: 'Finished',
          duration: 20,
          starred: false,
        },
      ],
      currentPage: 1,
      itemsPerPage: 5,
      sortKey: 'projectName',
      sortOrder: 'asc',
      search: '',
      statusFilter: '',
      filteredData: [],
      showModal: false,
      editingProject: null,
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage)
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredData.slice(start, end)
    },
  },
  methods: {
    toggleStar(project) {
      project.starred = !project.starred
      // If you want to sort starred items to the top after toggling
      if (this.sortKey === 'starred') {
        this.sort('starred')
      }
    },
    formatNumber(number) {
      return number.toLocaleString()
    },
    sort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }

      this.filteredData.sort((a, b) => {
        let comparison = 0
        if (a[key] > b[key]) comparison = 1
        if (a[key] < b[key]) comparison = -1
        return this.sortOrder === 'desc' ? comparison * -1 : comparison
      })
    },
    getSortIcon(key) {
      if (this.sortKey === key) {
        return this.sortOrder === 'asc' ? '↑' : '↓'
      }
      return ''
    },
    filterData() {
      this.filteredData = this.projects.filter((project) => {
        const matchesSearch = project.projectName
          .toLowerCase()
          .includes(this.search.toLowerCase())
        const matchesStatus =
          !this.statusFilter || project.status === this.statusFilter
        return matchesSearch && matchesStatus
      })
      this.currentPage = 1
    },
    openEditModal(project) {
      this.editingProject = { ...project }
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.editingProject = null
    },
    saveEdit() {
      const index = this.projects.findIndex(
        (p) => p.id === this.editingProject.id
      )
      if (index !== -1) {
        this.projects[index] = { ...this.editingProject }
        this.filterData()
        this.closeModal()
      }
    },
    deleteProject(id) {
      if (confirm('Are you sure you want to delete this project?')) {
        this.projects = this.projects.filter((project) => project.id !== id)
        this.filterData()
      }
    },
  },
  created() {
    this.filterData()
  },
}
</script>

<style scoped>
/* Previous styles remain the same */

/* Add these new styles for the modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal h2 {
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  background: #b1a184;
  color: white;
}

.cancel-btn {
  background: #f5f5f5;
  color: #333;
}

.save-btn:hover {
  background: #eae3d6;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

/* Previous styles */
.data-table-container {
  padding: 20px;
  max-width: auto;
  margin: 0 auto;
}

.controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box input,
.filter-box select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table th {
  background: #eae3d6;
  cursor: pointer;
  user-select: none;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9em;
}

.status-badge.unfinished {
  background: #e1f7e1;
  color: #2e7d32;
}

.status-badge.finished {
  background: #e8eaf6;
  color: #283593;
}

.status-badge.progress {
  background: #fff3e0;
  color: #ef6c00;
}

.actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn {
  background: #b1a184;
  color: white;
}

.delete-btn {
  background: #d32f2f;
  color: white;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    gap: 10px;
  }

  .data-table {
    display: block;
    overflow-x: auto;
  }

  .modal {
    width: 95%;
    margin: 10px;
  }
}
.star-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #ccc;
  transition: color 0.2s ease;
}

.star-btn:hover {
  color: #ffd700;
}

.star-btn.starred {
  color: #ffd700;
}
</style>
