<template>
  <Combobox
    title="Project Management"
    v-model="selectedProjectId"
    :items="projectItems"
    label="Select Project"
    item-title="title"
    item-value="id"
    variant="outlined"
    :chips="true"
    clearable
    filterType="project"
    @update:model-value="handleProjectChange"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProjectStore } from '@/stores/projectStore'
import { useFilterStore } from '@/stores/filterStore'
import Combobox from '../items/Combobox.vue'

const projectStore = useProjectStore()
const filterStore = useFilterStore()

const selectedProjectId = ref(null)

const projectItems = computed(() =>
  projectStore.projects.map((project) => ({
    title: project.projectName,
    id: project.id,
  }))
)

const handleProjectChange = (projectId) => {
  projectStore.setCurrentProject(projectId)
  filterStore.clearFilters() // Clear filters when project changes
}

onMounted(() => {
  if (projectItems.value.length > 0) {
    selectedProjectId.value = projectItems.value[0].id
    handleProjectChange(selectedProjectId.value)
  }
})
</script>
