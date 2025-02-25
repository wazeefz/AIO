<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 px-4 pt-4">
      <v-icon color="#B1A184" class="mr-2">mdi-account-star</v-icon>
      Employee Assessment
    </v-card-title>

    <v-card-text>
      <!-- Initial Interview Assessment -->
      <div class="mb-6">
        <h3 class="text-subtitle-1 font-weight-bold mb-4 custom-title">
          Initial Interview Assessment
        </h3>
        <v-row>
          <!-- Technical Skills -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 custom-label"
                >Technical Skills Knowledge</span
              >
              <div class="d-flex align-center">
                <v-rating
                  v-model="localRatings.interview[0].rating"
                  @update:model-value="updateInterviewRating(0, $event)"
                  color="#B1A184"
                  hover
                  half-increments
                  length="5"
                  size="small"
                ></v-rating>
                <span class="ml-2 text-body-2 rating-value"
                  >{{ localRatings.interview[0].rating }}/5</span
                >
              </div>
            </div>
          </v-col>

          <!-- Soft Skills -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 custom-label">Soft Skills</span>
              <div class="d-flex align-center">
                <v-rating
                  v-model="localRatings.interview[1].rating"
                  @update:model-value="updateInterviewRating(1, $event)"
                  color="#B1A184"
                  hover
                  half-increments
                  length="5"
                  size="small"
                ></v-rating>
                <span class="ml-2 text-body-2 rating-value"
                  >{{ localRatings.interview[1].rating }}/5</span
                >
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Interview Remarks -->

        <v-textarea
          v-model="localRatings.interviewRemarks"
          @update:model-value="updateInterviewRemarks"
          label="Interview Remarks (Optional)"
          variant="outlined"
          rows="3"
          class="mt-4 custom-textarea"
          color="#B1A184"
          hide-details
          :rules="[(v) => !v || v.length <= 500 || 'Max 500 characters']"
        ></v-textarea>
      </div>

      <!-- Project Performance Assessment -->
      <div class="mt-6">
        <div class="d-flex align-center justify-space-between mb-4">
          <h3 class="text-subtitle-1 font-weight-bold custom-title">
            Project Performance Assessment
          </h3>
          <v-btn
            color="#B1A184"
            variant="outlined"
            size="small"
            @click="openAddProjectDialog"
            class="custom-btn"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Project
          </v-btn>
        </div>

        <v-expansion-panels v-if="hasProjects" variant="accordion">
          <v-expansion-panel class="custom-panel">
            <v-expansion-panel-title class="custom-panel-title">
              <div class="d-flex align-center">
                <span class="custom-label">Overall Performance Rating</span>
                <v-tooltip location="top" class="ml-2">
                  <template v-slot:activator="{ props }">
                    <v-chip
                      v-bind="props"
                      class="ml-2"
                      :color="getRatingColor(consolidatedScore)"
                      text-color="white"
                    >
                      {{ consolidatedScore }}%
                    </v-chip>
                  </template>
                  <div class="rating-legend">
                    <div class="legend-title mb-2">
                      Performance Rating Legend
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-chip
                        color="success"
                        size="small"
                        class="legend-chip"
                        variant="elevated"
                        >≥ 90%</v-chip
                      >
                      <span class="legend-text">Exceptional</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-chip
                        color="info"
                        size="small"
                        class="legend-chip"
                        variant="elevated"
                        >75-89%</v-chip
                      >
                      <span class="legend-text">Meeting Expectations</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-chip
                        color="warning"
                        size="small"
                        class="legend-chip"
                        variant="elevated"
                        >60-74%</v-chip
                      >
                      <span class="legend-text">Needs Improvement</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-chip
                        color="error"
                        size="small"
                        class="legend-chip"
                        variant="elevated"
                        >< 60%</v-chip
                      >
                      <span class="legend-text">Unsatisfactory</span>
                    </div>
                  </div>
                </v-tooltip>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-table class="custom-table">
                <thead>
                  <tr>
                    <th class="text-left custom-table-header">Project ID</th>
                    <th class="text-left custom-table-header">Project</th>
                    <th class="text-left custom-table-header">Period</th>
                    <th class="text-left custom-table-header">Technical</th>
                    <th class="text-left custom-table-header">Quality</th>
                    <th class="text-left custom-table-header">Collaboration</th>
                    <th class="text-left custom-table-header">Overall</th>
                    <th class="text-left custom-table-header">Actions</th>
                    <th class="text-left custom-table-header">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(project, index) in localRatings.projects"
                    :key="index"
                  >
                    <td>{{ project.projectId }}</td>
                    <td>{{ project.name }}</td>
                    <td>{{ project.period }}</td>
                    <td>
                      <v-progress-linear
                        v-model="project.technical"
                        @update:model-value="
                          updateProjectRating(index, 'technical', $event)
                        "
                        color="#B1A184"
                        height="20"
                        class="custom-progress"
                      >
                        <template v-slot:default="{ value }">
                          <span class="white--text"
                            >{{ Math.ceil(value) }}%</span
                          >
                        </template>
                      </v-progress-linear>
                    </td>
                    <td>
                      <v-progress-linear
                        v-model="project.quality"
                        @update:model-value="
                          updateProjectRating(index, 'quality', $event)
                        "
                        color="#B1A184"
                        height="20"
                        class="custom-progress"
                      >
                        <template v-slot:default="{ value }">
                          <span class="white--text"
                            >{{ Math.ceil(value) }}%</span
                          >
                        </template>
                      </v-progress-linear>
                    </td>
                    <td>
                      <v-progress-linear
                        v-model="project.collaboration"
                        @update:model-value="
                          updateProjectRating(index, 'collaboration', $event)
                        "
                        color="#B1A184"
                        height="20"
                        class="custom-progress"
                      >
                        <template v-slot:default="{ value }">
                          <span class="white--text"
                            >{{ Math.ceil(value) }}%</span
                          >
                        </template>
                      </v-progress-linear>
                    </td>
                    <td>
                      <v-chip
                        :color="getRatingColor(getProjectAverage(project))"
                        text-color="white"
                        class="custom-chip"
                      >
                        {{ getProjectAverage(project) }}%
                      </v-chip>
                    </td>
                    <td class="remarks-cell">
                      <v-tooltip location="top" v-if="project.remarks">
                        <template v-slot:activator="{ props }">
                          <span v-bind="props" class="remarks-text">{{
                            project.remarks
                          }}</span>
                        </template>
                        <span>{{ project.remarks }}</span>
                      </v-tooltip>
                      <span v-else class="text-disabled">No remarks</span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <v-btn
                          icon="mdi-pencil"
                          size="small"
                          variant="text"
                          color="#B1A184"
                          @click="editProject(index)"
                        ></v-btn>
                        <v-btn
                          icon="mdi-delete"
                          size="small"
                          variant="text"
                          color="error"
                          @click="confirmDeleteProject(index)"
                        ></v-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-card
          v-else
          class="pa-4 d-flex align-center justify-center custom-empty-state"
          flat
        >
          <div class="text-center">
            <v-icon
              icon="mdi-clipboard-text-outline"
              size="40"
              color="#B1A184"
              class="mb-2"
            ></v-icon>
            <div class="text-body-1 custom-empty-text mb-2">
              No project assessments available yet.
            </div>
            <v-btn
              color="#B1A184"
              variant="outlined"
              size="small"
              @click="openAddProjectDialog"
              class="custom-btn"
            >
              <v-icon start>mdi-plus</v-icon>
              Add Project
            </v-btn>
          </div>
        </v-card>

        <!-- Add/Edit Project Dialog -->
        <v-dialog v-model="projectDialog.show" max-width="700px">
          <v-card>
            <v-card-title class="text-h6 pa-4">
              {{
                projectDialog.isEdit
                  ? 'Edit Project Assessment'
                  : 'Add New Project Assessment'
              }}
            </v-card-title>
            <v-card-text>
              <v-form ref="projectForm" v-model="isProjectFormValid">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="projectDialog.data.projectId"
                      label="Project ID"
                      :rules="[(v) => !!v || 'Project ID is required']"
                      variant="outlined"
                      color="#B1A184"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="projectDialog.data.name"
                      label="Project Name"
                      :rules="[(v) => !!v || 'Project name is required']"
                      variant="outlined"
                      color="#B1A184"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="projectDialog.data.period"
                      label="Project Period (e.g., Q1 2024)"
                      :rules="[(v) => !!v || 'Project period is required']"
                      variant="outlined"
                      color="#B1A184"
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-divider class="my-4"></v-divider>

                <h4 class="text-subtitle-1 mb-4">Project Ratings</h4>

                <v-row>
                  <v-col cols="12" md="4">
                    <label class="text-body-2 mb-2 d-block"
                      >Technical Skills ({{
                        projectDialog.data.technical
                      }}%)</label
                    >
                    <v-slider
                      v-model="projectDialog.data.technical"
                      color="#B1A184"
                      step="5"
                      thumb-label
                      min="0"
                      max="100"
                    ></v-slider>
                  </v-col>

                  <v-col cols="12" md="4">
                    <label class="text-body-2 mb-2 d-block"
                      >Quality ({{ projectDialog.data.quality }}%)</label
                    >
                    <v-slider
                      v-model="projectDialog.data.quality"
                      color="#B1A184"
                      step="5"
                      thumb-label
                      min="0"
                      max="100"
                    ></v-slider>
                  </v-col>

                  <v-col cols="12" md="4">
                    <label class="text-body-2 mb-2 d-block"
                      >Collaboration ({{
                        projectDialog.data.collaboration
                      }}%)</label
                    >
                    <v-slider
                      v-model="projectDialog.data.collaboration"
                      color="#B1A184"
                      step="5"
                      thumb-label
                      min="0"
                      max="100"
                    ></v-slider>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <label class="text-body-2 mb-2 d-block"
                      >Remarks (Optional)</label
                    >
                    <v-textarea
                      v-model="projectDialog.data.remarks"
                      variant="outlined"
                      rows="2"
                      hide-details
                      class="custom-textarea"
                      placeholder="Add any additional comments about the project performance"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                @click="closeProjectDialog"
                class="custom-btn-text"
              >
                Cancel
              </v-btn>
              <v-btn
                color="#B1A184"
                @click="saveProject"
                :disabled="!isProjectFormValid"
                class="custom-btn-primary"
              >
                {{ projectDialog.isEdit ? 'Save Changes' : 'Add Project' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Delete Confirmation Dialog -->
        <v-dialog v-model="deleteDialog.show" max-width="400px">
          <v-card>
            <v-card-title class="text-h6 pa-4">Confirm Delete</v-card-title>
            <v-card-text>
              Are you sure you want to delete this project assessment? This
              action cannot be undone.
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                @click="deleteDialog.show = false"
                class="custom-btn-text"
              >
                Cancel
              </v-btn>
              <v-btn
                color="error"
                @click="deleteProject"
                class="custom-btn-primary"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({
      interview: [
        { rating: 0 }, // Technical Skills
        { rating: 0 }, // Soft Skills
      ],
      interviewRemarks: '',
      projects: [],
    }),
  },
})

