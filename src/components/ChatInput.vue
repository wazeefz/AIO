<template>
  <div class="input-area">
    <div class="input-container">
      <textarea
        v-model="message"
        @keydown.enter.prevent="sendMessage"
        placeholder="Type a message..."
        rows="1"
        ref="messageInput"
      ></textarea>
      <button
        class="send-btn"
        @click="sendMessage"
        :disabled="isLoading || !message.trim()"
      >
        {{ isLoading ? '...' : '→' }}
      </button>
    </div>
    <div class="disclaimer">CapyBarai may produce inaccurate information.</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isLoading: Boolean,
})

const emit = defineEmits(['send'])
const message = ref('')
const messageInput = ref(null)

const sendMessage = () => {
  if (!message.value.trim() || props.isLoading) return
  emit('send', message.value)
  message.value = ''
}

defineExpose({ messageInput })
</script>

<style scoped>
/* Copy relevant styles from original CSS */
</style>
