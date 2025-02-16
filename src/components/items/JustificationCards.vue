<template>
  <!-- <v-app>
    <v-main> -->
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
      <v-col v-for="(team, index) in teams" :key="team.name" cols="12" sm="6">
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
  <!-- </v-main>
  </v-app> -->
</template>

<script setup>
const title = 'Team Selection & Justification'
const justification =
  'AIO has recommended a diverse team of 40 members from Marketing, Sales, IT, and external resources, selected based on their skills, experience, and alignment with the tasks required for the market research project.'

const teams = [
  {
    name: 'Marketing Team',
    color: 'blue',
    justification:
      'The Marketing Team has a diverse mix of senior and junior professionals with expertise in market research, strategy development, and consumer behavior analysis. This team will lead data collection, consumer insights, and strategy development.',
    members: [
      {
        name: 'John Doe',
        experience: '5-10 years',
        strengths: 'Data analysis, survey design',
        mandays: 200,
        cost: '$500/day',
      },
      {
        name: 'Jane Smith',
        experience: '7+ years',
        strengths: 'Market research, strategy development',
        mandays: 200,
        cost: '$500/day',
      },
    ],
    totalCost: '$700,000',
  },
  {
    name: 'Sales Team',
    color: 'red',
    justification:
      'The Sales Team includes a combination of senior and junior members with expertise in market segmentation, product positioning, and sales forecasting. This team will align product offerings with customer needs and guide adjustments based on insights.',
    members: [
      {
        name: 'Michael Johnson',
        experience: '3-7 years',
        strengths: 'Product positioning, sales forecasting',
        mandays: 150,
        cost: '$450/day',
      },
      {
        name: 'Emily Davis',
        experience: '4-6 years',
        strengths: 'Customer relationship management',
        mandays: 150,
        cost: '$450/day',
      },
    ],
    totalCost: '$405,000',
  },
  {
    name: 'IT Team',
    color: 'yellow',
    justification:
      'The IT Team has members with expertise in big data analytics, machine learning, and cloud services. They will be responsible for integrating data platforms and optimizing the technology infrastructure to support the market research project.',
    members: [
      {
        name: 'David Lee',
        experience: '4-8 years',
        strengths: 'Data analytics, cloud services',
        mandays: 250,
        cost: '$600/day',
      },
      {
        name: 'Sarah Kim',
        experience: '5-7 years',
        strengths: 'Platform optimization',
        mandays: 250,
        cost: '$600/day',
      },
    ],
    totalCost: '$1,000,000',
  },
  {
    name: 'External Resources',
    color: 'orange',
    justification:
      'The External Resources team includes specialists and consultants with extensive experience in global market trends, competitor analysis, and statistical research. They will provide external insights, market intelligence, and prevent internal biases.',
    members: [
      {
        name: 'Alex Chen',
        experience: '7-10 years',
        strengths: 'Market intelligence, competitor analysis',
        mandays: 100,
        cost: '$700/day',
      },
      {
        name: 'Julie Park',
        experience: '3-5 years',
        strengths: 'Market research',
        mandays: 100,
        cost: '$700/day',
      },
    ],
    totalCost: '$280,000',
  },
  {
    name: 'Finance Team',
    color: 'green',
    justification:
      'The Finance Team has experts in financial modeling, budgeting, and cost optimization. They will ensure the project stays within budget and provide financial insights to support decision-making.',
    members: [
      {
        name: 'Lisa Chen',
        experience: '6-9 years',
        strengths: 'Financial modeling, budgeting',
        mandays: 180,
        cost: '$650/day',
      },
      {
        name: 'Tom Nguyen',
        experience: '4-7 years',
        strengths: 'Cost optimization, data analysis',
        mandays: 170,
        cost: '$600/day',
      },
    ],
    totalCost: '$350,000',
  },
  {
    name: 'Project Management Team',
    color: 'purple',
    justification:
      'The Project Management Team has extensive experience in leading complex, cross-functional projects. They will be responsible for coordinating the various teams, tracking progress, and ensuring timely delivery of project milestones.',
    members: [
      {
        name: 'Jessica Park',
        experience: '8-12 years',
        strengths: 'Project management, stakeholder coordination',
        mandays: 220,
        cost: '$750/day',
      },
      {
        name: 'Michael Lee',
        experience: '5-9 years',
        strengths: 'Risk management, change control',
        mandays: 200,
        cost: '$700/day',
      },
    ],
    totalCost: '$420,000',
  },
]

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
</script>
