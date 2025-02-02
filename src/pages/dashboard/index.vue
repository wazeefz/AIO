<template>
  <v-card class="elevation-0">
    <v-tabs v-model="tab" class="bg-white elevation-0">
      <v-tab value="overview">Overview</v-tab>
      <v-tab value="team">Team</v-tab>
      <v-tab value="justification">Justification</v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="overview">
          <DashboardOverview />
        </v-tabs-window-item>

        <v-tabs-window-item value="team"> Team </v-tabs-window-item>

        <v-tabs-window-item value="justification">
          <DashboardJustification />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import DashboardOverview from '@/components/DashboardOverview.vue'
import DashboardJustification from '@/components/DashboardJustification.vue'

const tab = ref('one')
</script>
