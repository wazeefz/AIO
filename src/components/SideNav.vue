<!-- components/SideNav.vue -->
<template>
  <v-navigation-drawer
    permanent
    color="#F5F0E9"
    width="350"
    class="border-none"
  >
    <div class="d-flex flex-column align-center justify-center fill-height">
      <!-- Logo Section -->
      <div class="d-flex justify-center pa-4 w-100">
        <v-img
          src="/AIO-Logo.png"
          alt="AIO Logo"
          max-width="200"
          class="rounded-lg"
        />
      </div>

      <!-- Navigation Links -->
      <div class="w-100">
        <v-list nav class="px-2 d-flex-column">
          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            :to="item.to"
            :prepend-icon="item.icon"
            class="mb-2 rounded-xl px-6"
            color="#B1A184"
          >
            <v-list-item-title class="text-subtitle-1">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'SideNav',
  data() {
    return {
      menuItems: [
        {
          title: 'Dashboard',
          icon: 'mdi-home',
          to: '/dashboard',
        },
        {
          title: 'AIO Prompt',
          icon: 'mdi-pencil',
          to: '/prompt',
        },
        {
          title: 'Project',
          icon: 'mdi-briefcase',
          to: '/project',
        },
        {
          title: 'Upload CV',
          icon: 'mdi-file-document-outline',
          to: '/upload-cv',
        },
      ],
    }
  },
}
</script>

<style scoped>
.v-list-item {
  min-height: 45px !important;
}

/* Hover effect for non-active items */
.v-list-item:not(.active-item):hover {
  background-color: rgba(180, 168, 155, 0.1) !important;
}

/* Custom text color for non-active items */
.v-list-item:not(.active-item) .v-list-item-title,
.v-list-item:not(.active-item) .v-icon {
  color: #5d7285 !important;
}
</style>
