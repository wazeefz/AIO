<template>
  <v-container fluid>
    <!-- Summary Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4">{{ totalTeamMembers }}</div>
            <div class="text-subtitle-1">Team Members</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4">{{ uniqueRoles }}</div>
            <div class="text-subtitle-1">Unique Roles</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h4">{{ totalSkills }}</div>
            <div class="text-subtitle-1">Total Skills</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            Skills Distribution
            <v-spacer></v-spacer>
            <v-btn small text color="primary" @click="resetSkillsFilter">
              Reset Filter
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div id="skills-chart"></div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            Role Distribution
            <v-spacer></v-spacer>
            <v-btn small text color="primary" @click="resetRolesFilter">
              Reset Filter
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div id="roles-chart"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Team Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            Team Members
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="filteredTeamMembers"
            :search="search"
            :items-per-page="5"
          >
            <template v-slot:item.skills="{ item }">
              <v-chip-group>
                <v-chip
                  v-for="skill in item.skills"
                  :key="skill"
                  size="small"
                  color="primary"
                >
                  {{ skill }}
                </v-chip>
              </v-chip-group>
            </template>
          </v-data-table>
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
      headers: [
        { title: 'Name', key: 'name' },
        { title: 'Role', key: 'role' },
        { title: 'Skills', key: 'skills' },
      ],
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
    }
  },

  mounted() {
    // Add DC.js styles
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/dc@4/dist/style/dc.css'
    document.head.appendChild(link)

    this.processTeamData()
  },

  methods: {
    processTeamData() {
      if (!this.teamData?.team_recommendation) return

      const sections = this.teamData.team_recommendation.split('\n\n')
      const members = []

      sections.forEach((section) => {
        if (section.match(/^\d+\./)) {
          const lines = section.split('\n')
          const nameMatch = lines[0].match(/^\d+\.\s*([^-]+)-\s*(.+)$/)

          if (nameMatch) {
            const member = {
              name: nameMatch[1].trim(),
              role: nameMatch[2].trim(),
              skills: [],
            }

            let inQualifications = false
            lines.slice(1).forEach((line) => {
              const trimmedLine = line.trim()

              if (trimmedLine.includes('Key Qualifications:')) {
                inQualifications = true
              } else if (trimmedLine.includes('Justification:')) {
                inQualifications = false
              } else if (inQualifications && trimmedLine.startsWith('-')) {
                const skill = trimmedLine.substring(1).trim()
                member.skills.push(skill)
              }
            })

            members.push(member)
          }
        }
      })

      this.teamMembers = members
      this.filteredTeamMembers = [...members]
      this.updateMetrics()
      this.initializeCharts()
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
      // Clear existing charts
      d3.selectAll('#skills-chart > *').remove()
      d3.selectAll('#roles-chart > *').remove()

      // Create crossfilter instance
      this.ndx = crossfilter(this.teamMembers)

      // Create dimensions and groups
      this.createRolesChart()
      this.createSkillsChart()

      // Set up filter event handlers
      this.setupFilterHandlers()

      // Render all charts
      dc.renderAll()
    },

    createRolesChart() {
      this.roleDimension = this.ndx.dimension((d) => d.role)
      const roleGroup = this.roleDimension.group()

      this.rolesChart = dc
        .pieChart('#roles-chart')
        .width(400)
        .height(250)
        .dimension(this.roleDimension)
        .group(roleGroup)
        .innerRadius(50)
        .legend(dc.legend())
    },

    createSkillsChart() {
      // Create a dimension for flattened skills
      const skillsData = this.teamMembers.flatMap((member) =>
        member.skills.map((skill) => ({
          id: member.name, // Use name as ID to link back to member
          skill: skill.split('(')[0].trim(),
          role: member.role,
        }))
      )

      const skillsNdx = crossfilter(skillsData)
      this.skillsDimension = skillsNdx.dimension((d) => d.skill)
      const skillsGroup = this.skillsDimension.group().reduceCount()

      this.skillsChart = dc
        .rowChart('#skills-chart')
        .width(400)
        .height(250)
        .dimension(this.skillsDimension)
        .group(skillsGroup)
        .elasticX(true)
        .ordering((d) => -d.value)
        .cap(10)
    },

    setupFilterHandlers() {
      // Update filtered members when charts are filtered
      const updateFilters = () => {
        const roleFilters = this.roleDimension.top(Infinity)
        const skillFilters = this.skillsDimension.top(Infinity)

        // Get unique member names from skill filters
        const filteredMemberIds = new Set(skillFilters.map((s) => s.id))

        // Apply both role and skill filters
        this.filteredTeamMembers = this.teamMembers.filter((member) => {
          const roleMatch = roleFilters.some((r) => r.role === member.role)
          const skillMatch = filteredMemberIds.has(member.name)
          return roleMatch && (skillMatch || !filteredMemberIds.size)
        })

        this.updateMetrics()
      }

      // Add filter listeners to charts
      this.rolesChart.on('filtered', updateFilters)
      this.skillsChart.on('filtered', updateFilters)
    },

    resetSkillsFilter() {
      this.skillsChart.filterAll()
      dc.redrawAll()
      this.filteredTeamMembers = [...this.teamMembers]
      this.updateMetrics()
    },

    resetRolesFilter() {
      this.rolesChart.filterAll()
      dc.redrawAll()
      this.filteredTeamMembers = [...this.teamMembers]
      this.updateMetrics()
    },
  },

  watch: {
    teamData: {
      handler() {
        this.processTeamData()
      },
      deep: true,
    },
  },

  beforeUnmount() {
    // Cleanup
    if (this.ndx) {
      this.ndx.remove(() => true)
    }
  },
})
</script>

<style>
#skills-chart,
#roles-chart {
  width: 100% !important;
}

.dc-chart {
  float: none !important;
}

.dc-chart .pie-slice {
  fill: var(--v-primary-base);
}

#skills-chart .row rect {
  fill: var(--v-primary-base);
}

.dc-chart .axis text {
  font-size: 12px;
}

/* Add hover effects */
.dc-chart .pie-slice:hover {
  fill-opacity: 0.8;
}

#skills-chart .row rect:hover {
  fill-opacity: 0.8;
}

/* Add pointer cursor to indicate clickable elements */
.dc-chart .pie-slice,
#skills-chart .row rect {
  cursor: pointer;
}
</style>
