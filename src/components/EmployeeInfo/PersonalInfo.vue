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
            v-model="localFormData.dateOfBirth"
            label="Date of Birth (YYYY/MM/DD)"
            :rules="[rules.required, rules.dateFormat]"
            variant="outlined"
            density="comfortable"
            placeholder="YYYY/MM/DD"
            @input="formatDateInput"
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

// Watch for changes in modelValue prop and update local data
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      localFormData.value = { ...newValue }
    }
  },
  { immediate: true, deep: true }
)

const formatDateInput = (event) => {
  let value = event.target.value.replace(/\D/g, '')

  if (value.length > 0) {
    if (value.length > 4) {
      value = value.slice(0, 4) + '/' + value.slice(4)
    }
    if (value.length > 7) {
      value = value.slice(0, 7) + '/' + value.slice(7)
    }
    value = value.slice(0, 10)
  }

  localFormData.value.dateOfBirth = value

  if (value.length === 10) {
    const isValid = props.rules.dateFormat(value)
    if (isValid === true) {
      localFormData.value.age = calculateAge(value)
    } else {
      localFormData.value.age = ''
    }
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
