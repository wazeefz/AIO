<template>
  <div class="d-flex flex-column align-center justify-center fill-height">
    <div class="d-flex flex-column align-center justify-center mb-10">
      <p class="text-h3 font-weight-medium">All in One</p>
      <p class="font-weight-regular">How can we help you today?</p>
    </div>
    <div class="d-flex flex-row align-center justify-center ga-2">
      <div
        v-for="(item, index) in cards"
        :key="index"
        class="d-flex justify-center align-center flex-column w-30"
      >
        <p class="text-secondaryBlack font-weight-medium text-h6 mb-4">
          {{ item.title }}
        </p>
        <v-card
          :text="item.text"
          rounded="xl"
          class="text-white bg-secondaryBrown d-flex align-center text-center"
          max-width="300"
          height="100"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cards: [
        {
          title: 'Examples',
          text: '"Help me assemble a team for a React native project"',
        },
        {
          title: 'Capabilities',
          text: 'Recommend the most optimized team for your projects including your internal and external resources',
        },
        {
          title: 'Limitations',
          text: 'May miss over other key talents due to unclear input',
        },
      ],
    }
  },
}
</script>
