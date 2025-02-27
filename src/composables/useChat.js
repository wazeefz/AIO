// import { ref, watch, onMounted } from 'vue'

// export function useChat() {
//   const chatHistory = ref([])
//   const currentChat = ref({
//     id: null,
//     title: '',
//     messages: [],
//   })
//   const isLoading = ref(false)

//   // Load chat history from localStorage
//   const loadSavedHistory = () => {
//     const savedHistory = localStorage.getItem('chatHistory')
//     if (savedHistory) {
//       try {
//         chatHistory.value = JSON.parse(savedHistory)
//         if (chatHistory.value.length > 0) {
//           currentChat.value = JSON.parse(JSON.stringify(chatHistory.value[0]))
//         }
//       } catch (error) {
//         console.error('Error loading chat history:', error)
//         chatHistory.value = []
//       }
//     }
//   }

//   // Watch for changes and save to localStorage
//   watch(
//     () => JSON.parse(JSON.stringify(chatHistory.value)),
//     (newHistory) => {
//       localStorage.setItem('chatHistory', JSON.stringify(newHistory))
//     },
//     { deep: true }
//   )

//   const startNewChat = () => {
//     currentChat.value = {
//       id: Date.now(),
//       title: '',
//       messages: [],
//     }
//   }

//   const loadChat = (chat) => {
//     currentChat.value = JSON.parse(JSON.stringify(chat))
//   }

//   const deleteChat = (chatId) => {
//     chatHistory.value = chatHistory.value.filter((chat) => chat.id !== chatId)
//     if (currentChat.value.id === chatId) {
//       startNewChat()
//     }
//   }

//   const updateChatHistory = () => {
//     const index = chatHistory.value.findIndex(
//       (chat) => chat.id === currentChat.value.id
//     )
//     const chatToUpdate = JSON.parse(JSON.stringify(currentChat.value))

//     if (index !== -1) {
//       chatHistory.value[index] = chatToUpdate
//     } else {
//       chatHistory.value.unshift(chatToUpdate)
//     }
//   }

//   const sendMessage = async (message) => {
//     if (!message.trim() || isLoading.value) return

//     // Add user message
//     currentChat.value.messages.push({
//       role: 'user',
//       content: message,
//     })

//     // Set title if first message
//     if (currentChat.value.messages.length === 1) {
//       currentChat.value.title = message.slice(0, 30) + '...'
//     }

//     isLoading.value = true

//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000))

//       // Add AI response
//       currentChat.value.messages.push({
//         role: 'assistant',
//         content: `This is a simulated response to: "${message}"`,
//       })

//       // Update chat history
//       updateChatHistory()
//     } catch (error) {
//       console.error('Error:', error)
//     } finally {
//       isLoading.value = false
//     }
//   }

//   // Load saved history when component is mounted
//   onMounted(() => {
//     loadSavedHistory()
//   })

//   return {
//     chatHistory,
//     currentChat,
//     isLoading,
//     startNewChat,
//     loadChat,
//     deleteChat,
//     sendMessage,
//     loadSavedHistory,
//   }
// }

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

  const sendMessage = async (message_text) => {
    if (!currentChat.value.id) {
      await startNewChat()
    }

    isLoading.value = true
    try {
      // Send user message
      const userMessage = await axios.post(
        `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message`,
        {
          message_text,
          sender: 'user',
        }
      )
      currentChat.value.messages.push(userMessage.data)

      // Get AI response
      const aiResponse = await axios.get(
        `http://127.0.0.1:8000/chat/ask-question/`,
        {
          params: { question: message_text },
        }
      )

      // Send AI message
      const aiMessage = await axios.post(
        `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message`,
        {
          message_text:
            aiResponse.data.content ||
            aiResponse.data.answer ||
            'No response generated',
          sender: 'assistant',
        }
      )
      currentChat.value.messages.push(aiMessage.data)

      await loadUserChats()
    } catch (error) {
      console.error('Error:', error.response?.data || error)
      currentChat.value.messages.push({
        message_text: 'Error: Unable to process your message.',
        sender: 'system',
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
        if (newMessages.length === 1 && newMessages[0].sender === 'user') {
          const firstMessage = newMessages[0].message_text
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
