<template>
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
</template>

<script setup>
import BaseChips from '@/components/Chips.vue'
import { computed } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close-modal'])

const skillChips = computed(() => {
  return props.result.skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})

const closeModal = () => {
  emit('close-modal')
}
</script>
