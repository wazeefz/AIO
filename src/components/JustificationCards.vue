<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title>
            <h3>
              <v-icon class="mr-2" color="#8C9EFF">
                mdi-chart-timeline-variant-shimmer</v-icon
              >{{ title }}
            </h3>
          </v-card-title>
          <v-card-text>
            <p>{{ justification }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="team in teams.slice(0, 2)"
        :key="team.name"
        cols="12"
        sm="6"
      >
        <v-card
          class="mb-4"
          :style="{ border: `2px solid ${getLighterColor(team.color)}` }"
        >
          <v-card-title>
            <v-chip :color="team.color"
              >{{ team.name }} ({{ team.members.length }} members)</v-chip
            >
          </v-card-title>
          <v-card-text>
            <p class="font-weight-bold">Team Justification:</p>
            <p>{{ team.justification }}</p>

            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Member</th>
                  <th class="text-left">Experience</th>
                  <th class="text-left">Strengths</th>
                  <th class="text-right">Mandays</th>
                  <th class="text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in team.members" :key="member.name">
                  <td>
                    <v-btn
                      :to="`/member-profile/${member.name}`"
                      variant="text"
                      class="text-left"
                      >{{ member.name }}</v-btn
                    >
                  </td>
                  <td>{{ member.experience }}</td>
                  <td>{{ member.strengths }}</td>
                  <td class="text-right">{{ member.mandays }}</td>
                  <td class="text-right">{{ member.cost }}</td>
                </tr>
              </tbody>
            </v-table>

            <div class="text-right">
              <span class="font-weight-bold">Total Cost:</span>
              {{ team.totalCost }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="team in teams.slice(2)" :key="team.name" cols="12" sm="6">
        <v-card
          class="mb-4"
          :style="{ border: `2px solid ${getLighterColor(team.color)}` }"
        >
          <v-card-title>
            <v-chip :color="team.color"
              >{{ team.name }} ({{ team.members.length }} members)</v-chip
            >
          </v-card-title>
          <v-card-text>
            <p class="font-weight-bold">Team Justification:</p>
            <p>{{ team.justification }}</p>

            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Member</th>
                  <th class="text-left">Experience</th>
                  <th class="text-left">Strengths</th>
                  <th class="text-right">Mandays</th>
                  <th class="text-right">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in team.members" :key="member.name">
                  <td>
                    <v-btn
                      :to="`/member-profile/${member.name}`"
                      variant="text"
                      class="text-left"
                      >{{ member.name }}</v-btn
                    >
                  </td>
                  <td>{{ member.experience }}</td>
                  <td>{{ member.strengths }}</td>
                  <td class="text-right">{{ member.mandays }}</td>
                  <td class="text-right">{{ member.cost }}</td>
                </tr>
              </tbody>
            </v-table>

            <div class="text-right">
              <span class="font-weight-bold">Total Cost:</span>
              {{ team.totalCost }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
function getLighterColor(color) {
  const colorMap = {
    blue: '#87CEFA', // Light Sky Blue
    red: '#FFB6C1', // Light Pink
    yellow: '#FFFFE0', // Light Yellow
    orange: '#FFE4B5', // Moccasin
    green: '#90EE90', // Light Green
    purple: '#E6E6FA', // Lavender
  }
  return colorMap[color] || color
}

defineProps({
  title: {
    type: String,
    required: true,
  },
  justification: {
    type: String,
    required: true,
  },
  teams: {
    type: Array,
    required: true,
    validator: (teams) =>
      teams.every(
        (team) =>
          team.hasOwnProperty('name') &&
          team.hasOwnProperty('color') &&
          team.hasOwnProperty('members') &&
          team.hasOwnProperty('justification') &&
          team.hasOwnProperty('totalCost')
      ),
  },
})
</script>
