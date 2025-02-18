<template>
  <v-card class="mb-4" elevation="0" border>
    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="filteredCvData"
      :search="search"
      class="elevation-0 custom-table"
      hover
      :items-per-page-options="[2, 4, 6, 8, 10]"
      item-value="id"
    >
      <!-- Profile Picture -->
      <template v-slot:item.profile="{ item }">
        <div class="profile-circle">
          <template v-if="item?.profilePic">
            <v-img :src="item.profilePic" cover />
          </template>
          <template v-else>
            <div class="initials">
              {{ getInitials(item?.firstName, item?.lastName) }}
            </div>
          </template>
        </div>
      </template>

      <!-- First Name Column -->
      <template v-slot:item.firstName="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.firstName || '-' }}</span>
          <v-tooltip v-if="isValueMissing(item?.firstName)" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Missing First Name</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Last Name Column -->
      <template v-slot:item.lastName="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.lastName }}</span>
          <v-tooltip v-if="isValueMissing(item?.lastName)" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Missing Last Name</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Age Column -->
      <template v-slot:item.age="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.age }}</span>
          <v-tooltip v-if="!validateAge(item?.age)" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Invalid Age (Must be between 18-100)</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Phone Column -->
      <template v-slot:item.phone="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.phone }}</span>
          <v-tooltip v-if="!validatePhone(item?.phone)" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <div class="validation-tooltip">
              Invalid Phone Numbers <br />Requirements: <br />• Minimum 8
              numerical digits <br />• Permitted characters: numbers and ( ) - +
            </div>
          </v-tooltip>
        </div>
      </template>

      <!-- Email Column -->
      <template v-slot:item.email="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.email }}</span>
          <v-tooltip v-if="!validateEmail(item?.email)" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Invalid Email Format</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Experience Column -->
      <template v-slot:item.experience="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.experience }}</span>
          <v-tooltip
            v-if="!validateExperience(item?.experience, item?.age)"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Invalid Experience (Experience exceeds age limit)</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Gender Column -->
      <template v-slot:item.gender="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.gender || '-' }}</span>
          <v-tooltip
            v-if="isValueMissing(item?.gender) || !validateGender(item?.gender)"
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>
              {{
                isValueMissing(item?.gender)
                  ? 'Missing Gender'
                  : 'Invalid Gender'
              }}
            </span>
          </v-tooltip>
        </div>
      </template>

      <!-- Skills Column -->
      <template v-slot:item.skills="{ item }">
        <div class="d-flex flex-wrap gap-1">
          <template v-if="item?.skills?.length">
            <v-chip
              v-for="(skill, index) in item.skills.slice(0, 3)"
              :key="skill"
              size="x-small"
              class="skill-chip"
            >
              {{ skill }}
            </v-chip>
            <v-tooltip v-if="item.skills.length > 3" location="top">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" size="x-small" class="skill-chip">
                  +{{ item.skills.length - 3 }}
                </v-chip>
              </template>
              <span>{{ item.skills.slice(3).join(', ') }}</span>
            </v-tooltip>
          </template>
          <v-tooltip v-else location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Skills are required</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Location Column -->
      <template v-slot:item.location="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.location }}</span>
          <v-tooltip v-if="isValueMissing(item?.location)" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Location is required</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Salary Column -->
      <template v-slot:item.salary="{ item }">
        <div class="d-flex align-center">
          <span>{{ item?.salary }}</span>
          <v-tooltip v-if="!validateSalary(item?.salary)" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="#B1A184" size="small" class="ml-2">
                mdi-alert-octagon
              </v-icon>
            </template>
            <span>Invalid Salary</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Status Column -->
      <template v-slot:item.status="{ item }">
        <div class="d-flex align-center">
          <v-chip
            :color="getStatusChipColor(item)"
            :class="getStatusClass(getEntryStatus(item))"
            label
            size="small"
          >
            {{ getEntryStatus(item) }}
          </v-chip>
          <v-tooltip v-if="getEntryStatus(item) !== 'Valid'" location="top">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                :color="
                  getEntryStatus(item) === 'Duplicated' ? 'warning' : 'error'
                "
                size="small"
                class="ml-2"
              >
                {{
                  getEntryStatus(item) === 'Duplicated'
                    ? 'mdi-file-alert'
                    : 'mdi-progress-alert'
                }}
              </v-icon>
            </template>
            <div class="validation-tooltip">
              {{ getValidationMessage(item) }}
            </div>
          </v-tooltip>
        </div>
      </template>

      <!-- Actions Column -->
      <template v-slot:item.actions="{ item }">
        <div class="d-flex gap-2">
          <v-btn
            icon="mdi-pencil"
            variant="text"
            density="comfortable"
            color="#B1A184"
            @click="editItem(item)"
          />
          <v-btn
            icon="mdi-delete"
            variant="text"
            density="comfortable"
            color="error"
            @click="deleteItem(item)"
          />
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const itemsPerPage = ref(10)
const headers = ref([
  { title: 'Profile', key: 'profile', align: 'center', width: '80px' },
  { title: 'First Name', key: 'firstName', align: 'start' },
  { title: 'Last Name', key: 'lastName', align: 'start' },
  { title: 'Age', key: 'age', align: 'start', width: '80px' },
  { title: 'Gender', key: 'gender', align: 'start' },
  { title: 'Phone', key: 'phone', align: 'start' },
  { title: 'Email', key: 'email', align: 'start' },
  { title: 'Experience', key: 'experience', align: 'start', width: '100px' },
  { title: 'Skills', key: 'skills', align: 'start' },
  { title: 'Location', key: 'location', align: 'start' },
  { title: 'Salary', key: 'salary', align: 'start' },
  { title: 'Status', key: 'status', align: 'start' },
  {
    title: 'Actions',
    key: 'actions',
    align: 'center',
    width: '100px',
    sortable: false,
  },
])
const cvData = ref([
  {
    profilePic: '',
    firstName: 'Jane',
    lastName: 'Cooper',
    age: 28,
    gender: 'Female',
    phone: '(225) 555-0118',
    email: 'jane@microsoft.com',
    experience: 5,
    skills: ['Java', 'Python', 'React', 'TypeScript', 'Node.js'],

    salary: '$120,000',
  },

  {
    lastName: 'Lee',
    age: 28,
    gender: 'Female',
    phone: '(225) 555-0118',
    email: 'jane@microsoft.com',
    experience: 5,
    skills: ['Java', 'Python', 'React', 'TypeScript', 'Node.js'],
    location: 'United States',
  },

  {
    profilePic: '',
    firstName: 'Jane',
    lastName: 'Cooper',
    age: 28,
    gender: 'Female',
    phone: '(225) 555-0118',
    email: 'jane@microsoft.com',
    experience: 5,
    skills: [
      'Java',
      'Python',
      'React',
      'TypeScript',
      'Node.js',
      'Project Management',
    ],
    location: 'United States',
    salary: '$120,000',
  },
  {
    id: 2,
    profilePic: '',
    firstName: 'Floyd',

    phone: ' 555-0100',
    email: 'floodyahoo.com',
    experience: 3,

    location: 'Kiribati',
    salary: '$95,000',
  },
  {
    profilePic: '',
    firstName: 'John',
    lastName: 'Coop',
    age: 50,
    gender: 'Male',
    phone: '(+60) 555-0118',
    email: 'john@microsoft.com',
    experience: 20,
    skills: [
      'Java',
      'Python',
      'React',
      'TypeScript',
      'Node.js',
      'Project Management',
      'AI',
    ],
    location: 'Malaysia',
    salary: '$160,000',
  },
])

