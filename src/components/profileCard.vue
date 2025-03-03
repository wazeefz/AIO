<template>
  <div class="profile-card-container">
    <!-- Remove Button with confirmation dialog -->
    <v-btn
      v-if="isEditing && !selectable"
      icon="mdi-close"
      variant="text"
      size="small"
      class="cancel-button"
      @click.stop="confirmRemove"
    >
    </v-btn>

    <!-- Confirmation Dialog for Removal-->
    <v-dialog v-model="showConfirmDialog" max-width="300">
      <v-card>
        <v-card-title class="text-h6"> Confirm Removal </v-card-title>
        <v-card-text> Are you sure you want to remove this item? </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" text @click="confirmAndRemove"> Remove </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Card -->
    <v-card
      class="mb-4 profile-card cursor-pointer"
      @click="openModal"
      color="#c2b7a4"
      rounded="lg"
    >
      <v-card-text class="pa-6">
        <div class="d-flex">
          <!-- Team Lead Badge -->
          <div
            v-if="result.role && result.role.toLowerCase().includes('lead')"
            class="team-lead-badge"
          >
            <v-tooltip text="Team Lead">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  icon="mdi-account-multiple"
                  color="white"
                  size="20"
                ></v-icon>
              </template>
            </v-tooltip>
          </div>
          <!-- Profile Image -->
          <div class="profile-image-container mr-4">
            <v-avatar size="80" :rounded="true" class="rounded-lg">
              <v-img
                :src="profileImageUrl"
                :alt="getDisplayName"
                cover
                class="profile-image"
              ></v-img>
            </v-avatar>
          </div>

          <!-- Profile Info -->
          <div class="profile-info">
            <slot name="card-header" :result="result">
              <div class="text-h5 font-weight-medium text-white mt-1">
                {{ getDisplayName }}
              </div>
              <v-divider
                class="my-4"
                bg-color="white"
                thickness="2"
              ></v-divider>
              <div class="text-subtitle-1 text-white mb-2">
                <v-icon size="small" color="white" class="mr-1"
                  >mdi-briefcase</v-icon
                >
                <span class="text-white">{{ getJobTitle }}</span>
              </div>
              <div class="text-subtitle-1 text-white mb-2">
                <v-icon size="small" color="white" class="mr-1"
                  >mdi-sitemap</v-icon
                >
                <span class="text-white">{{ assignmentDetails.role }} </span>
              </div>
              <div class="d-flex align-center mb-2">
                <v-icon size="small" color="white" class="mr-1"
                  >mdi-cash</v-icon
                >
                <span class="text-white">{{ getSalaryDisplay }} </span>
              </div>
              <div class="text-subtitle-2 text-white mb-4">
                Department: {{ getDepartmentDisplay }}
              </div>
              <!-- Skills Section -->
              <div v-if="result.skills && result.skills.length > 0">
                <div class="text-subtitle-2 text-white mb-2">
                  <v-icon size="small" color="white" class="mr-1"
                    >mdi-lightbulb</v-icon
                  >
                  Skills
                </div>
                <div
                  ref="skillsContainer"
                  class="d-flex flex-wrap gap-2 skills-container"
                >
                  <template
                    v-for="(skill, index) in visibleSkills"
                    :key="index"
                  >
                    <v-chip
                      ref="skillChips"
                      variant="elevated"
                      class="mr-2 mb-2 skill-chip"
                      color="#2d2d2d"
                      text-color="white"
                      size="small"
                    >
                      {{ skill }}
                    </v-chip>
                  </template>
                  <v-chip
                    v-if="hiddenSkillsCount > 0"
                    ref="overflowChip"
                    variant="elevated"
                    class="mr-2 mb-2 overflow-chip"
                    color="#2d2d2d"
                    text-color="white"
                    size="small"
                  >
                    +{{ hiddenSkillsCount }}
                  </v-chip>
                </div>
              </div>
            </slot>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Modal -->
    <v-dialog v-model="showModal" max-width="600px">
      <v-card class="modal-card">
        <!-- Modal Header Slot -->
        <slot name="modal-header" :result="result" :close="closeModal">
          <div class="modal-header">
            <!-- Profile Image -->
            <div class="profile-image-container">
              <v-avatar size="80" :rounded="true" class="rounded-lg">
                <v-img
                  :src="profileImageUrl"
                  :alt="getDisplayName"
                  cover
                  class="profile-image"
                ></v-img>
              </v-avatar>
            </div>
            <div class="mb-14">
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="closeModal"
              ></v-btn>
            </div>
          </div>
          <div class="d-flex align-center justify-space-between pl-4">
            <v-card-title class="text-h5 pa-0">
              {{ getDisplayName }}
            </v-card-title>
          </div>
        </slot>

        <v-card-text class="modal-content">
          <slot name="modal-content" :result="result">
            <div class="mt-4">
              <h3 class="text-h6 mt-4">Title</h3>
              <p>{{ getJobTitle }}</p>

              <h3 class="text-h6 mt-4">Department</h3>
              <p>{{ getDepartmentDisplay }}</p>

              <template v-if="isTeamMember">
                <h3 class="text-h6 mt-4">Role In Project</h3>
                <p>{{ assignmentDetails.role }}</p>

                <h3 class="text-h6 mt-4">Assignment Period</h3>
                <p>From: {{ assignmentDetails.assignment_start_date }}</p>
                <p>To: {{ assignmentDetails.assignment_end_date }}</p>
              </template>

              <h3 class="text-h6 mt-4">Salary</h3>
              <p>{{ getSalaryDisplay }}</p>

              <!-- Skills Section in Modal -->
              <template v-if="result.skills && result.skills.length > 0">
                <h3 class="text-h6 mt-4">Skills</h3>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <v-chip
                    v-for="(skill, index) in result.skills"
                    :key="index"
                    variant="elevated"
                    class="mr-2 mb-2"
                    color="primary"
                    size="small"
                  >
                    {{ skill }}
                  </v-chip>
                </div>
              </template>
            </div>
          </slot>
        </v-card-text>

        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <slot name="modal-actions" :close="closeModal" :result="result">
            <!-- Check if it's being called by addProfileModal -->
            <template v-if="isAddMode">
              <v-btn color="error" variant="text" @click="closeModal"
                >Cancel</v-btn
              >
              <v-btn
                color="primary"
                :disabled="isTeamMember"
                @click="showAddConfirmation = true"
              >
                Add to Team
              </v-btn>
            </template>
            <!-- Default close button for normal view -->
            <template v-else>
              <v-btn color="primary" variant="text" @click="closeModal">
                Close
              </v-btn>
            </template>
          </slot>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Team Member Confirmation Dialog -->
    <v-dialog v-model="showAddConfirmation" max-width="500px" persistent>
      <v-card>
        <v-card-title class="text-h6">
          Confirm Team Member Addition
        </v-card-title>
        <v-card-text>
          <v-alert v-if="addError" type="error" class="mb-4" closable>
            {{ addError }}
          </v-alert>

          <p class="mb-4">
            Add <strong>{{ getDisplayName }}</strong> to
            <strong>{{
              projectStore.getCurrentProject?.name || 'the current project'
            }}</strong
            >?
          </p>

          <!-- Role input field - REQUIRED -->
          <v-text-field
            v-model="assignmentRole"
            label="Role in Project*"
            placeholder="e.g. Developer, Designer, Project Manager"
            hint="This field is required"
            :rules="[(v) => !!v || 'Role is required']"
            class="mb-4"
            :disabled="addLoading"
            required
          ></v-text-field>

          <!-- Optional Assignment Dates -->
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                Additional Details (Optional)
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-menu
                      v-model="startDateMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      min-width="auto"
                    >
                      <template v-slot:activator="{ props }">
                        <v-text-field
                          v-model="assignmentStartDate"
                          label="Start Date"
                          readonly
                          v-bind="props"
                          clearable
                          @click:clear="assignmentStartDate = null"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="assignmentStartDate"
                        @update:model-value="startDateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-menu
                      v-model="endDateMenu"
                      :close-on-content-click="false"
                      transition="scale-transition"
                      min-width="auto"
                    >
                      <template v-slot:activator="{ props }">
                        <v-text-field
                          v-model="assignmentEndDate"
                          label="End Date"
                          readonly
                          v-bind="props"
                          clearable
                          @click:clear="assignmentEndDate = null"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                        v-model="assignmentEndDate"
                        @update:model-value="endDateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="cancelAddMember"
            :disabled="addLoading"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="handleAddTeamMember"
            :loading="addLoading"
            :disabled="addLoading || !assignmentRole"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import BaseChips from '@/components/Chips.vue'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useProjectManagementStore } from '@/stores/projectStore'
