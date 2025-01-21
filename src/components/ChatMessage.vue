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
/* Copy relevant styles from original CSS */
</style>
