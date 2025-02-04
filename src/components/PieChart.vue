<template>
  <div>
    <div>
      <b>{{ title }}</b>
    </div>
    <div :id="chartId"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as dc from 'dc'
import 'dc/src/compat/d3v6'

const props = defineProps({
  dimension: {
    type: Object,
    required: true,
  },
  group: Object,
  title: String,
  chartId: String,
})

const pieChart = ref(null)

onMounted(() => {
  generatePieChart()
})

function generatePieChart() {
  const group =
    props.group ||
    props.dimension.group().reduce(
      (p) => p + 1,
      (p) => p - 1,
      () => 0
    )

  pieChart.value = dc.pieChart(`#${props.chartId}`)
  pieChart.value
    .width(0)
    .height(150)
    .radius(150)
    .innerRadius(50)
    .dimension(props.dimension)
    .group(group)
    .legend(dc.legend().x(0).y(160).gap(5))
    .on('filtered', function (chart) {
      dc.redrawAll()
    })

  pieChart.value.render()
}
</script>