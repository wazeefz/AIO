<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 px-4 pt-4">
      <v-icon color="#B1A184" class="mr-2">mdi-text-box</v-icon>
      Professional Summary
    </v-card-title>
    <v-card-text>
      <v-textarea
        v-model="localFormData.summary"
        @update:model-value="updateField('summary', $event)"
        label="Professional Summary"
        variant="outlined"
        rows="4"
        :rules="[rules.required]"
        counter
        maxlength="500"
      ></v-textarea>

      <v-text-field
        v-model="localFormData.experience"
        @update:model-value="updateField('experience', $event)"
        label="Years of Experience"
        type="number"
        :rules="[rules.required, rules.experience]"
        variant="outlined"
        density="comfortable"
        class="mt-4"
      >
        <template v-slot:prepend-inner>
          <v-icon>mdi-briefcase-clock</v-icon>
        </template>
      </v-text-field>
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
      summary: '',
      experience: '',
    }),
  },
  rules: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

// Local form data
const localFormData = ref({
  summary: '',
  experience: '',
})

// Initialize local form data and watch for changes
watch(
  () => props.modelValue,
  (newVal) => {
    localFormData.value = {
      summary: newVal.summary || '',
      experience: newVal.experience || '',
    }
  },
  { immediate: true, deep: true }
)

const updateField = (field, value) => {
  localFormData.value[field] = value
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<style scoped>
:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-text-field .v-input__details) {
  padding-inline: 16px;
}

:deep(.v-textarea .v-input__details) {
  padding-inline: 16px;
}

:deep(.v-field--focused) {
  --v-field-border-color: #b1a184 !important;
}

:deep(.v-input--is-focused) {
  --v-field-border-color: #b1a184 !important;
}
</style>
