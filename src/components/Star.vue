<template>
  <div class="star"></div>
</template>

<script></script>

<style scoped>
.star {
  width: 50px;
  height: 50px;
  background-color: #000000;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  transition: all 0.3s ease;
  cursor: pointer;
}

.star.active {
  background-color: #ffd700;
}

.star:hover {
  transform: scale(2.5);
}
</style>
