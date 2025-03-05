<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 px-4 pt-4">
      <v-icon color="#B1A184" class="mr-2">mdi-account</v-icon>
      Personal Information
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.firstName"
            label="First Name"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateFormData"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.lastName"
            label="Last Name"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateFormData"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.email"
            label="Email"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateFormData"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.phone"
            label="Phone"
            :rules="[rules.required, rules.phone]"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateFormData"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="dateInput"
            label="Date of Birth (YYYY/MM/DD)"
            :rules="[rules.required, rules.dateFormat]"
            variant="outlined"
            density="comfortable"
            placeholder="YYYY/MM/DD"
            @input="handleDateInput"
            @blur="validateAndFormatDate"
            maxlength="10"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-calendar</v-icon>
            </template>
          </v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field
            v-model="localFormData.age"
            label="Age"
            type="number"
            :rules="[rules.required, rules.age]"
            variant="outlined"
            density="comfortable"
            readonly
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="localFormData.gender"
            :items="['Male', 'Female', 'Other']"
            label="Gender"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateFormData"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-gender-male-female</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="localFormData.maritalStatus"
            :items="maritalStatusOptions"
            label="Marital Status"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            @update:modelValue="updateFormData"
          >
            <template v-slot:prepend-inner>
              <v-icon>mdi-account-heart</v-icon>
            </template>
          </v-select>
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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      age: '',
      gender: '',
      maritalStatus: '',
    }),
  },
  rules: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const maritalStatusOptions = [
  'Single',
  'Married',
  'Divorced',
  'Widowed',
  'Separated',
  'Other',
]

const localFormData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  maritalStatus: '',
})

// Separate ref for date input to handle formatting independently
const dateInput = ref('')

// Watch for changes in modelValue prop and update local data
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      localFormData.value = { ...newValue }
      dateInput.value = newValue.dateOfBirth || ''
    }
  },
  { immediate: true, deep: true }
)

// Watch for changes in dateOfBirth from parent
watch(
  () => props.modelValue.dateOfBirth,
  (newValue) => {
    if (newValue !== dateInput.value) {
      dateInput.value = newValue || ''
    }
  }
)

// Watch for changes in dateInput and update localFormData
watch(
  () => dateInput.value,
  (newValue) => {
    localFormData.value.dateOfBirth = newValue
  }
)

const handleDateInput = (event) => {
  const input = event.target.value
  const cursorPosition = event.target.selectionStart

  // Allow direct editing without auto-formatting during typing
  // This prevents the cursor from jumping around
  dateInput.value = input

  // Restore cursor position after Vue updates the DOM
  setTimeout(() => {
    event.target.setSelectionRange(cursorPosition, cursorPosition)
  }, 0)
}

const validateAndFormatDate = () => {
  if (!dateInput.value) {
    localFormData.value.age = ''
    updateFormData()
    return
  }

  // Format the date when the field loses focus
  let formattedDate = dateInput.value.replace(/[^0-9/]/g, '')

  // Handle cases where user might have typed digits without slashes
  if (!formattedDate.includes('/')) {
    // Handle different input patterns
    if (formattedDate.length === 8) {
      // YYYYMMDD format (e.g., 19990829)
      formattedDate = `${formattedDate.substring(
        0,
        4
      )}/${formattedDate.substring(4, 6)}/${formattedDate.substring(6, 8)}`
    } else if (formattedDate.length === 7) {
      // YYYY and single digits for month/day (e.g., 1999829)
      // Determine if month is single digit or day is single digit
      const year = formattedDate.substring(0, 4)
      const monthDay = formattedDate.substring(4)

      if (monthDay.length === 3) {
        // Format is YYYY and M/DD (e.g., 1999829 -> 1999/08/29)
        const month = monthDay.substring(0, 1)
        const day = monthDay.substring(1)
        formattedDate = `${year}/${month.padStart(2, '0')}/${day}`
      }
    } else if (formattedDate.length === 6) {
      // YYYY and single digits for both month and day (e.g., 199979)
      const year = formattedDate.substring(0, 4)
      const month = formattedDate.substring(4, 5)
      const day = formattedDate.substring(5, 6)
      formattedDate = `${year}/${month.padStart(2, '0')}/${day.padStart(
        2,
        '0'
      )}`
    }
  } else {
    // Handle cases where some slashes are already present
    const parts = formattedDate.split('/')

    if (parts.length === 3) {
      // All parts are present, ensure proper padding
      const [year, month, day] = parts
      formattedDate = `${year}/${month.padStart(2, '0')}/${day.padStart(
        2,
        '0'
      )}`
    } else if (parts.length === 2) {
      // Only one slash is present
      const [year, rest] = parts

      if (rest.length === 1) {
        // Single digit month with no day yet
        formattedDate = `${year}/${rest.padStart(2, '0')}/`
      } else if (rest.length === 2) {
        // Two digit month with no day yet
        formattedDate = `${year}/${rest}/`
      } else if (rest.length === 3) {
        // Month and single digit day
        const month = rest.substring(0, 1)
        const day = rest.substring(1)
        formattedDate = `${year}/${month.padStart(2, '0')}/${day.padStart(
          2,
          '0'
        )}`
      } else if (rest.length >= 4) {
        // Month and day are both present
        const month = rest.substring(0, 2)
        const day = rest.substring(2)
        formattedDate = `${year}/${month}/${day.padStart(2, '0')}`
      }
    }
  }

  // Ensure proper slash placement if not already handled
  if (formattedDate.length >= 4 && !formattedDate.includes('/')) {
    formattedDate = `${formattedDate.substring(0, 4)}/${formattedDate.substring(
      4
    )}`
  }

  if (formattedDate.length >= 7 && formattedDate.split('/').length < 3) {
    const parts = formattedDate.split('/')
    if (parts.length === 2 && parts[1].length >= 2) {
      formattedDate = `${parts[0]}/${parts[1].substring(
        0,
        2
      )}/${parts[1].substring(2)}`
    }
  }

  // Update the input field with properly formatted date
  dateInput.value = formattedDate
  localFormData.value.dateOfBirth = formattedDate

  // Calculate age if date is valid
  if (formattedDate.split('/').length === 3) {
    const isValid = props.rules.dateFormat(formattedDate)
    if (isValid === true) {
      localFormData.value.age = calculateAge(formattedDate)
    } else {
      localFormData.value.age = ''
    }
  } else {
    localFormData.value.age = ''
  }

  updateFormData()
}

const calculateAge = (birthDate) => {
  if (!birthDate) return ''
  const [year, month, day] = birthDate.split('/')
  const birth = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const updateFormData = () => {
  emit('update:modelValue', { ...localFormData.value })
}
</script>

<style scoped>
:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-text-field .v-input__details) {
  padding-inline: 16px;
}
</style>
