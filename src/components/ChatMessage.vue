<!-- <template>
  <div :class="['message', message.role]">
    <div class="message-content">
      <template v-if="message.role === 'assistant'">
        <div class="avatar">🤖</div>
      </template>
      <div class="text">
        <div v-html="formattedContent"></div>
      </div>
      <template v-if="message.role === 'user'">
        <div class="avatar">👤</div>
      </template>
      <div class="actions">
        <button @click="copyMessage">Copy</button>
      </div>
    </div>
  </div>
</template> -->

<template>
  <div :class="['message', message.sender]">
    <div class="message-content">
      <template v-if="message.sender === 'assistant'">
        <div class="avatar">🤖</div>
      </template>
      <div class="text">
        <div v-html="formattedContent"></div>
        <!-- Added sources display -->
        <div v-if="message.sources && message.sources.length" class="sources">
          <span class="sources-label">Sources:</span>
          <span class="sources-list">{{ message.sources.join(', ') }}</span>
        </div>
      </div>
      <template v-if="message.sender === 'user'">
        <div class="avatar">👤</div>
      </template>
      <div class="actions">
        <button @click="copyMessage" class="copy-button">
          <span class="copy-icon">📋</span>
          <span class="copy-text">Copy</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  message: Object,
})

const formattedContent = computed(() => {
  return DOMPurify.sanitize(marked(props.message.message_text))
})

const copyMessage = () => {
  navigator.clipboard.writeText(props.message.message_text)
}
</script>

<style scoped>
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message {
  display: flex;
  padding: 10px;
  margin: 10px;
  border-radius: 15px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  background-color: #b1a184;
  color: white;
  margin-left: auto;
  max-width: 70%;
  animation: slideFromRight 0.5s ease-in-out;
}

.message.assistant {
  background-color: #b1a184;
  color: white;
  margin-right: auto;
  max-width: 70%;
  animation: slideFromLeft 0.5s ease-in-out;
}

@keyframes slideFromRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideFromLeft {
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.message-content {
  display: flex;
  gap: 15px;
  width: 100%;
  align-items: flex-start;
}

.text {
  flex: 1;
  line-height: 1.6;
  padding: 0 10px;
}

.message.user .text {
  text-align: right;
}

.message.assistant .text {
  text-align: left;
}

.actions {
  opacity: 0;
  transition: opacity 0.2s;
  position: absolute;
  bottom: -25px;
  right: 10px;
}

.message:hover .actions {
  opacity: 1;
}

.actions button {
  background: transparent;
  border: 1px solid #666;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.3s ease;
}

.actions button:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.text :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

/* Additional styling for better readability */
.text :deep(p) {
  margin: 0;
}

.message {
  position: relative;
  margin-bottom: 30px;
}

/* Add hover effect to messages */
.message:hover {
  transform: scale(1.01);
  transition: transform 0.2s ease;
}
</style>
