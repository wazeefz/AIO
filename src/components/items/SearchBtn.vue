<template v-slot:top>
  <v-toolbar flat>
    <v-text-field
      class="bg-primaryBrown"
      v-model="search"
      append-icon="mdi-magnify"
      label="Search"
      single-line
      hide-details
    ></v-text-field>
  </v-toolbar>
</template>
