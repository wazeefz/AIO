<template>
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
</template>

<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
</script>

<style scoped>
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
</style>
