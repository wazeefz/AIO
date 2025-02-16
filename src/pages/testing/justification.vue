<template>
  <v-card class="elevation-0">
    <DashboardJustification />
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

import DashboardJustification from '@/components/items/JustificationCards.vue'

const tab = ref('one')
</script>
