<template>
  <PromptPageDefault />
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
      <div class="messages" ref="messagesContainer">
        <ChatMessage
          v-for="(message, index) in currentChat.messages"
          :key="index"
          :message="message"
        />
      </div>

      <ChatInput ref="chatInput" :is-loading="isLoading" @send="sendMessage" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { useSidebar } from '@/composables/useSidebar'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
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

const { isSidebarCollapsed, toggleSidebar } = useSidebar()

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
</script>

<style>
.chat-container {
  display: flex;
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

/* .sidebar {
  width: 260px;
  background-color: #eae3d6;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar-collapsed {
  width: 0;
  overflow: hidden;
}

.sidebar-header {
  padding: 10px;
  display: flex;
  gap: 10px;
} */

/* .new-chat-btn {
  flex: 1;
  padding: 10px;
  background-color: #b1a184;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
} */

/* .collapse-btn {
  padding: 10px;
  background: none;
  border: 1px solid #e5e5e5;
  border-radius: 5px;
  cursor: pointer;
} */

/* .chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
} */

/* .chat-item {
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-item:hover {
  background-color: #ececf1;
}

.chat-item.active {
  background-color: #e5e5e5;
} */

/* .delete-chat {
  opacity: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
}

.chat-item:hover .delete-chat {
  opacity: 1;
} */

/* .text {
  flex: 1;
  line-height: 1.6;
}

.actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .actions {
  opacity: 1;
} */

/* .input-area {
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
} */

/* textarea {
  flex: 1;
  border: none;
  resize: none;
  padding: 5px;
  font-family: inherit;
  font-size: inherit;
  outline: none;
} */

/* .send-btn {
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
} */

/* Add responsive styles
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    height: 100%;
    z-index: 1000;
  }

  .main-content {
    max-width: 100%;
  }
} */
</style>
