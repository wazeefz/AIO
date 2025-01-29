<template>
  <div class="profile-card-container">
    <!-- Remove Button -->
    <RemoveButton v-if="isEditing" @remove="confirmAndRemove" />

    <!-- Profile Card Content -->
    <ProfileCardContent :result="result" @open-modal="openModal">
      <template #skills="{ skills }">
        <ProfileCardSkills :skills="skills" />
      </template>
    </ProfileCardContent>

    <!-- Profile Card Modal -->
    <ProfileCardModal :result="result" @close-modal="closeModal">
      <template #modal-content="{ result, skills }">
        <div class="mt-4">
          <h3 class="text-h6 mt-4">Department</h3>
          <p>{{ result.department }}</p>

          <h3 class="text-h6 mt-4">Salary</h3>
          <p>{{ result.salary }}</p>

          <h3 class="text-h6 mt-4">Employment Type</h3>
          <p>{{ result.employment }}</p>

          <h3 class="text-h6 mt-4">Required Skills</h3>
          <ProfileCardSkills :skills="skills" />
        </div>
      </template>
    </ProfileCardModal>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import RemoveButton from '@/components/items/RemoveButton.vue'
import ProfileCardContent from '@/components/items/ProfileCardContent.vue'
import ProfileCardModal from '@/components/items/ProfileCardModal.vue'
import ProfileCardSkills from '@/components/items/ProfileCardSkills.vue'
import { ref } from 'vue'

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

const emit = defineEmits(['remove-profile'])
const showModal = ref(false)

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const confirmAndRemove = () => {
  emit('remove-profile', props.result.id)
}
</script>

<style scoped>
.profile-card-container {
  position: relative;
}
</style>
