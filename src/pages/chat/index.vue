<template>
  <div class="chat-container">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="startNewChat">
          <span class="icon">+</span> New Chat
        </button>
        <button class="collapse-btn" @click="toggleSidebar">
          {{ isSidebarCollapsed ? '→' : '←' }}
        </button>
      </div>

      <div class="chat-history">
        <div
          v-for="chat in chatHistory"
          :key="chat.id"
          :class="['chat-item', { active: currentChat.id === chat.id }]"
          @click="loadChat(chat)"
        >
          <span class="chat-title">{{ chat.title }}</span>
          <button class="delete-chat" @click.stop="deleteChat(chat.id)">
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Main Chat Area -->
    <div class="main-content">
      <!-- Chat Messages -->
      <div class="messages" ref="messagesContainer">
        <div
          v-for="(message, index) in currentChat.messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="message-content">
            <div class="avatar">
              {{ message.role === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="text">
              <div v-html="formatMessage(message.content)"></div>
            </div>
            <div class="actions">
              <button @click="copyMessage(message.content)">Copy</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <div class="input-container">
          <textarea
            v-model="newMessage"
            @keydown.enter.prevent="sendMessage"
            placeholder="Type a message..."
            rows="1"
            ref="messageInput"
          ></textarea>
          <button
            class="send-btn"
            @click="sendMessage"
            :disabled="isLoading || !newMessage.trim()"
          >
            {{ isLoading ? '...' : '→' }}
          </button>
        </div>
        <div class="disclaimer">
          CapyBarai may produce inaccurate information.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default {
  name: 'ChatGPT',
  data() {
    return {
      isSidebarCollapsed: false,
      chatHistory: [],
      currentChat: {
        id: null,
        title: '',
        messages: [],
      },
      newMessage: '',
      isLoading: false,
    }
  },
  methods: {
    async sendMessage() {
      if (!this.newMessage.trim() || this.isLoading) return

      const userMessage = this.newMessage.trim()
      this.newMessage = ''

      // Add user message
      this.currentChat.messages.push({
        role: 'user',
        content: userMessage,
      })

      // If this is the first message, create a title
      if (this.currentChat.messages.length === 1) {
        this.currentChat.title = userMessage.slice(0, 30) + '...'
      }

      this.isLoading = true

      try {
        // Simulate API call to ChatGPT
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Add AI response
        this.currentChat.messages.push({
          role: 'assistant',
          content: `This is a simulated response to: "${userMessage}"`,
        })

        // Save chat to history if it's new
        if (!this.currentChat.id) {
          this.currentChat.id = Date.now()
          this.chatHistory.unshift({ ...this.currentChat })
        } else {
          // Update existing chat in history
          const index = this.chatHistory.findIndex(
            (chat) => chat.id === this.currentChat.id
          )
          if (index !== -1) {
            this.chatHistory[index] = { ...this.currentChat }
          }
        }

        this.scrollToBottom()
      } catch (error) {
        console.error('Error:', error)
        // Handle error
      } finally {
        this.isLoading = false
      }
    },
    startNewChat() {
      this.currentChat = {
        id: null,
        title: '',
        messages: [],
      }
      this.$refs.messageInput.focus()
    },
    loadChat(chat) {
      this.currentChat = { ...chat }
    },
    deleteChat(chatId) {
      this.chatHistory = this.chatHistory.filter((chat) => chat.id !== chatId)
      if (this.currentChat.id === chatId) {
        this.startNewChat()
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },
    formatMessage(content) {
      // Convert markdown to HTML and sanitize
      return DOMPurify.sanitize(marked(content))
    },
    copyMessage(content) {
      navigator.clipboard.writeText(content)
      // Could add a toast notification here
    },
    scrollToBottom() {
      setTimeout(() => {
        const container = this.$refs.messagesContainer
        container.scrollTop = container.scrollHeight
      }, 100)
    },
  },
  mounted() {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      this.chatHistory = JSON.parse(savedHistory)
      if (this.chatHistory.length > 0) {
        this.currentChat = { ...this.chatHistory[0] }
      }
    }
  },
  watch: {
    chatHistory: {
      deep: true,
      handler(newHistory) {
        // Save to localStorage
        localStorage.setItem('chatHistory', JSON.stringify(newHistory))
      },
    },
  },
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
}

.sidebar {
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
}

.new-chat-btn {
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
}

.collapse-btn {
  padding: 10px;
  background: none;
  border: 1px solid #e5e5e5;
  border-radius: 5px;
  cursor: pointer;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.chat-item {
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
}

.delete-chat {
  opacity: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  color: #666;
}

.chat-item:hover .delete-chat {
  opacity: 1;
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

textarea {
  flex: 1;
  border: none;
  resize: none;
  padding: 5px;
  font-family: inherit;
  font-size: inherit;
  outline: none;
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

/* Add responsive styles */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    height: 100%;
    z-index: 1000;
  }

  .main-content {
    max-width: 100%;
  }
}
</style>