const filteredCvData = computed(() => {
  let filtered = [...cvData.value]

  // Apply filters
  if (filters.value.ageMin) {
    filtered = filtered.filter(
      (item) => item.age && item.age >= parseInt(filters.value.ageMin)
    )
  }

  if (filters.value.ageMax) {
    filtered = filtered.filter(
      (item) => item.age && item.age <= parseInt(filters.value.ageMax)
    )
  }

  if (filters.value.expMin) {
    filtered = filtered.filter(
      (item) =>
        item.experience && item.experience >= parseInt(filters.value.expMin)
    )
  }

  if (filters.value.expMax) {
    filtered = filtered.filter(
      (item) =>
        item.experience && item.experience <= parseInt(filters.value.expMax)
    )
  }

  if (filters.value.salaryMin) {
    filtered = filtered.filter((item) => {
      if (!item.salary) return false
      const salary = parseInt(item.salary.replace(/[^0-9]/g, ''))
      return salary >= parseInt(filters.value.salaryMin)
    })
  }

  if (filters.value.salaryMax) {
    filtered = filtered.filter((item) => {
      if (!item.salary) return false
      const salary = parseInt(item.salary.replace(/[^0-9]/g, ''))
      return salary <= parseInt(filters.value.salaryMax)
    })
  }

  if (filters.value.gender !== 'All') {
    filtered = filtered.filter((item) => item.gender === filters.value.gender)
  }

  // In your filteredCvData computed property
  if (filters.value.location && filters.value.location !== 'All') {
    filtered = filtered.filter(
      (item) => item.location === filters.value.location
    )
  }

  if (filters.value.skills.length > 0) {
    filtered = filtered.filter(
      (item) =>
        item.skills &&
        filters.value.skills.every((skill) => item.skills.includes(skill))
    )
  }

  if (filters.value.status !== 'All') {
    filtered = filtered.filter(
      (item) => getEntryStatus(item) === filters.value.status
    )
  }

  // Apply search filter
  if (search.value) {
    const searchTerm = search.value.toLowerCase()
    filtered = filtered.filter((item) => {
      return (
        item.firstName?.toLowerCase().includes(searchTerm) ||
        item.lastName?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm) ||
        item.location?.toLowerCase().includes(searchTerm) ||
        (item.skills &&
          item.skills.some((skill) => skill.toLowerCase().includes(searchTerm)))
      )
    })
  }

  return filtered
})

const editItem = (item) => {
  console.log('Edit item:', item)
}

const deleteItem = (item) => {
  console.log('Delete item:', item)
}
</script>
