<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="$emit('new-chat')">
        <span class="icon">+</span> New Chat
      </button>
      <button class="collapse-btn" @click="$emit('toggle-sidebar')">
        {{ isSidebarCollapsed ? '→' : '←' }}
      </button>
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
/* Copy relevant styles from original CSS */
</style>
