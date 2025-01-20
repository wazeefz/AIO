<template>
  <div>
    <v-chip
      v-for="(chip, index) in chips"
      :key="chip.label + chip.category"
      :color="chip.color || 'primary'"
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
  },
  methods: {
    removeChip(chip) {
      // Emit the entire chip object instead of just the index
      this.$emit('remove-chip', chip)
    },
  },
}
</script>
