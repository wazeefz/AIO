<template>
  <v-row>
    <v-row class="d-flex justify-end ma-8">
      <Star />
    </v-row>
    <!-- Add the three pastel cards here -->
    <div class="container">
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card class="pastel-card pastel-blue">
            <v-card-text>
              <!-- Add card content here -->
              This is Marcus and john's first collaboration!
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pastel-card pastel-pink">
            <v-card-text>
              <!-- Add card content here -->
              John has worked on 10 projects in the past month. Maybe it's time
              for a well derseved rest?
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pastel-card pastel-green">
            <v-card-text>
              <!-- Add card content here -->
              Jane and Ali have nevwe worked on a project like this before
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-row>
</template>

<style scoped>
/* Add pastel color classes and hover effects */
/* .pastel-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  box-shadow: 0 16px 16px rgba(0, 0, 0, 2);
} */

.pastel-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  background-color: #f0f0f0;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 9px 8px 0px 3px rgba(0, 0, 0, 1);
}

.pastel-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 16px rgba(0, 0, 0, 0.1);
}

.pastel-blue {
  background-color: #a8d1e6; /* Light pastel blue */
}

.pastel-pink {
  background-color: #f5c3cb; /* Light pastel pink */
}

.pastel-green {
  background-color: #b4e0b4; /* Light pastel green */
}

.container {
  display: flex;
  gap: 20px;
  padding: 20px;
}
</style>
