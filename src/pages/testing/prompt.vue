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
          <!-- This is the prompt card by default -->
          <div v-if="currentChat.messages.length === 0" key="default">
            <!-- <PromptPageDefault /> component has been removed and included down here -->
            <div
              class="d-flex flex-column align-center justify-center fill-height"
            >
              <div class="d-flex flex-column align-center justify-center mb-10">
                <p class="text-h3 font-weight-medium">All in One</p>
                <p class="font-weight-regular">How can we help you today?</p>
              </div>
              <div class="d-flex flex-row align-center justify-center ga-2">
                <div
                  v-for="(item, index) in cards"
                  :key="index"
                  class="d-flex justify-center align-center flex-column w-30"
                >
                  <p
                    class="text-secondaryBlack font-weight-medium text-h6 mb-4"
                  >
                    {{ item.title }}
                  </p>
                  <v-card
                    :text="item.text"
                    rounded="xl"
                    class="text-white bg-secondaryBrown d-flex align-center text-center"
                    max-width="300"
                    height="100"
                  />
                </div>
              </div>
            </div>
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

<script>
// the text for prompt card
export default {
  data() {
    return {
      cards: [
        {
          title: 'Examples',
          text: '"Help me assemble a team for a React native project"',
        },
        {
          title: 'Capabilities',
          text: 'Recommend the most optimized team for your projects including your internal and external resources',
        },
        {
          title: 'Limitations',
          text: 'May miss over other key talents due to unclear input',
        },
      ],
    }
  },
}
</script>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import ChatSidebar from '@/components//items/ChatSidebar.vue'
import ChatMessage from '@/components/items/ChatMessage.vue'
import ChatInput from '@/components/items/ChatInput.vue'
// import PromptPageDefault from '@/components/PromptPageDefault.vue'

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
