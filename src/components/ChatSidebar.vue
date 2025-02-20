<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="$emit('new-chat')">
        <span class="icon">+</span> New Chat
      </button>
    </div>

    <div class="search-container">
      <div class="search-wrapper">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="search-input"
          @input="$emit('search', searchQuery)"
        />
      </div>
    </div>

    <div class="chat-history">
      <div
        v-for="chat in chatHistory"
        :key="chat.id"
        :class="['chat-item', { active: currentChatId === chat.id }]"
        @click="$emit('load-chat', chat)"
      >
        <span class="chat-title">{{ chat.title }}</span>
        <button
          class="delete-chat"
          @click.stop="$emit('delete-chat', chat.id)"
          @click="handleDeleteChatHistory"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const deleteChatHistory = ref()

defineProps({
  chatHistory: Array,
  currentChatId: Number,
})

const searchQuery = ref('')

defineEmits(['new-chat', 'load-chat', 'delete-chat', 'search'])

const handleDeleteChatHistory = async () => {
  if (confirm('Are you sure you want to delete all chat history?')) {
    await deleteChatHistory()
    alert('Chat history deleted successfully!')
  }
}
</script>

<style scoped>
.search-container {
  padding: 0 15px 15px 15px; /* Increased padding */
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 38px; /* Added left padding for icon */
  border: 1px solid #e5e5e5;
  border-radius: 25px; /* More rounded */
  background-color: white;
  font-size: 0.9em;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: #7c6556;
  box-shadow: 0 0 0 2px rgba(124, 101, 86, 0.1);
}

.search-input::placeholder {
  color: #999;
}

.new-chat-btn {
  flex: 1;
  padding: 12px;
  background-color: #7c6556;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s ease;
}

.new-chat-btn:hover {
  background-color: #6a574a;
}

.sidebar {
  width: 260px;
  background-color: #eae3d6;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  margin: 10px; /* Add margin around sidebar */
  border-radius: 30px; /* Rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); /* Optional: subtle shadow */
}

.sidebar-header {
  padding: 15px; /* Increased padding */
  display: flex;
  gap: 10px;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 0 15px 15px 15px; /* Adjusted padding */
  margin-right: 2px; /* Add small margin for scrollbar */
}

/* Custom scrollbar styles */
.chat-history::-webkit-scrollbar {
  width: 5px;
}

.chat-history::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history::-webkit-scrollbar-thumb {
  background: #d1c7b8;
  border-radius: 10px;
}

.chat-item {
  padding: 12px 15px;
  margin: 5px 0;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.5); /* Light background */
}

.chat-item:hover {
  background-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.chat-item.active {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
</style>