const emit = defineEmits(['update:modelValue'])

const localRatings = ref({
  interview: [{ rating: 0 }, { rating: 0 }],
  interviewRemarks: '',
  projects: [],
})

// Project form refs
const projectForm = ref(null)
const isProjectFormValid = ref(false)

// Project dialog state
const projectDialog = ref({
  show: false,
  isEdit: false,
  editIndex: -1,
  data: {
    projectId: '',
    name: '',
    period: '',
    technical: 0,
    quality: 0,
    collaboration: 0,
    remarks: '',
  },
})

// Delete dialog state
const deleteDialog = ref({
  show: false,
  index: -1,
})

// Add this computed property for the rating legend
const ratingLegend = computed(() =>
  `
  Performance Rating Legend:
  ≥ 90%: Exceptional (Green)
  75-89%: Meeting Expectations (Brown)
  60-74%: Needs Improvement (Orange)
  < 60%: Unsatisfactory (Red)
`.trim()
)

// Computed properties
const hasProjects = computed(() => {
  return localRatings.value.projects.length > 0
})

const consolidatedScore = computed(() => {
  if (!hasProjects.value) return 0

  const totalScore = localRatings.value.projects.reduce((acc, project) => {
    return acc + getProjectAverage(project)
  }, 0)

  return Math.ceil(totalScore / localRatings.value.projects.length)
})

