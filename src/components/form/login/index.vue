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

          <!-- Password field (for display only) -->
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            required
            disabled
          ></v-text-field>

          <v-btn
            :loading="loading"
            type="submit"
            color="primaryBrown"
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
          <v-btn variant="text" color="secondaryBrown" @click="goToSignUp">
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
import { useAuth } from '@/composables/useAuth' // Import composable

const { login } = useAuth() // Remove unused `error`
const email = ref('')
const password = ref('') // This is just for display
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()

const submitLogin = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    console.log('email', email.value)
    const response = await login(email.value) // Pass email as string, not object

    if (!response || !response.name) {
      throw new Error('Invalid response from server')
    }

    localStorage.setItem('user', JSON.stringify(response)) // Store user properly
    localStorage.setItem('isAuthenticated', 'true')

    router.push('/dashboard') // Redirect after login
  } catch (err) {
    errorMessage.value = err.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

const goToSignUp = () => {
  router.push('/signup') // Navigate to signup page
}
</script>
