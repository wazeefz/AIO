<template>
  <div :class="['message', message.role]">
    <div class="message-content">
      <div class="avatar">
        {{ message.role === 'user' ? '👤' : '🤖' }}
      </div>
      <div class="text">
        <div v-html="formattedContent"></div>
      </div>
      <div class="actions">
        <button @click="copyMessage">Copy</button>
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
  return DOMPurify.sanitize(marked(props.message.content))
})

const copyMessage = () => {
  navigator.clipboard.writeText(props.message.content)
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
}

.message.user {
  background-color: #f7f7f8;
}

.message.assistant {
  background-color: #ffffff;
}

.message-content {
  display: flex;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.avatar {
  font-size: 1.5em;
  width: 30px;
}

.text {
  flex: 1;
  line-height: 1.6;
}

.actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .actions {
  opacity: 1;
}
</style>
