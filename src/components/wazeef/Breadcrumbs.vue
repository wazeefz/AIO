<template>
  <v-breadcrumbs class="bg-secondaryBrown mb-3 rounded-m">
    <v-breadcrumbs-item
      v-for="(crumb, index) in breadcrumbs"
      :key="index"
      :to="crumb.to"
      class="text-white"
    >
      {{ crumb.text.toUpperCase() }}
    </v-breadcrumbs-item>
  </v-breadcrumbs>
</template>

<script>
export default {
  computed: {
    currentPath() {
      return this.$route.path // Full path
    },
    breadcrumbs() {
      // Split the current path into segments
      const segments = this.currentPath.split('/').filter((segment) => segment)

      // Create breadcrumb objects starting from the first segment
      return segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/')
        return {
          text: segment, // Use the segment as the label
          to: path,
        }
      })
    },
  },
}
</script>

<style scoped>
/* Optional: Adjust breadcrumb styles */
</style>
