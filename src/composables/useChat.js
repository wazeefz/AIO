import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

export function useChat(userId) {
  const chatHistory = ref([])
  const currentChat = ref({ id: null, messages: [], title: '' })
  const isLoading = ref(false)

  // Load user's chats
  const loadUserChats = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/chat/${userId}`)
      chatHistory.value = response.data
    } catch (error) {
      console.error('Error loading user chats:', error)
    }
  }

  // Start a new chat
  const startNewChat = async () => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/chat/${userId}`)
      currentChat.value = {
        id: response.data.conversation_id,
        messages: [],
        title: response.data.title,
      }
      await loadUserChats()
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  // Load a specific chat
  const loadChat = async (chat) => {
    try {
      // Get messages for this chat
      const messagesResponse = await axios.get(
        `http://127.0.0.1:8000/chat/${userId}/${chat.conversation_id}/messages`
      )

      currentChat.value = {
        id: chat.conversation_id,
        title: chat.title,
        messages: messagesResponse.data,
      }
    } catch (error) {
      console.error('Error loading chat:', error)
    }
  }

  const sendMessage = async (content) => {
    if (!currentChat.value.id) {
      await startNewChat()
    }

    isLoading.value = true
    try {
      // Send user message
      const userMessage = await axios.post(
        `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message`,
        {
          content,
          role: 'user',
        }
      )
      currentChat.value.messages.push(userMessage.data)

      // Get AI response using PDF QA system
      const qaResponse = await axios.get(
        `http://127.0.0.1:8000/ask-question/`,
        {
          params: {
            question: content,
          },
        }
      )

      // Send AI response to chat
      const aiMessage = await axios.post(
        `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message`,
        {
          content: qaResponse.data.answer,
          role: 'assistant',
          sources: qaResponse.data.sources,
        }
      )

      // Add the AI message to current chat
      currentChat.value.messages.push({
        ...aiMessage.data,
        content: qaResponse.data.answer,
        sources: qaResponse.data.sources,
      })

      // Reload chat list to update titles and order
      await loadUserChats()
    } catch (error) {
      console.error('Error sending message:', error)
      currentChat.value.messages.push({
        role: 'system',
        content: 'Error: Unable to process your message. Please try again.',
      })
    } finally {
      isLoading.value = false
    }
  }

  // Delete a chat
  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/chat/${userId}/${chatId}`)
      await loadUserChats() // Reload chat list after deletion

      if (currentChat.value.id === chatId) {
        currentChat.value = { id: null, messages: [], title: '' }
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  // Delete all chat history
  const deleteChatHistory = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/chat/history/${userId}`)
      chatHistory.value = []
      currentChat.value = { id: null, messages: [], title: '' }
    } catch (error) {
      console.error('Error deleting chat history:', error)
    }
  }

  // Watch for changes in current chat
  watch(
    () => currentChat.value.messages,
    (newMessages) => {
      if (currentChat.value.id && newMessages.length > 0) {
        // Update chat title if it's the first message
        if (newMessages.length === 1 && newMessages[0].role === 'user') {
          const firstMessage = newMessages[0].content
          currentChat.value.title =
            firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')
        }
      }
    },
    { deep: true }
  )

  // Load initial data
  onMounted(() => {
    loadUserChats()
  })

  return {
    chatHistory,
    currentChat,
    isLoading,
    startNewChat,
    loadChat,
    deleteChat,
    deleteChatHistory,
    sendMessage,
  }
}
