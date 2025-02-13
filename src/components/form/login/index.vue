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

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()

const submitLogin = () => {
  // Store name and set isAuthenticated to true in localStorage
  localStorage.setItem('name', email.value) // You can store email as 'name' if that's intended
  localStorage.setItem('isAuthenticated', true)

  // Redirect user after login
  router.push('/dashboard')
}

const goToSignUp = () => {
  router.push('/signup') // Navigate to the signup page
}
</script>
