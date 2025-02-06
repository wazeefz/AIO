import { ref, watch, onMounted } from 'vue'

export function useChat() {
  const chatHistory = ref([])
  const currentChat = ref({
    id: null,
    title: '',
    messages: [],
  })
  const isLoading = ref(false)

  // Load chat history from localStorage
  const loadSavedHistory = () => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      try {
        chatHistory.value = JSON.parse(savedHistory)
        if (chatHistory.value.length > 0) {
          currentChat.value = JSON.parse(JSON.stringify(chatHistory.value[0]))
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
        chatHistory.value = []
      }
    }
  }

  // Watch for changes and save to localStorage
  watch(
    () => JSON.parse(JSON.stringify(chatHistory.value)),
    (newHistory) => {
      localStorage.setItem('chatHistory', JSON.stringify(newHistory))
    },
    { deep: true }
  )

  const startNewChat = () => {
    currentChat.value = {
      id: Date.now(),
      title: '',
      messages: [],
    }
  }

  const loadChat = (chat) => {
    currentChat.value = JSON.parse(JSON.stringify(chat))
  }

  const deleteChat = (chatId) => {
    chatHistory.value = chatHistory.value.filter((chat) => chat.id !== chatId)
    if (currentChat.value.id === chatId) {
      startNewChat()
    }
  }

  const updateChatHistory = () => {
    const index = chatHistory.value.findIndex(
      (chat) => chat.id === currentChat.value.id
    )
    const chatToUpdate = JSON.parse(JSON.stringify(currentChat.value))

    if (index !== -1) {
      chatHistory.value[index] = chatToUpdate
    } else {
      chatHistory.value.unshift(chatToUpdate)
    }
  }

  const sendMessage = async (message) => {
    if (!message.trim() || isLoading.value) return

    // Add user message
    currentChat.value.messages.push({
      role: 'user',
      content: message,
    })

    // Set title if first message
    if (currentChat.value.messages.length === 1) {
      currentChat.value.title = message.slice(0, 30) + '...'
    }

    isLoading.value = true

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add AI response
      currentChat.value.messages.push({
        role: 'assistant',
        content: `This is a simulated response to: "${message}"`,
      })

      // Update chat history
      updateChatHistory()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Load saved history when component is mounted
  onMounted(() => {
    loadSavedHistory()
  })

  return {
    chatHistory,
    currentChat,
    isLoading,
    startNewChat,
    loadChat,
    deleteChat,
    sendMessage,
    loadSavedHistory,
  }
}
