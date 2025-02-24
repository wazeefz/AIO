<template class="h-100">
  <div class="d-flex justify-center align-center fill-height">
    <v-img src="/loading-animation.gif" max-width="100px" max-height="100px">
    </v-img>
    We are prepping up the G!
  </div>
</template>

<!-- <script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

router.push('/dashboard')
</script> -->

<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  // Delay the push by 3 seconds
  setTimeout(() => {
    router.push('/login')
  }, 0) // Delay time in milliseconds (3000ms = 3 seconds)
})
</script>
