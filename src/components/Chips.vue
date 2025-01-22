<template>
  <div>
    <v-chip
      v-for="(chip, index) in chips"
      :key="chip.label + chip.category"
      :color="getChipColor(chip)"
      :closable="closable"
      :class="['ma-1', chipClass]"
      @click:close="removeChip(chip)"
    >
      <v-icon v-if="chip.icon" start>{{ chip.icon }}</v-icon>
      {{ chip.label }}
    </v-chip>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { getColorForCategory } from '@/utils/colorMappingChips.js'

const props = defineProps({
  chips: {
    type: Array,
    required: true,
    default: () => [],
  },
  closable: {
    type: Boolean,
    default: false,
  },
  chipClass: {
    type: String,
    default: '',
  },
  useColorMapping: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['remove-chip'])

const getChipColor = (chip) => {
  if (props.useColorMapping && chip.category) {
    return getColorForCategory(chip.category)
  }
  return chip.color || 'primary'
}
</script>
