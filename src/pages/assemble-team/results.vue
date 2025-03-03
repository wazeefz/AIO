<template>
  <div class="recommendation-container">
    <!-- Main Content -->
    <main class="main-content" ref="mainContent">
      <v-container fluid class="pa-0 ma-0">
        <div v-if="!teamRecommendation">
          <v-card class="form-card">
            <v-card-title class="text-h4 mb-6 primary-color font-weight-medium">
              Team Recommendation
            </v-card-title>
            <v-alert type="warning" class="mb-4">
              No team recommendation found. Please submit project requirements
              first.
            </v-alert>
            <v-btn
              color="#B1A184"
              class="mt-4"
              size="large"
              @click="navigateTo('/projects/requirements')"
            >
              Go to Requirements Form
            </v-btn>
          </v-card>
        </div>

        <template v-else>
          <v-card class="form-card">
            <v-card-title class="text-h4 mb-6 primary-color font-weight-medium">
              Team Members Recommendation
            </v-card-title>
            <team-dashboard
              :team-data="{
                team_recommendation: teamRecommendation,
                sources: sources,
              }"
            />
          </v-card>
        </template>
      </v-container>

      <!-- Scroll to Top Button -->
      <v-btn
        v-show="showScrollButton"
        @click="scrollToTop"
        color="#B1A184"
        icon
        class="scroll-to-top"
        elevation="3"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>
    </main>
  </div>
</template>

<script setup>
const router = useRouter()
import { computed, onMounted, ref, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import TeamDashboard from '@/components/TeamDashboard.vue'
import { useProjectRequirementsStore } from '@/stores/projectRequirements'

const store = useProjectRequirementsStore()
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
})

const teamRecommendation = computed(() => store.teamRecommendation)
const sources = computed(() => store.sources)

// Scroll functionality
const mainContent = ref(null)
const showScrollButton = ref(false)

const handleScroll = () => {
  if (mainContent.value) {
    showScrollButton.value = mainContent.value.scrollTop > 300
  }
}

const scrollToTop = () => {
  if (mainContent.value) {
    mainContent.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

// Lifecycle hooks
onMounted(() => {
  if (mainContent.value) {
    mainContent.value.addEventListener('scroll', handleScroll, {
      passive: true,
    })
    handleScroll() // Initial check
  }
})

onUnmounted(() => {
  if (mainContent.value) {
    mainContent.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.recommendation-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  max-width: 100%;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  max-width: 100%;
}

.form-card {
  background-color: white;
  padding: 24px;
  height: 100%;
  width: 100%;
  margin: 0;
  border-radius: 0;
}

.primary-color {
  color: #b1a184;
}

.scroll-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
  background-color: #b1a184 !important;
  color: white !important;
}

.scroll-to-top:hover {
  transform: translateY(-2px);
  opacity: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
}

/* Add scrollbar styles */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #b1a184;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #9a8b70;
}

.main-content {
  scrollbar-width: thin;
  scrollbar-color: #b1a184 #f1f1f1;
}

/* Remove unwanted gaps */
:deep(.v-container) {
  padding: 0 !important;
  margin: 0 !important;
  max-width: none !important;
  width: 100% !important;
}

:deep(.v-main) {
  padding: 0 !important;
}

:deep(.v-card) {
  width: 100%;
  margin: 0;
  border-radius: 0;
}

:deep(.v-application__wrap) {
  min-height: 100%;
  width: 100%;
  max-width: 100%;
}

@media (max-width: 960px) {
  .main-content {
    padding: 16px;
  }

  .form-card {
    padding: 16px;
  }
}
</style>
