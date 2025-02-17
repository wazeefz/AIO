<template>
  <v-container>
    <h2 class="text-h4 mb-8" style="color: #b1a184">
      Bulk Upload CV - Details
    </h2>

    <!-- Header Section -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h3 class="text-h5"></h3>
      <div class="d-flex align-center gap-2">
        <SearchBar />
        <FilterBtn />
      </div>
    </div>

    <!-- Table -->
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
                  mdi-alert-octagon
                </v-icon>
              </template>
              <div class="validation-tooltip">
                Invalid Phone Numbers <br />Requirements: <br />• Minimum 8
                numerical digits <br />• Permitted characters: numbers and ( ) -
                +
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
              v-if="
                isValueMissing(item?.gender) || !validateGender(item?.gender)
              "
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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
                <v-icon
                  v-bind="props"
                  color="#B1A184"
                  size="small"
                  class="ml-2"
                >
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

    <!-- Continue Button -->
    <div class="d-flex justify-end mt-6">
      <v-btn
        color="#B1A184"
        size="large"
        class="px-8"
        elevation="0"
        @click="handleContinue"
      >
        Continue
      </v-btn>
    </div>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>Are you sure you want to delete this entry?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey-darken-1"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn color="error" variant="text" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>

  <!-- Add this new Confirmation Dialog -->
  <v-dialog v-model="showConfirmationDialog" max-width="400">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center pa-4">
        <span class="text-h6">Confirmation Required</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="showConfirmationDialog = false"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <p>{{ confirmationMessage }}</p>
        <v-list
          v-if="statusSummary.length"
          class="bg-grey-lighten-4 mt-3 rounded"
        >
          <v-list-item
            v-for="(status, index) in statusSummary"
            :key="index"
            :prepend-icon="getStatusIcon(status.status)"
            :class="getStatusTextColor(status.status)"
          >
            {{ status.count }} {{ status.status }} entries
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="grey-darken-1"
          @click="showConfirmationDialog = false"
        >
          Cancel
        </v-btn>
        <v-btn color="#B1A184" @click="proceedWithContinue">
          Proceed Anyway
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import SearchBar from './SearchBar.vue'
import FilterBtn from './FilterBtn.vue'

const showConfirmationDialog = ref(false)
const confirmationMessage = ref('')
const statusSummary = ref([])

const getStatusCounts = () => {
  const counts = {
    Incomplete: 0,
    Duplicated: 0,
    Valid: 0,
  }

  cvData.value.forEach((item) => {
    const status = getEntryStatus(item)
    counts[status]++
  })

  return counts
}

// State
const search = ref('')
const itemsPerPage = ref(10)
const showFilterDialog = ref(false)
const showDeleteDialog = ref(false)
const itemToDelete = ref(null)

// Sample Data
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

// Validation functions
// Updated validation functions
const isValueMissing = (value) => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  )
}