import placeholderImage from '@/assets/profilePic/placeholder.png'

const projectStore = useProjectManagementStore()

const props = defineProps({
  result: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value === 'object'
    },
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
  isAddMode: {
    type: Boolean,
    default: false,
  },
  forceTeamMember: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'modal-opened',
  'modal-closed',
  'remove-profile',
  'confirm-add-profile',
])
const showModal = ref(false)
const showConfirmDialog = ref(false)
const showAddConfirmation = ref(false)
const addLoading = ref(false)
const addError = ref(null)
const assignmentRole = ref('')
const assignmentStartDate = ref(null)
const assignmentEndDate = ref(null)
const startDateMenu = ref(false)
const endDateMenu = ref(false)
const visibleCount = ref(0) // Initialize to 0 instead of undefined skills length
const skillsContainer = ref(null)
const skillChips = ref([])
const resizeObserver = ref(null)

// Data for skills with null check
const skillChipsData = computed(() => {
  const skills = props.result.skills || [] // Provide default empty array if skills is undefined
  return skills.map((skill) => ({
    label: skill,
    category: 'skills',
  }))
})

const visibleSkills = computed(() => {
  return props.result.skills
    ? props.result.skills.slice(0, visibleCount.value)
    : []
})

const hiddenSkillsCount = computed(() => {
  return props.result.skills
    ? Math.max(0, props.result.skills.length - visibleCount.value)
    : 0
})

