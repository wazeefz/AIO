<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 px-4 pt-4">
      <v-icon color="#B1A184" class="mr-2">mdi-map-marker</v-icon>
      Current Location & Relocation
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="localFormData.currentCountry"
            @update:model-value="updateField('currentCountry', $event)"
            :items="countries"
            label="Current Country"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-earth</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.currentCity"
            @update:model-value="updateField('currentCity', $event)"
            label="Current City"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-city</v-icon>
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="12">
          <v-switch
            v-model="localFormData.willingToRelocate"
            @update:model-value="updateField('willingToRelocate', $event)"
            label="Willing to Relocate"
            color="#B1A184"
            hide-details
            class="mb-4"
          ></v-switch>
        </v-col>

        <v-col cols="12" v-if="localFormData.willingToRelocate">
          <v-combobox
            v-model="localFormData.relocationPreferences"
            @update:model-value="updateField('relocationPreferences', $event)"
            :items="countries"
            label="Preferred Relocation Locations"
            multiple
            chips
            closable-chips
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-map-marker-multiple</v-icon>
            </template>
          </v-combobox>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      currentCountry: '',
      currentCity: '',
      willingToRelocate: false,
      relocationPreferences: [],
    }),
  },
  rules: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const countries = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'Singapore',
  'United Arab Emirates',
  'Saudi Arabia',
  'China',
  'India',
  'Brazil',
]

// Local form data
const localFormData = ref({
  currentCountry: '',
  currentCity: '',
  willingToRelocate: false,
  relocationPreferences: [],
})

// Initialize local form data
watch(
  () => props.modelValue,
  (newVal) => {
    localFormData.value = {
      currentCountry: newVal.currentCountry || '',
      currentCity: newVal.currentCity || '',
      willingToRelocate: newVal.willingToRelocate || false,
      relocationPreferences: newVal.relocationPreferences || [],
    }
  },
  { immediate: true, deep: true }
)

const updateField = (field, value) => {
  localFormData.value[field] = value

  // If turning off willingToRelocate, clear relocationPreferences
  if (field === 'willingToRelocate' && !value) {
    localFormData.value.relocationPreferences = []
  }

  emit('update:modelValue', {
    ...props.modelValue,
    ...localFormData.value,
  })
}
</script>

<style scoped>
:deep(.v-switch .v-selection-control) {
  margin-inline-start: 0;
}

:deep(.v-switch .v-label) {
  opacity: 1;
  color: var(--v-theme-on-surface);
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(
    .v-switch
      .v-selection-control__input
      > .v-selection-control__wrapper.v-selection-control__wrapper--active
  ) {
  color: #b1a184 !important;
}

:deep(
    .v-switch .v-selection-control__input:hover > .v-selection-control__wrapper
  ) {
  background: rgba(177, 161, 132, 0.04);
}

:deep(.v-switch--inset .v-switch__track) {
  opacity: 0.2;
}

:deep(.v-switch--inset .v-switch__track--active) {
  opacity: 1;
}

:deep(.v-selection-control-group) {
  margin-top: 0;
}
</style>
