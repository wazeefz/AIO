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

<script>
import { getColorForCategory } from '@/utils/colorMappingChips.js'

export default {
  name: 'BaseChips',
  props: {
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
  },
  methods: {
    removeChip(chip) {
      this.$emit('remove-chip', chip)
    },
    getChipColor(chip) {
      if (this.useColorMapping && chip.category) {
        return getColorForCategory(chip.category)
      }
      return chip.color || 'primary'
    },
  },
}
</script>
