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
        prepend-avatar="/mock/marcus.png"
        subtitle="marcus@gmail.com"
        title="Marcus Rashford"
      ></v-list-item>
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
      <div class="">
        <img src="/public/vector.png" alt="Company Logo" class="" width="270" />
      </div>
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
import { ref } from 'vue'

const isRail = ref(true)

// Define the menu items with their routes
const menuItems = ref([
  {
    title: 'Dashboard',
    icon: 'mdi-home-circle',
    to: '/dashboard',
    value: 'dashboard',
  },
  {
    title: 'AIO Prompt',
    icon: 'mdi-pencil',
    to: '/prompt',
    value: 'prompt',
  },
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
  // Add your logout logic here (e.g., clear tokens, redirect, etc.)
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
