import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

export function useChat(userId) {
  const chatHistory = ref([])
  const currentChat = ref({ id: null, messages: [], title: '' })
  const isLoading = ref(false)

  // Load chat history from local storage
  const loadFromLocalStorage = () => {
    const savedHistory = localStorage.getItem('chatHistory')
    if (savedHistory) {
      try {
        chatHistory.value = JSON.parse(savedHistory)
        if (chatHistory.value.length > 0) {
          currentChat.value = JSON.parse(JSON.stringify(chatHistory.value[0]))
        }
      } catch (error) {
        console.error('Error loading chat history from local storage:', error)
        chatHistory.value = []
      }
    }
  }

  // Save chat history to local storage
  const saveToLocalStorage = () => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory.value))
  }

  // Load chat history from FastAPI backend
  const loadFromBackend = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/chat/history/${userId}`
      )
      chatHistory.value = response.data
      saveToLocalStorage() // Update local storage with the latest data
    } catch (error) {
      console.error('Error loading chat history from backend:', error)
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
      chatHistory.value.unshift(response.data)
      saveToLocalStorage() // Update local storage
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  // Load a specific chat
  const loadChat = async (chat) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/chat/${userId}/${chat.conversation_id}`
      )
      currentChat.value = {
        id: response.data.conversation_id,
        messages: response.data.messages,
        title: response.data.title,
      }
      saveToLocalStorage() // Update local storage
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
      // Send user message to backend
      const userMessage = await axios.post(
        `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message/`,
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
        `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message/`,
        {
          content: qaResponse.data.answer,
          role: 'assistant',
          sources: qaResponse.data.sources, // Include sources in metadata
        }
      )

      // Add the AI message to current chat
      currentChat.value.messages.push({
        ...aiMessage.data,
        content: qaResponse.data.answer,
        sources: qaResponse.data.sources,
      })

      // Update chat history
      await loadFromBackend()

      // Save to local storage
      saveToLocalStorage()
    } catch (error) {
      console.error('Error sending message:', error)
      // Optionally add error message to chat
      currentChat.value.messages.push({
        role: 'system',
        content: 'Error: Unable to process your message. Please try again.',
      })
    } finally {
      isLoading.value = false
    }
  }

  // Send a message
  // const sendMessage = async (content) => {
  //   if (!currentChat.value.id) {
  //     await startNewChat()
  //   }

  //   isLoading.value = true
  //   try {
  //     // Send user message to backend
  //     const userMessage = await axios.post(
  //       `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message/`,
  //       {
  //         content,
  //         role: 'user',
  //       }
  //     )
  //     currentChat.value.messages.push(userMessage.data)

  //     // Get AI response from backend
  //     const aiResponse = await axios.post(
  //       `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message/`,
  //       {
  //         content: 'AI response here', // Replace with actual AI integration
  //         role: 'assistant',
  //       }
  //     )
  //     currentChat.value.messages.push(aiResponse.data)

  //     // Update local storage
  //     saveToLocalStorage()
  //   } catch (error) {
  //     console.error('Error sending message:', error)
  //   } finally {
  //     isLoading.value = false
  //   }
  // }

  // Delete a chat
  const deleteChat = async (chatId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/chat/${userId}/${chatId}`)
      chatHistory.value = chatHistory.value.filter(
        (chat) => chat.conversation_id !== chatId
      )
      if (currentChat.value.id === chatId) {
        currentChat.value = { id: null, messages: [], title: '' }
      }
      saveToLocalStorage() // Update local storage
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }
  // Delete all chat history
  const deleteChatHistory = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/chat/history/${userId}`)
      chatHistory.value = [] // Clear chat history in the UI
      currentChat.value = { id: null, messages: [], title: '' } // Reset current chat
      saveToLocalStorage() // Clear local storage
    } catch (error) {
      console.error('Error deleting chat history:', error)
    }
  }
  // Load data when the component is mounted
  onMounted(() => {
    loadFromLocalStorage() // Load from local storage first for quick UI rendering
    loadFromBackend() // Then load from backend to get the latest data
  })

  // Watch for changes and save to local storage
  watch(
    () => JSON.parse(JSON.stringify(chatHistory.value)),
    (newHistory) => {
      localStorage.setItem('chatHistory', JSON.stringify(newHistory))
    },
    { deep: true }
  )

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

// // use this

// export function useChat(userId) {
//   // Add userId parameter
//   const chatHistory = ref([])
//   const currentChat = ref({ id: null, messages: [], title: '' })
//   const isLoading = ref(false)

//   const loadSavedHistory = async () => {
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/chat/history/${userId}`
//       )
//       chatHistory.value = response.data
//     } catch (error) {
//       console.error('Error loading chat history:', error)
//     }
//   }

//   const startNewChat = async () => {
//     try {
//       const response = await axios.post(`http://127.0.0.1:8000/chat/${userId}`)
//       currentChat.value = {
//         id: response.data.conversation_id,
//         messages: [],
//         title: response.data.title,
//       }
//       chatHistory.value.unshift(response.data)
//     } catch (error) {
//       console.error('Error creating new chat:', error)
//     }
//   }

//   const loadChat = async (chat) => {
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/chat/${userId}/${chat.conversation_id}`
//       )
//       currentChat.value = {
//         id: response.data.conversation_id,
//         messages: response.data.messages,
//         title: response.data.title,
//       }
//     } catch (error) {
//       console.error('Error loading chat:', error)
//     }
//   }

//   const sendMessage = async (content) => {
//     if (!currentChat.value.id) {
//       await startNewChat()
//     }

//     isLoading.value = true
//     try {
//       // Send user message
//       const userMessage = await axios.post(
//         `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message/`,
//         {
//           content,
//           role: 'user',
//         }
//       )
//       currentChat.value.messages.push(userMessage.data)

//       // Get AI response
//       const aiResponse = await axios.post(
//         `http://127.0.0.1:8000/chat/${userId}/${currentChat.value.id}/message/`,
//         {
//           content: 'AI response here', // Replace with actual AI integration
//           role: 'assistant',
//         }
//       )
//       currentChat.value.messages.push(aiResponse.data)
//     } catch (error) {
//       console.error('Error sending message:', error)
//     } finally {
//       isLoading.value = false
//     }
//   }

//   const deleteChat = async (chatId) => {
//     try {
//       await axios.delete(`http://127.0.0.1:8000/chat/${userId}/${chatId}`)
//       chatHistory.value = chatHistory.value.filter(
//         (chat) => chat.conversation_id !== chatId
//       )
//       if (currentChat.value.id === chatId) {
//         currentChat.value = { id: null, messages: [], title: '' }
//       }
//     } catch (error) {
//       console.error('Error deleting chat:', error)
//     }
//   }

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