// Methods
const updateInterviewRating = (index, value) => {
  localRatings.value.interview[index].rating = value
  emitUpdate()
}

const updateInterviewRemarks = (value) => {
  localRatings.value.interviewRemarks = value
  emitUpdate()
}

const updateProjectRating = (index, field, value) => {
  localRatings.value.projects[index][field] = value
  emitUpdate()
}

const getProjectAverage = (project) => {
  return Math.ceil(
    (project.technical + project.quality + project.collaboration) / 3
  )
}

const getRatingColor = (score) => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'info'
  if (score >= 60) return 'warning'
  return 'error'
}

const emitUpdate = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(localRatings.value)))
}

const resetProjectDialog = () => {
  projectDialog.value.data = {
    projectId: '',
    name: '',
    period: '',
    technical: 0,
    quality: 0,
    collaboration: 0,
    remarks: '',
  }
  projectDialog.value.isEdit = false
  projectDialog.value.editIndex = -1
}

const openAddProjectDialog = () => {
  resetProjectDialog()
  projectDialog.value.show = true
}

const editProject = (index) => {
  const project = { ...localRatings.value.projects[index] }
  projectDialog.value.data = JSON.parse(JSON.stringify(project))
  projectDialog.value.isEdit = true
  projectDialog.value.editIndex = index
  projectDialog.value.show = true
}