const validateEmail = (email) => {
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validatePhone = (phone) => {
  if (!phone) return false

  // Only allow numbers and these specific characters: (, ), -, +
  const validCharactersOnly = /^[0-9()+\-\s]+$/.test(phone)

  // Check if the phone number has at least 8 digits (minimum reasonable length)
  const hasMinimumDigits = phone.replace(/[^0-9]/g, '').length >= 8

  return validCharactersOnly && hasMinimumDigits
}

const validateAge = (age) => {
  return age && age >= 18 && age <= 100
}

const validateExperience = (exp, age) => {
  return exp >= 0 && exp <= age - 18
}

const validateSalary = (salary) => {
  return salary && /^\$\d{1,3}(,\d{3})*$/.test(salary)
}

const validateGender = (gender) => {
  return ['Male', 'Female', 'Other'].includes(gender)
}

// Improved duplicate checking function
const isDuplicate = (currentItem) => {
  if (!currentItem) return false

  return (
    cvData.value.filter(
      (item) =>
        item.firstName?.toLowerCase() ===
          currentItem.firstName?.toLowerCase() &&
        item.lastName?.toLowerCase() === currentItem.lastName?.toLowerCase() &&
        item.email?.toLowerCase() === currentItem.email?.toLowerCase()
    ).length > 1
  )
}

// Enhanced field validation
const validateFields = (item) => {
  if (!item) return { missingFields: [], invalidFields: [] }

  const missingFields = []
  const invalidFields = []

  // Required fields validation with proper labels
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'experience', label: 'Experience' },
    { key: 'location', label: 'Location' },
    { key: 'salary', label: 'Salary' },
    { key: 'skills', label: 'Skills' },
  ]

  // Check for missing required fields
  requiredFields.forEach(({ key, label }) => {
    if (isValueMissing(item[key])) {
      missingFields.push(label)
    }
  })

  // Validate field formats
  if (item.email && !validateEmail(item.email)) {
    invalidFields.push('Email')
  }
  if (item.phone && !validatePhone(item.phone)) {
    invalidFields.push('Phone')
  }
  if (item.age && !validateAge(item.age)) {
    invalidFields.push('Age')
  }
  if (item.experience && !validateExperience(item.experience, item.age)) {
    invalidFields.push('Experience')
  }
  if (item.salary && !validateSalary(item.salary)) {
    invalidFields.push('Salary')
  }
  if (item.gender && !validateGender(item.gender)) {
    invalidFields.push('Gender')
  }

  return { missingFields, invalidFields }
}

// Improved entry status determination
const getEntryStatus = (item) => {
  if (!item) return 'Incomplete'

  if (isDuplicate(item)) {
    return 'Duplicated'
  }

  const { missingFields, invalidFields } = validateFields(item)
  if (missingFields.length > 0 || invalidFields.length > 0) {
    return 'Incomplete'
  }

  return 'Valid'
}

// Enhanced status-related utility functions
const getStatusChipColor = (item) => {
  const status = getEntryStatus(item)
  switch (status) {
    case 'Valid':
      return 'success'
    case 'Incomplete':
      return 'error'
    case 'Duplicated':
      return 'warning'
    default:
      return 'grey'
  }
}

const getStatusClass = (status) => ({
  'text-success': status === 'Valid',
  'text-error': status === 'Incomplete',
  'text-warning': status === 'Duplicated',
})

const getValidationMessage = (item) => {
  const messages = []

  if (isDuplicate(item)) {
    messages.push('Duplicate Entry Found')
  }

  const { missingFields, invalidFields } = validateFields(item)
  if (missingFields.length > 0) {
    messages.push(`Missing Fields: ${missingFields.join(', ')}`)
  }
  if (invalidFields.length > 0) {
    messages.push(`Invalid Fields: ${invalidFields.join(', ')}`)
  }

  return messages.join('\n')
}

// Filter state
const filters = ref({
  ageMin: '',
  ageMax: '',
  expMin: '',
  expMax: '',
  salaryMin: '',
  salaryMax: '',
  gender: 'All',
  location: 'All',
  skills: [],
  status: 'All',
})

// For locations
const locationSearch = ref('')
const locations = computed(() => {
  // Get unique locations from data and add 'All' option
  const uniqueLocations = [
    'All',
    ...new Set(cvData.value.map((item) => item.location).filter(Boolean)),
  ].sort()

  // Filter based on search if needed
  if (locationSearch.value) {
    return uniqueLocations.filter((location) =>
      location.toLowerCase().includes(locationSearch.value.toLowerCase())
    )
  }

  return uniqueLocations
})

// Custom filter functions should be outside computed properties
const customLocationFilter = (item, query, value) => {
  if (query == null || query === '') return true
  return item.toLowerCase().includes(query.toLowerCase())
}

const customSkillFilter = (item, query, value) => {
  if (query == null || query === '') return true
  return item.toLowerCase().includes(query.toLowerCase())
}

// Skills-related computed property
const availableSkills = computed(() => {
  const uniqueSkills = [
    ...new Set(
      cvData.value.flatMap((item) => item.skills || []).filter(Boolean)
    ),
  ].sort()

  if (skillSearch.value) {
    return uniqueSkills.filter((skill) =>
      skill.toLowerCase().includes(skillSearch.value.toLowerCase())
    )
  }

  return uniqueSkills
})
// For skills
const skillSearch = ref('')

