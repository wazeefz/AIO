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
        <svg
          v-if="!isLoading"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
        <span v-else>...</span>
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
  padding: 8px 12px; /* Adjusted padding */
  font-family: inherit;
  font-size: inherit;
  outline: none;
  border-radius: 20px; /* Added border-radius */
}

.input-area {
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
  border-radius: 25px; /* Increased border-radius */
  padding: 8px 12px; /* Adjusted padding */
  align-items: center; /* Added to vertically center items */
}

.send-btn {
  background-color: #c3a67e;
  color: #ffeed6;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  min-width: 36px;
  font-size: 1.2em; /* Adjusted font size for better arrow appearance */
  transform: translateY(
    -1px
  ); /* Optional: slight adjustment to vertically center the arrow better */
}

.send-btn:disabled {
  background-color: #c3a67e;
  cursor: not-allowed;
}

.disclaimer {
  text-align: center;
  color: #666;
  font-size: 0.8em;
  margin-top: 10px;
}
</style>
