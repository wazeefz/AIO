<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 px-4 pt-4">
      <v-icon color="#B1A184" class="mr-2">mdi-currency-usd</v-icon>
      Salary
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="displayValue"
            @input="handleInput"
            label="Basic Salary"
            prefix="MYR"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            placeholder="0.00"
            type="text"
          ></v-text-field>
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
  },
  rules: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:model-value'])

const displayValue = ref('0.00')

// Initialize value
watch(
  () => props.modelValue.salary,
  (newVal) => {
    if (newVal) {
      displayValue.value = newVal
    } else {
      displayValue.value = '0.00'
    }
  },
  { immediate: true }
)

function handleInput(event) {
  // Get input value and remove non-digits
  let value = event.target.value.replace(/[^\d]/g, '')

  // Handle backspace/delete
  if (value.length === 0) {
    displayValue.value = '0.00'
    emitValue('0.00')
    return
  }

  // Convert to number format with 2 decimal places
  const numericValue = parseFloat(value) / 100

  // Format with commas and fixed decimal places
  const formattedValue = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  displayValue.value = formattedValue
  emitValue(formattedValue)
}

function emitValue(value) {
  emit('update:model-value', {
    ...props.modelValue,
    salary: value,
  })
}
</script>

<style scoped>
:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-field--focused) {
  --v-field-border-color: #b1a184 !important;
}

:deep(.v-input--is-focused) {
  --v-field-border-color: #b1a184 !important;
}

:deep(.v-text-field input) {
  text-align: right;
  padding-right: 8px;
  font-family: monospace;
}

:deep(.v-field__prefix) {
  padding-right: 8px;
}
</style>
