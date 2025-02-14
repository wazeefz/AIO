<!-- Prompt Page by default -->

<template>
  <div class="chat-container">
    <ChatSidebar
      :chat-history="chatHistory"
      :current-chat-id="currentChat.id"
      :is-sidebar-collapsed="isSidebarCollapsed"
      @new-chat="startNewChat"
      @load-chat="loadChat"
      @delete-chat="deleteChat"
      @toggle-sidebar="toggleSidebar"
    />

    <div class="main-content">
      <div
        class="messages d-lg-flex lg-justify-space-evenly lg-align-center"
        ref="messagesContainer"
      >
        <transition name="fade" mode="out-in">
          <div v-if="currentChat.messages.length === 0" key="default">
            <PromptPageDefault />
          </div>
          <div v-else key="message">
            <ChatMessage
              v-for="(message, index) in currentChat.messages"
              :key="index"
              :message="message"
            />
          </div>
        </transition>
      </div>

      <ChatInput ref="chatInput" :is-loading="isLoading" @send="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatSidebar from '@/components//items/ChatSidebar.vue'
import ChatMessage from '@/components/items/ChatMessage.vue'
import ChatInput from '@/components/items/ChatInput.vue'
import PromptPageDefault from '@/components/PromptPageDefault.vue'

const {
  chatHistory,
  currentChat,
  isLoading,
  startNewChat,
  loadChat,
  deleteChat,
  sendMessage,
  loadSavedHistory,
} = useChat()

const messagesContainer = ref(null)

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
}

watch(() => currentChat.value.messages, scrollToBottom, { deep: true })

onMounted(() => {
  loadSavedHistory()
})

const handleSearch = (query) => {
  // Filter your chat history based on the query
  // This is just an example implementation
  filteredChatHistory.value = chatHistory.value.filter((chat) =>
    chat.title.toLowerCase().includes(query.toLowerCase())
  )
}
</script>

<style>
.chat-container {
  display: flex;
  justify-content: space-evenly;
  height: 100vh;
  background-color: #ffffff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 260px);
}

.messages {
  flex: 1;
  overflow-y: auto;
  justify-content: center;
  padding: 20px;
  display: flex;
  flex-direction: column-reverse;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
