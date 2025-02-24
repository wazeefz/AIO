<template>
  <v-navigation-drawer
    app
    expand-on-hover
    rail
    ref="navDrawer"
    @mouseenter="isRail = false"
    @mouseleave="isRail = true"
    class="bg-primaryBrown border-0"
  >
    <v-list>
      <v-list-item
        :prepend-avatar="userAvatar"
        :title="userName"
        :subtitle="userEmail"
      >
        <template v-slot:prepend>
          <v-avatar v-if="!userAvatar" color="secondaryBrown" size="32">
            <span class="text-h6 white--text">{{ userInitial }}</span>
          </v-avatar>
        </template>
      </v-list-item>
    </v-list>

    <v-divider class="bg-primaryBrown mx-2"></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.value"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        active-class="active-link"
      ></v-list-item>
    </v-list>

    <!-- Pushes logout button to the bottom -->
    <template v-slot:append>
      <div class="ma-4">
        <div class="d-flex justify-center" v-if="!isRail">
          <img
            src="/public/AIO-Logo.png"
            alt="Company Logo"
            class="my-4"
            width="150"
          />
        </div>

        <v-btn
          class="bg-secondaryBrown"
          block
          :prepend-icon="!isRail ? 'mdi-logout' : ''"
          @click="logout"
        >
          <v-icon v-if="isRail">mdi-logout</v-icon>
          <span v-if="!isRail">Logout</span>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isRail = ref(true)

// Retrieve user data from localStorage
const user = ref(JSON.parse(localStorage.getItem('user')) || {})

// Extract user details
const userName = computed(() => user.value?.name || 'Guest User')
const userEmail = computed(() => user.value?.email || 'guest@example.com')
const userAvatar = computed(() => user.value?.avatar || null)

// Get first letter of the first name
const userInitial = computed(() => {
  return user.value?.name ? user.value.name.charAt(0).toUpperCase() : '?'
})

// Define the menu items with their routes
const menuItems = ref([
  {
    title: 'Dashboard',
    icon: 'mdi-home-circle',
    to: '/dashboard',
    value: 'dashboard',
  },
  { title: 'AIO Prompt', icon: 'mdi-pencil', to: '/prompt', value: 'prompt' },
  {
    title: 'Projects',
    icon: 'mdi-briefcase-outline',
    to: '/projects',
    value: 'projects',
  },
  {
    title: 'Upload CV',
    icon: 'mdi-file-outline',
    to: '/upload-cv',
    value: 'uploadCV',
  },
])

const logout = () => {
  console.log('Logging out...')

  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')

  // Redirect using Vue Router
  router.push('/login')
}
</script>

<style scoped>
/* Active class styling */
.active-link {
  background-color: #b1a184 !important;
  border-radius: 6px;
  color: white !important;
}
</style>
