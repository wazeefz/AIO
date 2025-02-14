<template>
  <v-btn
    v-if="isEditing"
    icon="mdi-plus"
    :variant="variant"
    class="cutom-btn"
    size="small"
    :color="color"
    @click="handleClick"
  >
  </v-btn>

  <!-- <button class="new-chat-btn" @click="$emit('new-chat')">
    <span class="icon">+</span> New Chat
  </button> -->
</template>

<script setup>
const props = defineProps({
  isEditing: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'green',
  },
  variant: {
    type: String,
    default: 'text',
  },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.custom-btn {
  background: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.custom-btn::before {
  display: none !important;
}
</style>
