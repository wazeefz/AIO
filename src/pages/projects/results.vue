<template>
  <div v-if="!teamRecommendation">
    <v-alert type="warning">
      No team recommendation found. Please submit project requirements first.
    </v-alert>
    <v-btn
      color="primary"
      class="mt-4"
      @click="navigateTo('/projects/requirements')"
    >
      Go to Requirements Form
    </v-btn>
  </div>

  <template v-else>
    <v-card>
      <v-card-title class="text-h5"> Team Recommendation </v-card-title>

      <team-dashboard
        :team-data="{
          team_recommendation: teamRecommendation,
          sources: sources,
        }"
      />

      <v-card-text class="pt-4">
        <div
          class="recommendation-content"
          v-html="renderedRecommendation"
        ></div>

        <v-divider class="my-4"></v-divider>

        <div class="text-subtitle-1 mb-2">Sources:</div>
        <v-chip-group>
          <v-chip
            v-for="source in sources"
            :key="`${source.file_name}-${source.page_number}`"
            color="primary"
            variant="outlined"
          >
            {{ source.file_name }} (Page {{ source.page_number }})
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>
  </template>
</template>

<script setup>
const router = useRouter()
import { computed, onMounted } from 'vue'
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

// Redirect if no recommendation data
onMounted(() => {
  if (!store.teamRecommendation) {
    navigateTo('/projects/requirements')
  }
})

const formatRecommendation = (text) => {
  // Split the text into sections
  const sections = text.split('\n\n')

  let markdown = ''

  sections.forEach((section) => {
    if (section.includes('Project Requirements Analysis:')) {
      markdown += `## Project Requirements Analysis\n\n${
        section.split(':')[1]
      }\n\n`
    } else if (section.includes('Recommended Team:')) {
      markdown += `## Recommended Team\n\n`
    } else if (section.includes('Team Dynamics:')) {
      markdown += `## Team Dynamics\n\n${section.split(':')[1]}\n\n`
    } else if (section.match(/^\d+\./)) {
      // Team member sections
      const lines = section.split('\n')
      const name = lines[0]
      markdown += `### ${name}\n\n`

      lines.slice(1).forEach((line) => {
        if (line.includes('Key Qualifications:')) {
          markdown += `**Key Qualifications:**\n`
        } else if (line.includes('Justification:')) {
          markdown += `\n**Justification:**\n`
        } else if (line.trim()) {
          markdown += `${line.trim()}\n`
        }
      })
      markdown += '\n'
    }
  })

  return markdown
}

const renderedRecommendation = computed(() => {
  if (!teamRecommendation.value) return ''
  const markdown = formatRecommendation(teamRecommendation.value)
  return md.render(markdown)
})
</script>
