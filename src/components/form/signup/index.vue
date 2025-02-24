<template>
  <v-container>
    <v-card class="mx-auto pa-4" max-width="400">
      <v-card-title class="text-h5 text-center">Sign Up</v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submitSignUp">
          <v-text-field
            v-model="name"
            label="Full Name"
            type="text"
            variant="outlined"
            required
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            required
          ></v-text-field>

          <!-- Fetch departments from backend -->
          <v-select
            v-model="department_id"
            :items="departments"
            item-title="department_name"
            item-value="department_id"
            label="Department"
            variant="outlined"
            required
          ></v-select>

          <v-text-field
            v-model="role"
            label="Role"
            type="text"
            variant="outlined"
            required
          ></v-text-field>

          <v-btn
            :loading="loading"
            type="submit"
            color="primary"
            block
            class="mt-3"
            :disabled="isSubmitDisabled"
          >
            Sign Up
          </v-btn>

          <!-- Error message -->
          <div v-if="errorMessage" class="mt-3 text-center text-red">
            {{ errorMessage }}
          </div>
        </v-form>

        <!-- Login Link -->
        <div class="text-center mt-4">
          <span>Already have an account?</span>
          <v-btn variant="text" color="primary" @click="goToLogin">Login</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuth } from '@/composables/useAuth' // Import composable

const { signup, error } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('') // Display-only field
const department_id = ref(null)
const role = ref('') // Now a free-text input

const departments = ref([]) // Store fetched departments
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

// Fetch departments from backend on component mount
const fetchDepartments = async () => {
  try {
    const response = await axios.get('http://localhost:8000/departments/')
    departments.value = response.data // Assign fetched data
  } catch (error) {
    console.error('Error fetching departments:', error)
  }
}

// Run fetchDepartments when component is mounted
onMounted(fetchDepartments)

// Disable button if any field is missing
const isSubmitDisabled = computed(() => {
  return !(name.value && email.value && department_id.value && role.value)
})

const submitSignUp = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    await signup({
      name: name.value,
      email: email.value,
      department_id: department_id.value,
      role: role.value,
    })

    // Redirect to login page after successful signup
    router.push('/login')
  } catch (err) {
    errorMessage.value = error.value || 'Signup failed'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>
