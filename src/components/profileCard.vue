<template>
  <div>
    <!-- Card remains the same -->
    <v-card class="mb-4 pa-4 cursor-pointer" @click="openModal">
      <v-card-title>{{ result.title }}</v-card-title>
      <v-card-subtitle>{{ result.company }}</v-card-subtitle>
      <v-card-text>
        <div><strong>Department:</strong> {{ result.department }}</div>
        <div><strong>Salary:</strong> {{ result.salary }}</div>
        <div>
          <strong>Skills:</strong>
          <v-chip
            v-for="skill in result.skills"
            :key="skill"
            size="small"
            class="mr-2 mt-2"
          >
            {{ skill }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Modified Modal -->
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

              <h3 class="text-h6 mt-4">Skill set</h3>
              <v-chip
                v-for="skill in result.skills"
                :key="skill"
                size="small"
                class="mr-2 mt-2"
              >
                {{ skill }}
              </v-chip>
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

<script>
import { ref } from 'vue'

export default {
  name: 'ProfileCard',
  props: {
    result: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const showModal = ref(false)

    const openModal = () => {
      showModal.value = true
      emit('modal-opened', props.result)
    }

    const closeModal = () => {
      showModal.value = false
      emit('modal-closed')
    }

    return {
      showModal,
      openModal,
      closeModal,
    }
  },
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}
</style>
