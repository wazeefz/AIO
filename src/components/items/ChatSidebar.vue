<!-- ChatSidebar.vue -->

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="$emit('new-chat')">
        <AddBtn :is-editing="true" color="white" />
        <span>New Chat</span>
      </button>
    </div>

    <div class="search-container">
      <SearchBar />
    </div>

    <div class="chat-history">
      <div
        v-for="chat in chatHistory"
        :key="chat.id"
        :class="['chat-item', { active: currentChatId === chat.id }]"
        @click="$emit('load-chat', chat)"
      >
        <span class="chat-title">{{ chat.title }}</span>

        <div class="remove-btn-wrapper">
          <RemoveBtn
            :is-editing="true"
            custom-class="sidebar-remove-button"
            :use-default-style="false"
            @remove="$emit('delete-chat', chat.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SearchBar from '@/components/items/SearchBar.vue'
import AddBtn from '@/components/items/AddBtn.vue'
import RemoveBtn from '@/components/items/RemoveBtn.vue'

defineProps({
  chatHistory: Array,
  currentChatId: Number,
})

defineEmits(['new-chat', 'load-chat', 'delete-chat', 'search'])
</script>

<style scoped>
.search-container {
  padding: 0 15px 15px 15px; /* Increased padding */
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
