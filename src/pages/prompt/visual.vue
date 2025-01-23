<template>
  <div>
    <div class="reset-section">
      <v-btn @click="resetAllFilters" color="primary">Reset All Filters</v-btn>
    </div>

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
  </div>
</template>

<script setup>
import { useTalentStore } from '@/stores/talent'
import crossfilter from 'crossfilter2'
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
