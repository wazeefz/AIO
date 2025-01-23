<!-- profileCard.vue -->
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
        <!-- Cancel Button (Visible only in edit mode) -->
        <v-btn
          v-if="isEditing"
          icon="mdi-close"
          variant="text"
          size="small"
          class="cancel-button"
          @click.stop="removeProfile"
        ></v-btn>

        <!-- Card Header Slot -->
        <slot name="card-header" :result="result">
          <v-card-title class="text-h5 font-weight-medium pa-0 text-white mb-1">
            {{ result.title }}
          </v-card-title>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.department }}
          </v-card-subtitle>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.salary }}
          </v-card-subtitle>
          <v-card-subtitle class="pa-0 text-white mb-4">
            {{ result.employment }}
          </v-card-subtitle>
        </slot>

        <!-- Skills Slot -->
        <slot name="skills" :skills="skillChips">
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
          </div>
        </slot>
      </v-card-text>
    </v-card>

    <!-- Modal -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card>
        <!-- Modal Header Slot -->
        <slot name="modal-header" :result="result" :close="closeModal">
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
        </slot>

        <v-card-text>
          <slot name="modal-content" :result="result" :skills="skillChips">
            <!-- Default modal content -->
            <div class="mt-4">
              <h3 class="text-h6 mt-4">Department</h3>
              <p>{{ result.department }}</p>

              <h3 class="text-h6 mt-4">Salary</h3>
              <p>{{ result.salary }}</p>

              <h3 class="text-h6 mt-4">Employment Type</h3>
              <p>{{ result.employment }}</p>

              <h3 class="text-h6 mt-4">Required Skills</h3>
              <base-chips :chips="skillChips" :use-color-mapping="true" />
            </div>
          </slot>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <slot name="modal-actions" :close="closeModal" :result="result">
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
  isEditing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['modal-opened', 'modal-closed', 'remove-profile'])
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

const removeProfile = () => {
  emit('remove-profile', props.result.id)
}
</script>

<style scoped>
.cancel-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}
</style>
