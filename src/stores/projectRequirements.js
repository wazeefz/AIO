import { defineStore } from 'pinia'

export const useProjectRequirementsStore = defineStore('projectRequirements', {
  state: () => {
    // Try to load initial state from localStorage
    const savedState = localStorage.getItem('projectRequirements')
    return savedState
      ? JSON.parse(savedState)
      : {
          formData: null,
          loading: false,
          error: null,
          teamRecommendation: null,
          sources: [],
        }
  },

  actions: {
    async submitRequirements(formData) {
      this.loading = true
      this.error = null

      try {
        const requirementsString = this.formatRequirementsString(formData)
        const response = await fetch(
          `http://127.0.0.1:8000/rag/assemble-team?project_requirements=${encodeURIComponent(
            requirementsString
          )}`
        )

        if (!response.ok) {
          throw new Error('Failed to get team recommendation')
        }

        const data = await response.json()
        this.teamRecommendation = data.team_recommendation
        this.sources = data.sources

        // Save to localStorage
        localStorage.setItem('projectRequirements', JSON.stringify(this.$state))

        return data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    formatRequirementsString(formData) {
      let requirements = []

      // Project Classification
      requirements.push(`Project Classification:
- Department: ${formData.department}
- Project Type: ${formData.projectType}
- Project Name: ${formData.projectName}`)

      // Project Details
      requirements.push(`Project Details:
- Description: ${formData.description}
- Industry Domain: ${formData.industryDomain}
- Project Phase: ${formData.projectPhase}
- Scale: ${formData.projectScale}
- Complexity: ${formData.projectComplexity}`)

      // Technical Requirements
      if (formData.technicalRequirements.length > 0) {
        requirements.push('Technical Requirements:')
        formData.technicalRequirements.forEach((category) => {
          requirements.push(`${category.name}:`)
          category.requirements.forEach((req) => {
            requirements.push(
              `- ${req.skill} (${req.level}, ${req.yearsRequired} years, ${req.priority})`
            )
          })
        })
      }

      // Team Composition
      if (formData.teamComposition.length > 0) {
        requirements.push('Required Team Roles:')
        formData.teamComposition.forEach((role) => {
          requirements.push(`- ${role.title} (${role.count} positions)
  * Seniority: ${role.seniority}
  * Commitment: ${role.commitment}
  * Required Certifications: ${role.certification.join(', ')}
  * Required Software: ${role.software.join(', ')}
  * Specific Requirements: ${role.specificRequirements}`)
        })
      }

      return requirements.join('\n\n')
    },
  },
})
