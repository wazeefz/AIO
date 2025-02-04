<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="$emit('new-chat')">
        <span class="icon">+</span> New Chat
      </button>
      <!-- <button class="collapse-btn" @click="$emit('toggle-sidebar')">
        {{ isSidebarCollapsed ? '→' : '←' }}
      </button> -->
    </div>

    <div class="chat-history">
      <div
        v-for="chat in chatHistory"
        :key="chat.id"
        :class="['chat-item', { active: currentChatId === chat.id }]"
        @click="$emit('load-chat', chat)"
      >
        <span class="chat-title">{{ chat.title }}</span>
        <button class="delete-chat" @click.stop="$emit('delete-chat', chat.id)">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  chatHistory: Array,
  currentChatId: Number,
  isSidebarCollapsed: Boolean,
})

defineEmits(['new-chat', 'load-chat', 'delete-chat', 'toggle-sidebar'])
</script>

<style scoped>
.collapse-btn {
  padding: 10px;
  background: none;
  border: 1px solid #e5e5e5;
  border-radius: 5px;
  cursor: pointer;
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
</style>
