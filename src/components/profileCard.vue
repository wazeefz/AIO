<template>
  <div>
    <!-- Card -->
    <v-card
      class="mb-4 profile-card cursor-pointer"
      @click="openModal"
      color="#c2b7a4"
      rounded="lg"
    >
      <v-card-text class="pa-6">
        <v-card-title class="text-h5 font-weight-medium pa-0 text-white mb-1">
          {{ result.title }}
        </v-card-title>
        <v-card-subtitle class="pa-0 text-white mb-4">
          {{ result.department }}
        </v-card-subtitle>
        <v-card-subtitle class="pa-0 text-white mb-4">
          {{ result.salary }}
        </v-card-subtitle>

        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="skill in skillChips"
            :key="skill.label"
            variant="elevated"
            class="mr-2 mb-2"
            color="#2d2d2d"
            text-color="white"
          >
            {{ skill.label }}
          </v-chip>
          <v-chip
            v-if="result.tools"
            v-for="tool in result.tools"
            :key="tool"
            variant="elevated"
            class="mr-2 mb-2"
            color="#2d2d2d"
            text-color="white"
          >
            {{ tool }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Modal remains the same -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <div class="d-flex align-center justify-space-between pa-4">
          <v-card-title class="text-h5 pa-0">
            {{ result.title }}
          </v-card-title>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeModal"
          ></v-btn>
        </div>

        <v-card-text>
          <slot name="modal-content">
            <!-- Default modal content -->
            <div class="mt-4">
              <h3 class="text-h6">Company</h3>
              <p>{{ result.company }}</p>

              <h3 class="text-h6 mt-4">Department</h3>
              <p>{{ result.department }}</p>

              <h3 class="text-h6 mt-4">Salary</h3>
              <p>{{ result.salary }}</p>

              <h3 class="text-h6 mt-4">Required Skills</h3>
              <base-chips :chips="skillChips" :use-color-mapping="true" />
            </div>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <slot name="modal-actions">
            <!-- Default actions -->
            <v-btn color="primary" variant="text" @click="closeModal">
              Close
            </v-btn>
          </slot>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import BaseChips from '@/components/Chips.vue'
import { ref, computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['modal-opened', 'modal-closed'])
const showModal = ref(false)

const skillChips = computed(() => {
  return props.result.skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})

const openModal = () => {
  showModal.value = true
  emit('modal-opened', props.result)
}

const closeModal = () => {
  showModal.value = false
  emit('modal-closed')
}
</script>

<style scoped>
.profile-card {
  position: relative;
  overflow: hidden;
  --ring-color: rgba(255, 255, 255, 0.05);
}

/* First ring */
.profile-card::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Second ring */
.profile-card::after {
  content: '';
  position: absolute;
  top: -150px;
  right: -150px;
  width: 400px;
  height: 400px;
  border: 2px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
}

/* Third ring */
.profile-card .v-card-text::before {
  content: '';
  position: absolute;
  top: -200px;
  right: -200px;
  width: 500px;
  height: 500px;
  border: 2px solid var(--ring-color);
  border-radius: 50%;
}

/* Fourth ring */
.profile-card .v-card-text::after {
  content: '';
  position: absolute;
  top: -250px;
  right: -250px;
  width: 600px;
  height: 600px;
  border: 2px solid var(--ring-color);
  border-radius: 50%;
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
