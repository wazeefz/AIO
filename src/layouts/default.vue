<template>
  <v-layout>
    <!-- Sidebar Section -->
    <SideNav2 />

    <!-- Main Content Section -->
    <v-main class="content">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup>
import SideNav2 from '@/components/layout/SideNav2.vue'
</script>

<style scoped>
.content {
  height: 100vh;
  width: 100%;
}
</style>