const calculateVisibleChips = async () => {
  if (!skillsContainer.value || !props.result.skills) return

  // Set initial visible count to the total number of skills
  visibleCount.value = props.result.skills.length

  await nextTick()

  const containerWidth = skillsContainer.value.offsetWidth
  const chipGap = 8
  const overflowChipWidth = 60

  // Get all chip elements
  const chipElements = Array.from(
    skillsContainer.value.querySelectorAll('.skill-chip')
  )

  // Early return if no chips
  if (chipElements.length === 0) return

  // Calculate total width needed for each chip
  const chipWidths = chipElements.map((chip) => chip.offsetWidth + chipGap)
  const totalWidth = chipWidths.reduce((sum, width) => sum + width, 0)

  // If all chips fit, show them all
  if (totalWidth <= containerWidth) {
    visibleCount.value = chipElements.length
    return
  }

  // Otherwise, calculate how many fit with overflow chip
  let availableWidth = containerWidth - overflowChipWidth
  let totalUsedWidth = 0
  let visibleChips = 0

  for (const chipWidth of chipWidths) {
    if (totalUsedWidth + chipWidth > availableWidth) break
    totalUsedWidth += chipWidth
    visibleChips++
  }

  // Ensure at least one chip is visible
  visibleCount.value = Math.max(1, visibleChips)
}

// Initialize resize observer with debounce
onMounted(() => {
  if (skillsContainer.value) {
    let timeoutId = null
    resizeObserver.value = new ResizeObserver(() => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      // Set new timeout
      timeoutId = setTimeout(() => {
        // Reset visible count before recalculating
        visibleCount.value = skillChipsData.value.length
        nextTick(() => {
          calculateVisibleChips()
        })
      }, 100) // Debounce time of 100ms
    })
    resizeObserver.value.observe(skillsContainer.value)
  }
  calculateVisibleChips()
})

