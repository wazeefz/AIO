<template>
  <v-app>
    <v-main>
      <v-container>
        <ProjectTable />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import ProjectTable from '@/components/ProjectTable.vue'

export default {
  name: 'App',
  components: {
    ProjectTable,
  },
}
</script>
