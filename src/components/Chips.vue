<template>
  <div>
    <template v-for="(chip, index) in chips" :key="chip.label + chip.category">
      <!-- Default slot with fallback -->
      <slot
        name="chip"
        :chip="chip"
        :color="getChipColor(chip)"
        :remove="() => removeChip(chip)"
        :index="index"
      >
        <v-chip
          :color="getChipColor(chip)"
          :closable="closable"
          :class="['ma-1', chipClass]"
          @click:close="removeChip(chip)"
        >
          <slot name="prefix" :chip="chip">
            <v-icon v-if="chip.icon" start>{{ chip.icon }}</v-icon>
          </slot>

          <slot name="label" :chip="chip">
            {{ chip.label }}
          </slot>

          <slot name="suffix" :chip="chip"></slot>
        </v-chip>
      </slot>
    </template>
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
