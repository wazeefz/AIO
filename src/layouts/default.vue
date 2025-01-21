<template>
  <v-main>
    <div>
      <!-- Sidebar Section -->
      <SideNav />

      <!-- Main Content Section -->
      <div class="content w-100">
        <v-container height="100%" width="100%">
          <router-view />
        </v-container>
      </div>
    </div>
  </v-main>
</template>

<script setup>
import SideNav from '@/components/SideNav.vue'
</script>

<style scoped>
.content {
  height: 100vh;
}
</style>
