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
        @update:model-value="handleSkillsUpdate"
      >
        <template v-slot:prepend-inner>
          <v-icon>mdi-code-tags</v-icon>
        </template>
        <template v-slot:chip="{ props, item }">
          <v-chip v-bind="props" :text="item.raw.name || item.raw">
            {{ item.raw.name || item.raw }}
            <v-tooltip activator="parent" location="top">
              Proficiency:
              {{ getProficiencyFromValue(item.raw?.proficiencyLevel) }}
            </v-tooltip>
          </v-chip>
        </template>
      </v-combobox>

      <!-- Skill Details Table -->
      <v-table v-if="localFormData.skills.length > 0" class="mt-4">
        <thead>
          <tr>
            <th>Skill</th>
            <th>Proficiency Level</th>
            <th>Years of Experience</th>
            <th>Last Used</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="skill in localFormData.skills" :key="skill.name">
            <td>{{ skill.name }}</td>
            <td>
              <v-select
                v-model="skill.proficiencyLevel"
                :items="proficiencyLevels"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="updateSkillDetails"
              ></v-select>
            </td>
            <td>
              <v-text-field
                v-model="skill.yearsOfExperience"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                step="0.5"
                min="0"
                @update:model-value="updateSkillDetails"
              ></v-text-field>
            </td>
            <td>
              <v-text-field
                v-model="skill.lastUsedDate"
                type="date"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="updateSkillDetails"
              ></v-text-field>
            </td>
          </tr>
        </tbody>
      </v-table>
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

const proficiencyLevels = [
  { title: 'Beginner', value: 1 },
  { title: 'Intermediate', value: 2 },
  { title: 'Advanced', value: 3 },
  { title: 'Expert', value: 4 },
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

const handleSkillsUpdate = (value) => {
  if (!Array.isArray(value)) return
  console.log('Incoming skills:', value)

  localFormData.value.skills = value.map((skill) => {
    console.log('Processing skill:', skill)
    if (typeof skill === 'string') {
      // Handle new or custom skills
      return {
        name: skill,
        proficiencyLevel: 1,
        yearsOfExperience: 0,
        lastUsedDate: new Date().toISOString().split('T')[0],
      }
    }
    // Return existing skills as is, ensuring proficiencyLevel is preserved
    return {
      ...skill,
      name: skill.name || skill,
      proficiencyLevel:
        typeof skill.proficiencyLevel === 'string'
          ? skill.proficiencyLevel // Keep string values like "Expert"
          : parseInt(skill.proficiencyLevel) || 1,
    }
  })

  console.log('Updated skills:', localFormData.value.skills)
  updateSkillDetails()
}

const getProficiencyFromValue = (level) => {
  // Handle string proficiency levels
  if (typeof level === 'string') {
    const profLevel = proficiencyLevels.find((p) => p.title === level)
    return level // Return the string value directly if it's a title
  }

  // Handle numeric proficiency levels
  return getProficiencyTitle(level)
}

const getProficiencyTitle = (level) => {
  const profLevel = proficiencyLevels.find((p) => p.value === parseInt(level))
  return profLevel ? profLevel.title : 'Beginner'
}

const updateSkillDetails = () => {
  emit('update:model-value', {
    ...props.modelValue,
    skills: localFormData.value.skills,
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

:deep(.v-table) {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

:deep(.v-table th) {
  background-color: #f5f5f5;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1rem;
}

:deep(.v-table td) {
  padding: 8px;
}
</style>
