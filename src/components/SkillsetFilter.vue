<template>
  <v-container class="pa-0">
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      label="Search"
      hide-details
      density="compact"
      class="mb-4"
      clearable
      @click:clear="clearSearch"
    ></v-text-field>
    <v-chip-group>
      <v-chip
        v-for="skill in selectedSkills"
        :key="skill"
        closable
        color="error"
        @click:close="removeSkill(skill)"
      >
        {{ skill }}
      </v-chip>
    </v-chip-group>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'

const searchQuery = ref('')
const selectedSkills = ref([
  'Javascript',
  'HTML',
  'CSS',
  'Bootstrap',
  'Adobe Photoshop',
])

const emit = defineEmits(['update:skills'])

const removeSkill = (skill) => {
  selectedSkills.value = selectedSkills.value.filter((s) => s !== skill)
  emit('update:skills', selectedSkills.value)
}

const clearSearch = () => {
  searchQuery.value = ''
}

watch(selectedSkills, (newValue) => {
  emit('update:skills', newValue)
})
</script>
