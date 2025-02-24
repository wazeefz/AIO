<template>
  <v-layout>
    <!-- Conditionally render Sidebar only if not on login/signup pages -->
    <SideNav2 v-if="!isLoginPage && !isSignUpPage" />

    <!-- Main Content Section -->
    <v-main class="d-flex">
      <v-container fluid class="px-2 py-2">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SideNav2 from '@/components/layout/SideNav2.vue'

// Define reactive variables for checking the route
const isLoginPage = ref(false)
const isSignUpPage = ref(false)

// Get the current route
const route = useRoute()

// Update the login and signup page status whenever the route changes
watch(
  () => route.name,
  (newRouteName) => {
    isLoginPage.value = newRouteName === '/login/' // Adjust with your actual login route name
    isSignUpPage.value = newRouteName === '/signup/' // Adjust with your actual signup route name
  }
)

// Initial check on mounted
onMounted(() => {
  isLoginPage.value = route.name === '/login/' // Adjust with your actual login route name
  isSignUpPage.value = route.name === '/signup/' // Adjust with your actual signup route name
})

console.log('isLoginPage', isLoginPage.value)
console.log('isSignUpPage', isSignUpPage.value)
console.log('route', route.name)
</script>

<style scoped>
.content {
  height: 100vh;
  width: 100%;
}
</style>
