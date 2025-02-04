<template>
  <div>
    <!-- Top Stats Section -->
    <v-row>
      <v-col cols="4">
        <StatCard
          title=""
          value="Agile"
          subtitle="Suggested Framework"
          icon="mdi-briefcase"
        />
      </v-col>
      <v-col cols="4">
        <StatCard
          title=""
          value="5,000,000"
          subtitle="Total Cost"
          icon="mdi-currency-usd"
        />
      </v-col>
      <v-col cols="4">
        <StatCard
          title=""
          value="5 months"
          subtitle="Estimated Timeframe"
          icon="mdi-clock"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="6">
        <PieChart
          :dimension="departmentDimension"
          :group="departmentGroup"
          title="People by Department"
          chartId="pie-department"
        />
      </v-col>
      <v-col cols="6">
        <PieChart
          :dimension="skillDimension"
          title="People by Skill"
          chartId="pie-skill"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <BarChart
          :dimension="departmentDimension"
          :group="totalWageByDepartmentGroup"
          title="Total Wage by Department"
          chartId="bar-total-wage-department"
        />
      </v-col>
      <v-col cols="6">
        <DataTable table-type="people" :ndx="ndx" />
      </v-col>
    </v-row>
    <div class="reset-section">
      <v-btn @click="resetAllFilters" color="primary">Reset All Filters</v-btn>
    </div>
  </div>
</template>

<script setup>
import { useTalentStore } from '@/stores/talent'
import crossfilter from 'crossfilter2'
import BarChart from '@/components/BarChart.vue'
import PieChart from '@/components/PieChart.vue'
import DataTable from '@/components/DataTable.vue'
import * as dc from 'dc'

const talentStore = useTalentStore()

const ndx = crossfilter(talentStore.talents)
const departmentDimension = ndx.dimension((d) => d.department)
const departmentGroup = departmentDimension.group()
const skillDimension = ndx.dimension((d) => d.skill, true)
const totalWageByDepartmentGroup = departmentDimension
  .group()
  .reduceSum((d) => d.wage)

const resetAllFilters = () => {
  dc.filterAll()
  dc.redrawAll()
}
</script>

<style scoped>
.reset-section {
  padding: 16px;
  text-align: right;
}
</style>