// Table headers
const headers = [
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
]

// Utility functions
const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return `${first}${last}`
}

// Filter functions
const applyFilters = () => {
  showFilterDialog.value = false
}

const resetFilters = () => {
  filters.value = {
    ageMin: '',
    ageMax: '',
    expMin: '',
    expMax: '',
    salaryMin: '',
    salaryMax: '',
    gender: 'All',
    location: 'All',
    skills: [],
    status: 'All',
  }
}

// Action handlers
const editItem = (item) => {
  console.log('Edit item:', item)
  // Implement edit functionality
}

const deleteItem = (item) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  const index = cvData.value.findIndex(
    (item) => item.id === itemToDelete.value.id
  )
  if (index !== -1) {
    cvData.value.splice(index, 1)
  }
  showDeleteDialog.value = false
  itemToDelete.value = null
}

// Computed values
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

const getStatusIcon = (status) => {
  switch (status) {
    case 'Valid':
      return 'mdi-check-circle'
    case 'Incomplete':
      return 'mdi-alert-circle'
    case 'Duplicated':
      return 'mdi-content-copy'
    default:
      return 'mdi-information'
  }
}

const getStatusTextColor = (status) => {
  switch (status) {
    case 'Valid':
      return 'text-success'
    case 'Incomplete':
      return 'text-error'
    case 'Duplicated':
      return 'text-warning'
    default:
      return ''
  }
}

const handleContinue = () => {
  const counts = getStatusCounts()

  // If all entries are valid, proceed directly
  if (counts.Incomplete === 0 && counts.Duplicated === 0) {
    proceedWithContinue()
    return
  }

  // Prepare status summary
  statusSummary.value = Object.entries(counts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({ status, count }))

  // Set confirmation message based on status
  let message = 'You have: \n'
  if (counts.Incomplete > 0 && counts.Duplicated > 0) {
    confirmationMessage.value =
      'There are both incomplete and duplicated entries in your data. Do you want to proceed anyway?'
  } else if (counts.Incomplete > 0) {
    confirmationMessage.value =
      'There are incomplete entries in your data. Do you want to proceed anyway?'
  } else if (counts.Duplicated > 0) {
    confirmationMessage.value =
      'There are duplicated entries in your data. Do you want to proceed anyway?'
  }

  showConfirmationDialog.value = true
}

const proceedWithContinue = () => {
  // Add your continue logic here
  console.log('Proceeding with continue action')
  showConfirmationDialog.value = false
  // You can add your navigation or form submission logic here
}
</script>

<style scoped>
.profile-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.initials {
  font-size: 16px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
}

.skill-chip {
  background-color: #f5f5f5 !important;
  color: #666 !important;
  margin: 2px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
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

.search-field {
  :deep(.v-field__input) {
    padding: 8px 16px !important;
    min-height: 48px !important;
  }
}

.filter-btn {
  height: 48px !important;
}

:deep(.v-tooltip) {
  background-color: rgba(0, 0, 0, 0.9);
  border-radius: 4px;
  font-size: 12px;
  padding: 4px 8px;
}

.validation-tooltip {
  white-space: pre-line;
  max-width: 250px;
  text-align: left;
  line-height: 1.4;
  padding: 4px 0;
}

:deep(.v-data-table-footer) {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.v-data-table-footer__items-per-page) {
  margin-right: 32px;
}

:deep(.v-btn--icon) {
  width: 36px;
  height: 36px;
}

/* Status-specific styles */
:deep(.v-chip.success) {
  background-color: #86efac !important;
  color: #166534 !important;
}

:deep(.v-chip.error) {
  background-color: #fca5a5 !important;
  color: #991b1b !important;
}

:deep(.v-chip.warning) {
  background-color: #fef08a !important;
  color: #854d0e !important;
}

.text-success {
  color: #16a34a !important;
}

.text-error {
  color: #dc2626 !important;
}

.text-warning {
  color: #ca8a04 !important;
}

:deep(.v-list) {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.v-list-item) {
  min-height: 40px !important;
}
</style>
