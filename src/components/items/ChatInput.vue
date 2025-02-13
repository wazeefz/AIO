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
textarea {
  flex: 1;
  border: none;
  resize: none;
  padding: 5px;
  font-family: inherit;
  font-size: inherit;
  outline: none;
}

.input-area {
  border-top: 1px solid #e5e5e5;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.input-container {
  display: flex;
  gap: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  padding: 10px;
}

.send-btn {
  background-color: #b1a184;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 15px;
  cursor: pointer;
}

.send-btn:disabled {
  background-color: #eae3d6;
  cursor: not-allowed;
}

.disclaimer {
  text-align: center;
  color: #666;
  font-size: 0.8em;
  margin-top: 10px;
}
</style>
