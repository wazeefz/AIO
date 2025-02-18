<template>
  <v-container>
    <v-card class="mx-auto pa-4" max-width="400">
      <v-card-title class="text-h5 text-center">Login</v-card-title>

      <v-card-text>
        <v-form @submit.prevent="submitLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            required
          ></v-text-field>

          <v-btn
            :loading="loading"
            type="submit"
            color="primary"
            block
            class="mt-3"
          >
            Login
          </v-btn>

          <!-- Error message below the login button -->
          <div v-if="errorMessage" class="mt-3 text-center text-red">
            {{ errorMessage }}
          </div>
        </v-form>

        <!-- Sign-up Link -->
        <div class="text-center mt-4">
          <span>Don't have an account?</span>
          <v-btn variant="text" color="primary" @click="goToSignUp">
            Sign Up
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()

const submitLogin = async () => {
  try {
    loading.value = true
    const response = await axios.post('http://127.0.0.1:8000/login/', {
      email: email.value,
      password: password.value,
    })

    // Store token and user information
    const { access_token, user_name } = response.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('name', user_name)
    localStorage.setItem('isAuthenticated', 'true')

    // Clear any existing error messages
    errorMessage.value = ''

    // Redirect to dashboard
    router.push('/dashboard')
  } catch (error) {
    loading.value = false
    if (error.response) {
      errorMessage.value = error.response.data.detail || 'Login failed'
    } else {
      errorMessage.value = 'An error occurred while trying to log in'
    }
    console.error('Login error:', error)
  }
}

const goToSignUp = () => {
  router.push('/signup')
}
</script>
