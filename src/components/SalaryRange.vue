<template>
  <v-row>
    <v-col cols="6">
      <v-text-field
        v-model="minSalary"
        label="RM"
        type="number"
        min="0"
        hide-details
        density="compact"
        class="salary-input"
      ></v-text-field>
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="maxSalary"
        label="RM"
        type="number"
        min="0"
        hide-details
        density="compact"
        class="salary-input"
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch } from 'vue'

const minSalary = ref(6000)
const maxSalary = ref(20000)

const emit = defineEmits(['update:range'])

watch([minSalary, maxSalary], ([newMin, newMax]) => {
  emit('update:range', { min: newMin, max: newMax })
})
</script>
