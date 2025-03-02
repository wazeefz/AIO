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
              v-for="message in currentChat.messages"
              :key="message.message_id"
              :message="message"
              :is-loading="
                isLoading &&
                message.sender === 'assistant' &&
                !message.message_text
              "
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
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import PromptPageDefault from '@/components/PromptPageDefault.vue'

const userId = ref(1) // Get this from your user state/store
const {
  chatHistory,
  currentChat,
  isLoading,
  startNewChat,
  loadChat,
  deleteChat,
  sendMessage,
} = useChat(userId.value)

const messagesContainer = ref(null)

// Scroll to bottom when messages change
watch(
  () => currentChat.value.messages,
  () => {
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }, 100)
  },
  { deep: true }
)
</script>

<style>
/* .chat-container {
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
} */

.chat-container {
  display: flex;
  height: 100vh; /* Full viewport height */
  background-color: #ffffff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 260px); /* Adjust based on sidebar width */
  height: 100%; /* Take full height */
}

.messages {
  flex: 1; /* Take remaining space */
  overflow-y: auto; /* Enable scrolling */
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Ensure messages align properly */
.message {
  display: flex;
  padding: 10px;
  max-width: 800px; /* Limit message width for readability */
  margin: 0 auto; /* Center messages */
  width: 100%; /* Take full width of container */
}

.message.user {
  background-color: #f7f7f8;
  border-radius: 15px 15px 0 15px; /* Rounded corners for user messages */
}

.message.assistant {
  background-color: #ffffff;
  border-radius: 15px 15px 15px 0; /* Rounded corners for assistant messages */
}

.message-content {
  display: flex;
  gap: 15px;
  width: 100%; /* Take full width */
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