const confirmDeleteProject = (index) => {
  deleteDialog.value.index = index
  deleteDialog.value.show = true
}

const deleteProject = () => {
  if (deleteDialog.value.index > -1) {
    localRatings.value.projects.splice(deleteDialog.value.index, 1)
    emitUpdate()
  }
  deleteDialog.value.show = false
  deleteDialog.value.index = -1
}

const closeProjectDialog = () => {
  projectDialog.value.show = false
  resetProjectDialog()
}

const saveProject = async () => {
  if (!projectForm.value) return

  const isValid = await projectForm.value.validate()
  if (!isValid) return

  if (projectDialog.value.isEdit) {
    // Update existing project
    localRatings.value.projects[projectDialog.value.editIndex] = {
      ...projectDialog.value.data,
    }
  } else {
    // Add new project
    localRatings.value.projects.push({
      ...projectDialog.value.data,
    })
  }

  emitUpdate()
  closeProjectDialog()
}

// Watch for changes in props
watch(
  () => props.modelValue,
  (newVal) => {
    localRatings.value = {
      interview: Array.isArray(newVal.interview)
        ? [...newVal.interview]
        : [{ rating: 0 }, { rating: 0 }],
      interviewRemarks: newVal.interviewRemarks || '',
      projects: Array.isArray(newVal.projects) ? [...newVal.projects] : [],
    }
  },
  { immediate: true, deep: true }
)

// Expose methods for parent component
defineExpose({
  addProjectAssessment: (projectName, period) => {
    localRatings.value.projects.push({
      projectId: `P${localRatings.value.projects.length + 1}`,
      name: projectName,
      period: period,
      technical: 0,
      quality: 0,
      collaboration: 0,
    })
    emitUpdate()
  },
})
</script>

<style scoped>
.custom-title {
  color: #b1a184;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.custom-label {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
}

.rating-value {
  color: #b1a184;
  font-weight: 500;
}

.custom-textarea :deep(.v-input__control) {
  border-color: #b1a184;
}

