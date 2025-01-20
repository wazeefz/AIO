<template>
  <v-main>
    <div class="d-flex">
      <!-- Sidebar Section -->
      <SideNav />

      <!-- Main Content Section -->
      <div class="content w-100">
        <router-view />
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
