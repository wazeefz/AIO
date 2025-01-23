<template>
  <div>
    <!-- Edit Button -->
    <v-btn color="primary" @click="toggleEditMode" class="mb-4">
      {{ isEditing ? 'Cancel Edit' : 'Edit' }}
    </v-btn>

    <!-- Add Button (Visible only in edit mode) -->
    <v-btn
      v-if="isEditing"
      color="success"
      @click="openAddModal"
      class="mb-4 ml-2"
    >
      Add Profile
    </v-btn>

    <!-- Profile Cards -->
    <ProfileCard
      v-for="result in combinedResults"
      :key="result.id"
      :result="result"
      :is-editing="isEditing"
      @remove-profile="removeProfile"
    />

    <!-- Add Profile Modal -->
    <v-dialog v-model="showAddModal" max-width="600px">
      <v-card>
        <v-card-title>Add New Profile</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addProfile">
            <v-text-field v-model="newProfile.title" label="Title" required />
            <v-text-field
              v-model="newProfile.department"
              label="Department"
              required
            />
            <v-text-field v-model="newProfile.salary" label="Salary" required />
            <v-text-field
              v-model="newProfile.employment"
              label="Employment Type"
              required
            />
            <v-combobox
              v-model="newProfile.skills"
              label="Skills"
              multiple
              chips
              required
            />
            <v-btn type="submit" color="primary">Add</v-btn>
            <v-btn @click="closeAddModal" color="secondary">Cancel</v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFilterStore } from '@/stores/filterStore'
import { useProfileStore } from '@/stores/editProfileCardStore'
import ProfileCard from '@/components/profileCard.vue'

const filterStore = useFilterStore()
const profileStore = useProfileStore()
const showAddModal = ref(false)
const isEditing = ref(false)
const newProfile = ref({
  title: '',
  department: '',
  salary: '',
  employment: '',
  skills: [],
})

// Combine mockData and projectTeam for display
const combinedResults = computed(() => [
  ...filterStore.filteredResults,
  ...profileStore.projectTeam,
])

// Toggle edit mode
const toggleEditMode = () => {
  isEditing.value = !isEditing.value
}

const openAddModal = () => {
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  newProfile.value = {
    title: '',
    department: '',
    salary: '',
    employment: '',
    skills: [],
  }
}

const addProfile = () => {
  profileStore.addProfile(newProfile.value)
  closeAddModal()
}

const removeProfile = (id) => {
  profileStore.removeProfile(id)
}
</script>