.custom-textarea :deep(.v-field__input) {
  color: rgba(0, 0, 0, 0.87) !important;
  font-size: 0.875rem !important;
}

.custom-textarea :deep(.v-field--variant-outlined) {
  border-color: rgba(177, 161, 132, 0.5);
}

.custom-textarea :deep(.v-field--variant-outlined:focus-within) {
  border-color: #b1a184;
}

.custom-panel {
  background-color: transparent !important;
  border: 1px solid rgba(177, 161, 132, 0.2) !important;
}

.custom-panel-title {
  color: rgba(0, 0, 0, 0.87) !important;
  font-weight: 500;
}

.custom-table {
  background-color: transparent !important;
}

.custom-table-header {
  color: #b1a184 !important;
  font-weight: 500 !important;
  font-size: 0.875rem !important;
}

.custom-progress {
  border-radius: 4px;
  overflow: hidden;
}

.custom-progress :deep(.v-progress-linear__background) {
  opacity: 0.2;
}

.custom-chip {
  font-weight: 500;
}

.custom-empty-state {
  border: 1px dashed rgba(177, 161, 132, 0.5);
  background-color: rgba(177, 161, 132, 0.05) !important;
  min-height: 200px;
}

.custom-empty-text {
  color: rgba(0, 0, 0, 0.6);
}

.custom-btn {
  text-transform: none !important;
  letter-spacing: normal !important;
}

.custom-btn-text {
  color: rgba(0, 0, 0, 0.6) !important;
  text-transform: none !important;
}

.custom-btn-primary {
  text-transform: none !important;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-slider .v-slider-track__fill) {
  background-color: #b1a184 !important;
}

:deep(.v-slider .v-slider-thumb) {
  color: #b1a184 !important;
}

:deep(.v-slider .v-slider-thumb__label) {
  background-color: #b1a184 !important;
}

:deep(.v-divider) {
  border-color: rgba(177, 161, 132, 0.2) !important;
}

:deep(.v-expansion-panel) {
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.v-expansion-panel-title) {
  padding: 16px !important;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
}

:deep(.v-table) {
  background-color: transparent;
}

:deep(.v-card) {
  box-shadow: none !important;
  border: 1px solid rgba(177, 161, 132, 0.2);
}

:deep(.v-expansion-panel:hover) {
  background-color: rgba(177, 161, 132, 0.05) !important;
}

:deep(.v-progress-linear:hover) {
  cursor: pointer;
  opacity: 0.9;
}

:deep(.v-expansion-panel--active) {
  border-color: #b1a184 !important;
}

:deep(.v-table tbody tr:hover) {
  background-color: rgba(177, 161, 132, 0.05) !important;
}

:deep(.v-dialog > .v-card) {
  border-radius: 8px;
}

:deep(.v-card-title) {
  color: #b1a184;
}

.remarks-cell {
  max-width: 200px;
}

.remarks-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.87);
}

:deep(.v-tooltip .v-overlay__content) {
  background-color: rgba(97, 97, 97, 0.9) !important;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: pre-line;
}

.text-disabled {
  color: rgba(0, 0, 0, 0.38);
  font-style: italic;
}

.rating-legend {
  padding: 12px;
  min-width: 240px;
  border-radius: 8px;
}

.legend-title {
  font-weight: 500;
  font-size: 0.875rem;
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 6px;
  margin-bottom: 12px;
  text-align: center;
}

.legend-chip {
  min-width: 65px;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.legend-chip:hover {
  transform: scale(1.05);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.legend-text {
  color: white;
  margin-left: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

:deep(.v-tooltip .v-overlay__content) {
  background: transparent !important;
  border-radius: 8px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: tooltip-fade 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes tooltip-fade {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Optional: Add hover effect to the main rating chip */
.rating-chip:hover {
  cursor: help;
  opacity: 0.9;
}

/* Optional: Add subtle hover effect to the rows */
.d-flex.align-center {
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.d-flex.align-center:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
