<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 px-4 pt-4">
      <v-icon color="#B1A184" class="mr-2">mdi-lightning-bolt</v-icon>
      Skills
    </v-card-title>
    <v-card-text>
      <v-combobox
        v-model="localFormData.skills"
        :items="availableSkills"
        label="Skills"
        multiple
        chips
        closable-chips
        :rules="[rules.required]"
        variant="outlined"
        density="comfortable"
        @update:model-value="updateField('skills', $event)"
      >
        <template v-slot:prepend-inner>
          <v-icon>mdi-code-tags</v-icon>
        </template>
      </v-combobox>
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
      skills: [],
    }),
  },
  rules: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:model-value'])

const availableSkills = [
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'C#',
  'Ruby',
  'PHP',
  'Swift',
  'Go',
  'HTML5',
  'CSS3',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'TypeScript',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'AWS',
  'Azure',
  'Docker',
  'Kubernetes',
  'Git',
  'REST API',
  'GraphQL',
  'Machine Learning',
  'Data Analysis',
  'UI/UX Design',
]

const localFormData = ref({
  skills: [],
})

watch(
  () => props.modelValue,
  (newVal) => {
    localFormData.value = {
      skills: Array.isArray(newVal.skills) ? [...newVal.skills] : [],
    }
  },
  { immediate: true, deep: true }
)

const updateField = (field, value) => {
  const cleanedValue = Array.isArray(value) ? value.filter(Boolean) : []
  localFormData.value[field] = cleanedValue

  emit('update:model-value', {
    ...props.modelValue,
    [field]: cleanedValue,
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

:deep(.v-chip) {
  margin: 2px;
}

:deep(.v-combobox__selection) {
  margin: 2px;
}

:deep(.v-field__input) {
  padding: 8px !important;
}
</style>
