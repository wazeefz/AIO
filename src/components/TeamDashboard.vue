<template>
  <v-container fluid>
    <!-- Project Requirements Analysis Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center font-weight-medium">
            <v-icon class="mr-2" color="#B1A184"
              >mdi-clipboard-text-outline</v-icon
            >
            <span class="primary-color">Project Requirements Analysis</span>
          </v-card-title>
          <v-card-text>
            <p>{{ projectRequirementsAnalysis }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 primary-color">{{ totalTeamMembers }}</div>
            <div class="text-subtitle-1">Team Members</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 primary-color">{{ uniqueRoles }}</div>
            <div class="text-subtitle-1">Unique Roles</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4 primary-color">{{ totalSkills }}</div>
            <div class="text-subtitle-1">Total Skills</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center font-weight-medium">
            <v-icon class="mr-2" color="#B1A184">mdi-chart-areaspline</v-icon>
            <span class="primary-color">Skills Distribution</span>
            <v-spacer></v-spacer>
            <v-btn small text color="#B1A184" @click="resetSkillsFilter">
              Reset Filter
            </v-btn>
          </v-card-title>
          <v-card-text class="text-center">
            <div id="skills-chart" class="chart-container"></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center font-weight-medium">
            <v-icon class="mr-2" color="#B1A184">mdi-chart-pie</v-icon>
            <span class="primary-color">Role Distribution</span>
            <v-spacer></v-spacer>
            <v-btn small text color="#B1A184" @click="resetRolesFilter">
              Reset Filter
            </v-btn>
          </v-card-title>
          <v-card-text class="text-center">
            <div id="roles-chart" class="chart-container"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Team Members Section -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center font-weight-medium">
            <v-icon class="mr-2" color="#B1A184"
              >mdi-account-multiple-outline</v-icon
            >
            <span class="primary-color">Team Recommendation</span>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              class="search-field"
            ></v-text-field>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="(member, index) in filteredTeamMembers"
                :key="index"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card
                  class="team-card"
                  :style="{
                    border: `2px solid ${darkenColor(
                      getLighterColor(teamColors[index % teamColors.length]),
                      0.7
                    )}`,
                  }"
                >
                  <v-card-title class="team-member-title text-center">
                    <v-btn
                      :to="`/member-profile/${member.name}`"
                      variant="text"
                      class="member-name-btn"
                    >
                      {{ member.name }}
                    </v-btn>
                  </v-card-title>

                  <v-card-text class="pt-0">
                    <p class="font-weight-bold mb-2">Role:</p>
                    <p class="role-text mb-3">{{ member.role }}</p>

                    <p class="font-weight-bold mb-2">Key Qualifications:</p>
                    <div class="skills-container">
                      <v-chip
                        v-for="skill in member.skills"
                        :key="skill"
                        size="small"
                        :color="
                          getLighterColor(teamColors[index % teamColors.length])
                        "
                        class="skill-chip"
                        label
                      >
                        <span class="skill-chip-text">{{ skill }}</span>
                      </v-chip>
                    </div>

                    <div v-if="member.justification" class="mt-3">
                      <p class="font-weight-bold mb-2">Justification:</p>
                      <p class="justification-text">
                        {{ member.justification }}
                      </p>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Team Dynamics Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center font-weight-medium">
            <v-icon class="mr-2" color="#B1A184">mdi-account-group</v-icon>
            <span class="primary-color">Team Dynamics</span>
          </v-card-title>
          <v-card-text>
            <p>{{ teamDynamics }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sources Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center font-weight-medium">
            <v-icon class="mr-2" color="#B1A184"
              >mdi-file-document-multiple</v-icon
            >
            <span class="primary-color">Sources</span>
          </v-card-title>
          <v-card-text>
            <v-chip-group>
              <v-chip
                v-for="source in sources"
                :key="`${source.file_name}-${source.page_number}`"
                color="primary"
                variant="outlined"
                class="source-chip"
              >
                {{ source.file_name }} (Page {{ source.page_number }})
              </v-chip>
            </v-chip-group>
            <p
              v-if="!sources || sources.length === 0"
              class="text-subtitle-1 text-center mt-2"
            >
              No sources available
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { defineComponent } from 'vue'
import * as d3 from 'd3'
import * as dc from 'dc'
import crossfilter from 'crossfilter2'

export default defineComponent({
  name: 'TeamDashboard',

  props: {
    teamData: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      search: '',
      teamMembers: [],
      filteredTeamMembers: [],
      totalTeamMembers: 0,
      uniqueRoles: 0,
      totalSkills: 0,
      ndx: null,
      skillsChart: null,
      rolesChart: null,
      roleDimension: null,
      skillsDimension: null,
      // Vibrant colors
      teamColors: ['#FF6B6B', '#4ECDC4', '#FFD166', '#6A0572', '#1A535C'],
      primaryColor: '#B1A184',
      projectRequirementsAnalysis: '',
      teamDynamics: '',
      sources: [],
    }
  },

  mounted() {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/dc@4/dist/style/dc.css'
    document.head.appendChild(link)

    this.processTeamData()
  },

  methods: {
    processTeamData() {
      if (!this.teamData?.team_recommendation) return

      this.extractDataFromRecommendation(this.teamData.team_recommendation)
      this.sources = this.teamData.sources || []
      this.filteredTeamMembers = [...this.teamMembers]
      this.updateMetrics()
      this.initializeCharts()
    },

    extractDataFromRecommendation(text) {
      // Extract project requirements analysis
      const analysisMatch = text.match(
        /Project Requirements Analysis:([\s\S]*?)(?=\n\n\d+\.|$)/i
      )
      if (analysisMatch) {
        this.projectRequirementsAnalysis = analysisMatch[1].trim()
      } else {
        this.projectRequirementsAnalysis =
          'No project requirements analysis found.'
      }

      // Extract team dynamics
      const dynamicsMatch = text.match(
        /Team Dynamics:([\s\S]*?)(?=\n\nSources:|$)/i
      )
      if (dynamicsMatch) {
        this.teamDynamics = dynamicsMatch[1].trim()
      } else {
        this.teamDynamics = 'No team dynamics information found.'
      }

      // Extract team members
      const members = []
      const memberSections =
        text.match(/\d+\.[^]*?(?=\n\n\d+\.|Team Dynamics:|$)/g) || []

      memberSections.forEach((section) => {
        const lines = section.split('\n')
        const nameMatch = lines[0].match(/^\d+\.\s*([^-]+)-\s*(.+)$/)

        if (nameMatch) {
          const member = {
            name: nameMatch[1].trim(),
            role: nameMatch[2].trim(),
            skills: [],
            justification: '',
          }

          let inQualifications = false
          let inJustification = false

          lines.slice(1).forEach((line) => {
            const trimmedLine = line.trim()

            if (trimmedLine.includes('Key Qualifications:')) {
              inQualifications = true
              inJustification = false
            } else if (trimmedLine.includes('Justification:')) {
              inQualifications = false
              inJustification = true
            } else if (inQualifications && trimmedLine.startsWith('-')) {
              const skill = trimmedLine.substring(1).trim()
              member.skills.push(skill)
            } else if (inJustification && trimmedLine) {
              member.justification +=
                (member.justification ? ' ' : '') + trimmedLine
            }
          })

          members.push(member)
        }
      })

      this.teamMembers = members
    },

    updateMetrics() {
      this.totalTeamMembers = this.filteredTeamMembers.length
      this.uniqueRoles = new Set(
        this.filteredTeamMembers.map((m) => m.role)
      ).size
      this.totalSkills = new Set(
        this.filteredTeamMembers.flatMap((m) => m.skills)
      ).size
    },

    initializeCharts() {
      d3.selectAll('#skills-chart > *').remove()
      d3.selectAll('#roles-chart > *').remove()

      this.ndx = crossfilter(this.teamMembers)
      this.createRolesChart()
      this.createSkillsChart()
      this.setupFilterHandlers()
      dc.renderAll()
    },

    createRolesChart() {
      this.roleDimension = this.ndx.dimension((d) => d.role)
      const roleGroup = this.roleDimension.group()

      // Create a color scale using vibrant colors
      const colorScale = d3
        .scaleOrdinal()
        .domain(roleGroup.all().map((d) => d.key))
        .range(this.teamColors)

      this.rolesChart = dc
        .pieChart('#roles-chart')
        .width(800)
        .height(250)
        .dimension(this.roleDimension)
        .group(roleGroup)
        .innerRadius(20)
        .externalRadiusPadding(20) // Add padding around the pie chart
        .legend(dc.legend().x(1).y(10).itemHeight(13).gap(5)) // Position the legend to the right
        .colors(colorScale)
        .renderTitle(true)
        .title((d) => `${d.key}: ${d.value} members`)
    },

    createSkillsChart() {
      const skillsData = this.teamMembers.flatMap((member) =>
        member.skills.map((skill) => ({
          id: member.name,
          skill: skill.split('(')[0].trim(),
          role: member.role,
        }))
      )

      const skillsNdx = crossfilter(skillsData)
      this.skillsDimension = skillsNdx.dimension((d) => d.skill)
      const skillsGroup = this.skillsDimension.group().reduceCount()

      // Create a color scale for skills
      const colorScale = d3
        .scaleOrdinal()
        .domain(skillsGroup.all().map((d) => d.key))
        .range(this.teamColors)

      this.skillsChart = dc
        .rowChart('#skills-chart')
        .width(500)
        .height(250)
        .dimension(this.skillsDimension)
        .group(skillsGroup)
        .elasticX(true)
        .ordering((d) => -d.value)
        .cap(10)
        .margins({ top: 10, right: 30, bottom: 30, left: 80 })
        .colors(colorScale)
        .renderTitle(true)
        .title((d) => `${d.key}: ${d.value} occurrences`)
    },

    setupFilterHandlers() {
      const updateFilters = () => {
        // Get all records from dimensions
        const roleFilters = this.roleDimension.top(Infinity)
        const skillFilters = this.skillsDimension.top(Infinity)

        // Get current filters
        const currentRoleFilter = this.roleDimension.currentFilter()
        const filteredMemberIds = new Set(skillFilters.map((s) => s.id))

        // Apply filters
        if (currentRoleFilter || this.skillsDimension.currentFilter()) {
          this.filteredTeamMembers = this.teamMembers.filter((member) => {
            const roleMatch =
              !currentRoleFilter || member.role === currentRoleFilter
            const skillMatch =
              !this.skillsDimension.currentFilter() ||
              filteredMemberIds.has(member.name)
            return roleMatch && skillMatch
          })
        } else {
          this.filteredTeamMembers = [...this.teamMembers]
        }

        this.updateMetrics()
      }

      this.rolesChart.on('filtered', updateFilters)
      this.skillsChart.on('filtered', updateFilters)
    },

    resetSkillsFilter() {
      this.skillsChart.filterAll()
      dc.redrawAll()
      this.filteredTeamMembers = this.filterTeamMembers()
      this.updateMetrics()
    },

    resetRolesFilter() {
      this.rolesChart.filterAll()
      dc.redrawAll()
      this.filteredTeamMembers = this.filterTeamMembers()
      this.updateMetrics()
    },

    filterTeamMembers() {
      let filtered = [...this.teamMembers]

      if (this.roleDimension && this.skillsDimension) {
        const currentRoleFilter = this.roleDimension.currentFilter()
        const currentSkillFilter = this.skillsDimension.currentFilter()

        if (currentRoleFilter || currentSkillFilter) {
          const skillFilters = this.skillsDimension.top(Infinity)
          const filteredMemberIds = new Set(skillFilters.map((s) => s.id))

          filtered = filtered.filter((member) => {
            const roleMatch =
              !currentRoleFilter || member.role === currentRoleFilter
            const skillMatch =
              !currentSkillFilter || filteredMemberIds.has(member.name)
            return roleMatch && skillMatch
          })
        }
      }

      if (this.search) {
        const searchTerm = this.search.toLowerCase()
        filtered = filtered.filter(
          (member) =>
            member.name.toLowerCase().includes(searchTerm) ||
            member.role.toLowerCase().includes(searchTerm) ||
            member.skills.some((skill) =>
              skill.toLowerCase().includes(searchTerm)
            )
        )
      }

      return filtered
    },

    getLighterColor(color) {
      const colorMap = {
        '#FF6B6B': '#FFADAD', // Lighter red
        '#4ECDC4': '#A0E4DE', // Lighter teal
        '#FFD166': '#FFE6A7', // Lighter yellow
        '#6A0572': '#C27ECC', // Lighter purple
        '#1A535C': '#7EACB2', // Lighter dark teal
      }
      return colorMap[color] || color
    },

    darkenColor(color, factor = 0.8) {
      color = color.replace('#', '')
      const r = parseInt(color.substring(0, 2), 16)
      const g = parseInt(color.substring(2, 4), 16)
      const b = parseInt(color.substring(4, 6), 16)

      const darkenedR = Math.max(0, Math.floor(r * factor))
      const darkenedG = Math.max(0, Math.floor(g * factor))
      const darkenedB = Math.max(0, Math.floor(b * factor))

      const toHex = (c) => {
        const hex = c.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }

      return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`
    },
  },

  watch: {
    teamData: {
      handler() {
        this.processTeamData()
      },
      deep: true,
    },
    search(newSearch) {
      this.filteredTeamMembers = this.filterTeamMembers()
      this.updateMetrics()
    },
  },

  beforeUnmount() {
    if (this.ndx) {
      this.ndx.remove(() => true)
    }
  },
})
</script>

<style scoped>
#skills-chart,
#roles-chart {
  width: 100% !important;
}

.chart-container {
  display: inline-block;
  margin: 0 auto;
}

.dc-chart {
  float: none !important;
}

.dc-chart .pie-slice:hover {
  fill-opacity: 0.8;
}

#skills-chart .row rect:hover {
  fill-opacity: 0.8;
}

.dc-chart .axis text {
  font-size: 12px;
}

/* Add pointer cursor to indicate clickable elements */
.dc-chart .pie-slice,
#skills-chart .row rect {
  cursor: pointer;
}

/* Tooltip styling */
.dc-tooltip {
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #b1a184;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  color: #333;
}

.team-card {
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.team-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

/* Style for the skills container */
.skills-container {
  display: flex;
  flex-wrap: wrap; /* Allow chips to wrap to the next line */
  gap: 4px; /* Add some spacing between chips */
}

/* Style for individual skill chips */
.skill-chip {
  margin-bottom: 4px; /* Add margin below each chip */
}

.primary-color {
  color: #b1a184;
}

.team-member-title {
  font-size: 1.25rem;
  padding: 8px 16px 0;
  margin: 0;
}

/* Style for the role text */
.role-text {
  color: #666666; /* Medium gray for role text */
  font-size: 0.95rem;
  line-height: 1.5;
}

.skill-chip-text {
  color: rgba(0, 0, 0, 0.6); /* Lighter black for better visibility */
}

/* Add margin to the search field */
.search-field {
  margin-left: 16px;
  max-width: 200px; /* Adjust as needed */
}

/* Style for the member name button */
.member-name-btn {
  color: #000000;
  font-weight: 900; /* Extra bold */
  font-size: 1.25rem;
  text-transform: none;
  padding: 0;
  height: auto;
  min-width: 0;
  text-align: center;
  display: inline-block;
  width: 100%;
}

.member-name-btn:hover {
  background: transparent;
  text-decoration: underline;
}

/* Style for the justification text */
.justification-text {
  color: #666666;
  font-size: 0.95rem;
  line-height: 1.5;
  text-align: justify;
}

/* Legend styling */
.dc-legend {
  font-size: 12px;
}

.dc-legend-item {
  cursor: pointer;
}

.dc-legend-item text {
  fill: #333;
}

.dc-legend-item:hover text {
  fill: #b1a184;
}

/* Source chip styling */
.source-chip {
  margin: 4px;
  font-size: 0.9rem;
}
</style>