// Watch for container width changes
watch(
  () => skillsContainer.value?.offsetWidth,
  (newWidth, oldWidth) => {
    if (skillsContainer.value && newWidth !== oldWidth) {
      // Reset visible count before recalculating
      visibleCount.value = skillChipsData.value.length
      nextTick(() => {
        calculateVisibleChips()
      })
    }
  }
)

// Watch for changes in skills data
watch(
  () => props.result.skills,
  () => {
    // Reset visible count before recalculating
    visibleCount.value = skillChipsData.value.length
    nextTick(() => {
      calculateVisibleChips()
    })
  },
  { deep: true }
)

// Local method to get profile picture
const profileImageUrl = computed(() => {
  try {
    console.log('Profile Picture Prop:', props.result.profilePicture) // Debugging: Log the prop value

    // If profilePicture is undefined or null, return the placeholder
    if (!props.result.profilePicture) {
      console.warn('Profile picture is undefined or null. Using placeholder.')
      return placeholderImage
    }

    // If it's a URL (starts with http/https)
    if (props.result.profilePicture.match(/^https?:\/\//)) {
      console.log('Profile picture is a URL:', props.result.profilePicture)
      return props.result.profilePicture
    }

    // For local assets, use the direct import
    try {
      const imagePath = `../assets/profilePic/${props.result.profilePicture}`
      console.log('Attempting to load local image:', imagePath) // Debugging: Log the image path

      const imageUrl = new URL(imagePath, import.meta.url).href
      console.log('Local image URL:', imageUrl) // Debugging: Log the generated URL

      return imageUrl
    } catch (error) {
      console.error('Error loading local image:', error)
      return placeholderImage
    }
  } catch (error) {
    console.error('Error in profileImageUrl:', error)
    return placeholderImage
  }
})

const openModal = () => {
  showModal.value = true
  emit('modal-opened', props.result)
}

const closeModal = () => {
  showModal.value = false
  showAddConfirmation.value = false
  addError.value = null
  assignmentRole.value = ''
  assignmentStartDate.value = null
  assignmentEndDate.value = null
  emit('modal-closed')
}

const confirmRemove = (event) => {
  event.stopPropagation()
  showConfirmDialog.value = true
}

const confirmAndRemove = () => {
  if (isTeamMember.value) {
    handleRemoveTeamMember()
  } else {
    emit('remove-profile', props.result.talent_id || props.result.id)
  }
  showConfirmDialog.value = false
}

const handleConfirmAdd = () => {
  if (props.isAddMode && !isTeamMember.value) {
    showAddConfirmation.value = true
  } else {
    emit('confirm-add-profile', props.result)
    closeModal()
  }
}

// Add computed property to check if talent is in current project team
const isTeamMember = computed(() => {
  // If forceTeamMember is true, always return true (useful for explicit team member views)
  if (props.forceTeamMember) return true

  const currentProjectTeam = projectStore.getCurrentProjectTeam
  const talentId = props.result.talent_id

  // If we don't have a team or talent ID, they're not a member
  if (!currentProjectTeam || !talentId) return false

  // Check if the talent is in the current project team
  return currentProjectTeam.some((member) => member.talent_id === talentId)
})

// Update assignmentDetails to use the team member data if available
const assignmentDetails = computed(() => {
  if (isTeamMember.value) {
    // Find the team member data
    const teamMemberData = projectStore.getCurrentProjectTeam.find(
      (member) => member.talent_id === props.result.talent_id
    )

    if (teamMemberData) {
      return {
        role: teamMemberData.role || 'Not Assigned',
        performance_rating: teamMemberData.performance_rating || 'N/A',
        assignment_start_date: teamMemberData.assignment_start_date
          ? new Date(teamMemberData.assignment_start_date).toLocaleDateString()
          : 'Not Set',
        assignment_end_date: teamMemberData.assignment_end_date
          ? new Date(teamMemberData.assignment_end_date).toLocaleDateString()
          : 'Not Set',
      }
    }
  }

  // Fallback to default data
  return {
    role: props.result.role || 'Not Assigned',
    performance_rating: props.result.performance_rating || 'N/A',
    assignment_start_date: props.result.assignment_start_date
      ? new Date(props.result.assignment_start_date).toLocaleDateString()
      : 'Not Set',
    assignment_end_date: props.result.assignment_end_date
      ? new Date(props.result.assignment_end_date).toLocaleDateString()
      : 'Not Set',
  }
})

// Update getDisplayName to handle both talent and team member formats
const getDisplayName = computed(() => {
  if (props.result.first_name && props.result.last_name) {
    return `${props.result.first_name} ${props.result.last_name}`.trim()
  }
  if (props.result.name) {
    return props.result.name
  }
  return 'No Name'
})

// Handle salary/rate display
const getSalaryDisplay = computed(() => {
  const salary =
    props.result.basic_salary || props.result.salary || props.result.daily_rate
  return salary ? `RM${salary.toLocaleString()}` : 'N/A'
})

// Handle department display
const getDepartmentDisplay = computed(() => {
  return props.result.department_name || props.result.department || 'N/A'
})

// Handle job title display
const getJobTitle = computed(() => {
  return props.result.job_title || props.result.title || 'No title'
})

// Methods for project assignment actions
const handleRemoveTeamMember = async () => {
  try {
    const projectId = projectStore.getCurrentProject?.project_id
    if (!projectId) throw new Error('No current project selected')

    await projectStore.removeTeamMember(projectId, props.result.talent_id)
    showConfirmDialog.value = false
    emit('remove-profile', props.result.talent_id)
  } catch (error) {
    console.error('Error removing team member:', error)
  }
}

const cancelAddMember = () => {
  showAddConfirmation.value = false
  addError.value = null
  assignmentRole.value = ''
  assignmentStartDate.value = null
  assignmentEndDate.value = null
}

const handleAddTeamMember = async () => {
  try {
    // Validate role field
    if (!assignmentRole.value) {
      addError.value = 'Role is required'
      return
    }

    addLoading.value = true
    addError.value = null

    const projectId = projectStore.getCurrentProject?.project_id
    if (!projectId) throw new Error('No current project selected')

    // Prepare the assignment data with the required role
    const assignmentData = {
      project_id: projectId,
      talent_id: props.result.talent_id,
      role: assignmentRole.value,
    }

    // Add optional dates if provided
    if (assignmentStartDate.value) {
      assignmentData.assignment_start_date = assignmentStartDate.value
    }

    if (assignmentEndDate.value) {
      assignmentData.assignment_end_date = assignmentEndDate.value
    }

    // Use createProjectAssignment method directly to pass all assignment data
    await projectStore.createProjectAssignment(assignmentData)

    showAddConfirmation.value = false
    emit('confirm-add-profile', props.result)
    closeModal()
  } catch (error) {
    addError.value =
      error.message || 'Failed to add team member. Please try again.'
    console.error('Error adding team member:', error)
  } finally {
    addLoading.value = false
  }
}
</script>

<style scoped>
.profile-card-container {
  position: relative;
}

.selection-checkbox {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
}

.profile-card.selected {
  opacity: 0.7;
  transform: scale(0.98);
}

.remove-button {
  position: absolute;
  top: -12px;
  right: -12px;
  z-index: 2;
  background-color: #ff5252;
  border: 2px solid white;
  transition: transform 0.2s ease;
}

.remove-button:hover {
  transform: scale(1.1);
}

.profile-card {
  position: relative;
  overflow: hidden;
  --ring-color: rgba(255, 255, 255, 0.05);
}

.cancel-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
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

.skills-container {
  max-width: 100%;
  min-height: 32px;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.skill-chip {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.overflow-chip {
  min-width: 45px;
  text-align: center;
}

/*For profile picture rounding */
.rounded-lg {
  border-radius: 16px !important;
}

.team-lead-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4px;
  border-radius: 4px;
}

/* Modal styles */
.modal-card {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.modal-actions {
  position: sticky;
  bottom: 0;
  background: white;
  z-index: 1;
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
