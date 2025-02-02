<template>
  <v-app>
    <v-main>
      <v-container>
        <JustificationAndAnalysis
          title="Team Selection & Justification"
          :justification="overviewText"
          :teams="teams"
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import JustificationAndAnalysis from '@/components/JustificationCards'

const overviewText =
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
</script>
