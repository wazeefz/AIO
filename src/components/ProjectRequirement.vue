<template>
  <div class="form-container">
    <!-- Side Navigation -->
    <nav class="side-nav">
      <v-list density="compact" class="py-4">
        <v-list-item class="side-nav-header mb-4 px-4">
          <v-list-item-title class="text-h6 font-weight-medium">
            Project Requirements
          </v-list-item-title>
        </v-list-item>

        <v-divider class="mb-2"></v-divider>

        <div class="d-flex justify-space-around px-4 mb-4">
          <v-btn
            color="#B1A184"
            size="small"
            variant="outlined"
            @click="expandAll"
            class="flex-grow-1 mr-2"
          >
            <v-icon left size="small">mdi-unfold-more-horizontal</v-icon>
            Expand All
          </v-btn>
          <v-btn
            color="#B1A184"
            size="small"
            variant="outlined"
            @click="collapseAll"
            class="flex-grow-1"
          >
            <v-icon left size="small">mdi-unfold-less-horizontal</v-icon>
            Collapse All
          </v-btn>
        </div>

        <v-list-item
          v-for="(section, index) in sections"
          :key="index"
          :class="{
            'active-section': isActiveSection(section.value),
            'mb-1': true,
          }"
          @click="scrollToSection(section.value)"
          link
          class="mx-2 rounded"
        >
          <template v-slot:prepend>
            <v-icon :icon="section.icon" color="#B1A184" class="mr-2"></v-icon>
          </template>
          <v-list-item-title class="text-subtitle-2">
            {{ section.title }}
          </v-list-item-title>
        </v-list-item>

        <!-- Submit Project Button in Side Nav -->
        <v-list-item class="mt-4 px-4 button-container">
          <v-btn
            color="#B1A184"
            block
            size="large"
            class="submit-button"
            :loading="false"
            @click="handleSubmit"
            :disabled="loading"
          >
            <template v-if="!loading">
              <v-icon left class="mr-2">mdi-account-group</v-icon>
              Generate Team Report
            </template>
            <template v-else>
              <div class="loading-text">
                <span
                  v-for="(letter, index) in 'AI Assembling the Team...'.split(
                    ''
                  )"
                  :key="index"
                  :style="{ animationDelay: `${index * 0.05}s` }"
                  class="bounce-letter"
                >
                  {{ letter === ' ' ? '&nbsp;' : letter }}
                </span>
              </div>
            </template>
          </v-btn>

          <!-- Hint text below button -->
          <div class="button-hint mt-2">
            Click here once requirement(s) is finalized
          </div>
        </v-list-item>
      </v-list>
    </nav>

    <!-- Main Content -->
    <main class="main-content" ref="mainContent">
      <v-container>
        <v-card class="form-card">
          <v-card-title class="text-h4 mb-2 primary-color font-weight-medium">
            Project Requirements Form
          </v-card-title>
          <v-card-subtitle class="form-hint px-0">
            All fields are optional. For optimal results, please provide a
            project description and key technical requirements to help our AI
            identify the most suitable talent for your needs.
          </v-card-subtitle>

          <v-form @submit.prevent="handleSubmit" ref="form">
            <!-- Project Details (Moved to first position) -->
            <v-expansion-panels v-model="expandedPanels.details" id="details">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon color="#B1A184" class="mr-2"
                      >mdi-clipboard-text-outline</v-icon
                    >
                    <span>Project Details</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="section-content">
                    <v-text-field
                      v-model="formData.projectName"
                      label="Project Name"
                      hint="Enter the project name"
                      clearable
                    ></v-text-field>

                    <v-textarea
                      v-model="formData.description"
                      label="Project Description/Overview"
                      hint="Describe project objectives and scope"
                      rows="3"
                      clearable
                    ></v-textarea>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.industryDomain"
                          :items="industryDomains"
                          label="Industry Domain"
                          hint="Select or enter industry domain"
                          clearable
                        ></v-combobox>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.projectPhase"
                          :items="projectPhases"
                          label="Project Phase"
                          hint="Select or enter project phase"
                          clearable
                        ></v-combobox>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.projectScale"
                          :items="projectScales"
                          label="Project Scale"
                          hint="Select or enter project scale"
                          clearable
                        ></v-combobox>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.projectComplexity"
                          :items="complexityLevels"
                          label="Project Complexity"
                          hint="Select or enter complexity level"
                          clearable
                        ></v-combobox>
                      </v-col>
                    </v-row>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Project Classification -->
            <v-expansion-panels
              v-model="expandedPanels.classification"
              id="classification"
            >
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon color="#B1A184" class="mr-2"
                      >mdi-file-document-outline</v-icon
                    >
                    <span>Project Classification</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="section-content">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.department"
                          :items="departments"
                          label="Project Sponsor Department"
                          hint="Select or enter department"
                          @change="handleDepartmentChange"
                          clearable
                        ></v-combobox>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.projectType"
                          :items="getProjectTypes"
                          label="Project Type"
                          hint="Select or enter project type"
                          clearable
                        ></v-combobox>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="formData.sponsor"
                          label="Project Sponsor"
                          hint="Name of project sponsor"
                          clearable
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="formData.sponsorEmail"
                          label="Sponsor Email"
                          hint="Email of project sponsor"
                          type="email"
                          clearable
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Work Preferences -->
            <v-expansion-panels
              v-model="expandedPanels.workPreferences"
              id="workPreferences"
            >
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon color="#B1A184" class="mr-2"
                      >mdi-office-building-outline</v-icon
                    >
                    <span>Work Preferences</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="section-content">
                    <v-row>
                      <v-col cols="12" sm="4">
                        <v-combobox
                          v-model="formData.workLocation"
                          :items="workLocations"
                          label="Work Location"
                          hint="Select or enter work arrangement"
                          clearable
                        ></v-combobox>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-combobox
                          v-model="formData.timeZone"
                          :items="timeZones"
                          label="Time Zone"
                          hint="Select or enter time zone"
                          clearable
                        ></v-combobox>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-combobox
                          v-model="formData.projectLocation.country"
                          :items="countries"
                          label="Country"
                          @change="updateStates"
                          clearable
                        ></v-combobox>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.projectLocation.state"
                          :items="availableStates"
                          label="State"
                          @change="updateCities"
                          :disabled="!formData.projectLocation.country"
                          clearable
                        ></v-combobox>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-combobox
                          v-model="formData.projectLocation.city"
                          :items="availableCities"
                          label="City"
                          :disabled="!formData.projectLocation.state"
                          clearable
                        ></v-combobox>
                      </v-col>
                    </v-row>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Budget and Timeline -->
            <v-expansion-panels
              v-model="expandedPanels.budgetTimeline"
              id="budgetTimeline"
            >
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon color="#B1A184" class="mr-2"
                      >mdi-currency-usd</v-icon
                    >
                    <span>Budget & Timeline</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="section-content">
                    <v-row>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model="minBudgetDisplay"
                          @input="handleInput($event, 'minBudget')"
                          label="Minimum Budget"
                          prefix="MYR"
                          variant="outlined"
                          density="comfortable"
                          placeholder="0.00"
                          type="text"
                          hint="Minimum project budget"
                          clearable
                          @click:clear="() => handleClear('minBudget')"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model="maxBudgetDisplay"
                          @input="handleInput($event, 'maxBudget')"
                          label="Maximum Budget"
                          prefix="MYR"
                          variant="outlined"
                          density="comfortable"
                          placeholder="0.00"
                          type="text"
                          hint="Maximum project budget"
                          clearable
                          @click:clear="() => handleClear('maxBudget')"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="formData.duration"
                          label="Duration (months)"
                          type="number"
                          hint="Expected project duration"
                          clearable
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="formData.startDate"
                          label="Start Date"
                          type="date"
                          clearable
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="formData.endDate"
                          label="End Date"
                          type="date"
                          clearable
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Technical Requirements -->
            <v-expansion-panels
              v-model="expandedPanels.technical"
              id="technical"
            >
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon color="#B1A184" class="mr-2">mdi-tools</v-icon>
                    <span>Technical Requirements</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="section-content">
                    <div class="d-flex justify-space-between align-center mb-4">
                      <v-btn
                        color="#B1A184"
                        @click="addNewCategory"
                        size="small"
                      >
                        Add Category
                      </v-btn>
                    </div>

                    <div
                      v-for="(
                        category, categoryIndex
                      ) in formData.technicalRequirements"
                      :key="categoryIndex"
                      class="technical-category mb-6"
                    >
                      <!-- Category Name Row -->
                      <div class="d-flex align-center mb-4 gap-4">
                        <v-combobox
                          v-model="category.name"
                          :items="commonCategories"
                          label="Category Name"
                          hint="Enter or select category name"
                          clearable
                          variant="outlined"
                          density="comfortable"
                          class="flex-grow-1"
                        ></v-combobox>
                        <v-btn
                          color="error"
                          icon
                          @click="removeCategory(categoryIndex)"
                          size="small"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>

                      <div
                        v-for="(requirement, reqIndex) in category.requirements"
                        :key="reqIndex"
                        class="requirement-container mb-4"
                      >
                        <div class="requirement-box">
                          <!-- Basic Requirements Row -->
                          <v-row class="align-center mb-2">
                            <v-col cols="3">
                              <v-combobox
                                v-model="requirement.skill"
                                :items="getCommonSkills(category.name)"
                                label="Skill/Requirement"
                                hint="Enter required skill"
                                clearable
                                variant="outlined"
                                density="comfortable"
                              ></v-combobox>
                            </v-col>
                            <v-col cols="3">
                              <v-combobox
                                v-model="requirement.level"
                                :items="experienceLevels"
                                label="Level"
                                hint="Required skill level"
                                clearable
                                variant="outlined"
                                density="comfortable"
                              ></v-combobox>
                            </v-col>
                            <v-col cols="3">
                              <v-text-field
                                v-model.number="requirement.yearsRequired"
                                label="Years"
                                type="number"
                                hint="Years required"
                                clearable
                                variant="outlined"
                                density="comfortable"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="3">
                              <v-combobox
                                v-model="requirement.priority"
                                :items="priorityLevels"
                                label="Priority"
                                clearable
                                variant="outlined"
                                density="comfortable"
                              ></v-combobox>
                            </v-col>
                          </v-row>

                          <!-- Standards and Deliverables Row -->
                          <v-row class="align-center">
                            <v-col cols="6">
                              <v-combobox
                                v-model="requirement.certifications"
                                :items="professionalStandards"
                                label="Standards/Certifications"
                                multiple
                                chips
                                closable-chips
                                hint="Required certifications"
                                variant="outlined"
                                density="comfortable"
                              ></v-combobox>
                            </v-col>
                            <v-col cols="6">
                              <v-combobox
                                v-model="formData.keyDeliverables"
                                :items="deliverableTypes"
                                label="Key Deliverables"
                                multiple
                                chips
                                closable-chips
                                hint="Select or enter key deliverables"
                                variant="outlined"
                                density="comfortable"
                              ></v-combobox>
                            </v-col>
                          </v-row>
                        </div>

                        <!-- Remove Requirement Button -->
                        <v-btn
                          color="error"
                          icon
                          @click="removeRequirement(categoryIndex, reqIndex)"
                          size="small"
                          class="remove-requirement-btn"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>

                      <v-btn
                        color="#B1A184"
                        variant="text"
                        @click="addRequirement(categoryIndex)"
                        size="small"
                        class="ml-0 mt-2"
                      >
                        Add Requirement
                      </v-btn>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Team Composition -->
            <v-expansion-panels v-model="expandedPanels.team" id="team">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon color="#B1A184" class="mr-2"
                      >mdi-account-group-outline</v-icon
                    >
                    <span>Team Composition</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="section-content">
                    <div class="d-flex justify-space-between align-center mb-4">
                      <div>
                        Define required team roles and their specifications
                      </div>
                      <v-btn color="#B1A184" @click="addNewRole" size="small">
                        Add Role
                      </v-btn>
                    </div>

                    <div
                      v-for="(role, roleIndex) in formData.teamComposition"
                      :key="roleIndex"
                      class="team-role"
                    >
                      <v-row class="align-center">
                        <v-col cols="3">
                          <v-combobox
                            v-model="role.title"
                            :items="commonRoles"
                            label="Role Title"
                            hint="Enter or select role title"
                            clearable
                          ></v-combobox>
                        </v-col>
                        <v-col cols="2">
                          <v-text-field
                            v-model.number="role.count"
                            label="Count"
                            type="number"
                            hint="Number needed"
                            clearable
                          ></v-text-field>
                        </v-col>
                        <v-col cols="3">
                          <v-combobox
                            v-model="role.seniority"
                            :items="seniorityLevels"
                            label="Seniority"
                            clearable
                          ></v-combobox>
                        </v-col>
                        <v-col cols="3">
                          <v-combobox
                            v-model="role.commitment"
                            :items="commitmentLevels"
                            label="Commitment"
                            clearable
                          ></v-combobox>
                        </v-col>
                        <v-col cols="1">
                          <v-btn
                            color="error"
                            icon
                            @click="removeRole(roleIndex)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>

                      <v-expansion-panels class="ml-4 mb-4">
                        <v-expansion-panel>
                          <v-expansion-panel-title>
                            Additional Requirements
                          </v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <v-row>
                              <v-col cols="12" sm="6">
                                <v-combobox
                                  v-model="role.certification"
                                  :items="certifications"
                                  label="Required Certification"
                                  multiple
                                  chips
                                  closable-chips
                                  hint="Enter or select required certifications"
                                ></v-combobox>
                              </v-col>
                              <v-col cols="12" sm="6">
                                <v-combobox
                                  v-model="role.software"
                                  :items="softwareTools"
                                  label="Software Proficiency"
                                  multiple
                                  chips
                                  closable-chips
                                  hint="Enter or select required software skills"
                                ></v-combobox>
                              </v-col>
                            </v-row>
                            <v-textarea
                              v-model="role.specificRequirements"
                              label="Specific Requirements"
                              hint="Any specific requirements for this role"
                              rows="3"
                              clearable
                            ></v-textarea>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </div>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Success Criteria -->
            <v-expansion-panels v-model="expandedPanels.success" id="success">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon color="#B1A184" class="mr-2"
                      >mdi-flag-checkered</v-icon
                    >
                    <span>Success Criteria</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="section-content">
                    <v-textarea
                      v-model="formData.successCriteria"
                      label="Define Success Criteria"
                      hint="Specify measurable success criteria"
                      rows="3"
                      clearable
                    ></v-textarea>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card>
      </v-container>

      <!-- Scroll to Top Button -->
      <v-btn
        v-show="showScrollButton"
        @click="scrollToTop"
        color="#B1A184"
        icon
        class="scroll-to-top"
        elevation="3"
      >
        <v-icon>mdi-chevron-up</v-icon>
      </v-btn>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useProjectRequirementsStore } from '@/stores/projectRequirements'
import { useRouter } from 'vue-router'

const router = useRouter()
const projectRequirementsStore = useProjectRequirementsStore()

// Form reference and state management
const mainContent = ref(null)
const showScrollButton = ref(false)
const form = ref(null)
const loading = ref(false)
const submitButton = ref(null)

// Sections configuration for side navigation
const sections = [
  {
    title: 'Project Details',
    value: 'details',
    icon: 'mdi-clipboard-text-outline',
  },
  {
    title: 'Project Classification',
    value: 'classification',
    icon: 'mdi-file-document-outline',
  },
  {
    title: 'Work Preferences',
    value: 'workPreferences',
    icon: 'mdi-office-building-outline',
  },
  {
    title: 'Budget & Timeline',
    value: 'budgetTimeline',
    icon: 'mdi-currency-usd',
  },
  { title: 'Technical Requirements', value: 'technical', icon: 'mdi-tools' },
  {
    title: 'Team Composition',
    value: 'team',
    icon: 'mdi-account-group-outline',
  },
  { title: 'Success Criteria', value: 'success', icon: 'mdi-flag-checkered' },
]

const expandAll = () => {
  Object.keys(expandedPanels).forEach((key) => {
    expandedPanels[key] = 0
  })
}

const collapseAll = () => {
  Object.keys(expandedPanels).forEach((key) => {
    expandedPanels[key] = -1
  })
}

// Expansion panels state
const expandedPanels = reactive({
  details: 0,
  classification: 0,
  workPreferences: 0,
  budgetTimeline: 0,
  technical: 0,
  team: 0,
  success: 0,
})

// Computed property for active section
const isActiveSection = computed(() => (section) => {
  return expandedPanels[section] === 0
})

// Form Data Structure
const formData = reactive({
  department: '',
  projectType: '',
  sponsor: '',
  sponsorEmail: '',
  projectName: '',
  description: '',
  industryDomain: '',
  projectPhase: '',
  projectScale: '',
  projectComplexity: '',
  workLocation: '',
  timeZone: '',
  projectLocation: {
    country: '',
    state: '',
    city: '',
  },
  minBudget: null,
  maxBudget: null,
  duration: null,
  startDate: '',
  endDate: '',
  technicalRequirements: [
    {
      name: '',
      requirements: [],
    },
  ],
  teamComposition: [
    {
      title: '',
      count: 1,
      seniority: '',
      commitment: '',
      certification: [],
      software: [],
      specificRequirements: '',
    },
  ],
  keyDeliverables: [],
  successCriteria: '',
})

// All your existing constants remain unchanged
const departments = [
  'Engineering',
  'Property Development',
  'Digital & IT',
  'Marketing',
  'Human Resources',
  'Finance',
  'Corporate Events',
  'Sustainability',
]

const projectTypes = {
  Engineering: [
    'Infrastructure Development',
    'Construction',
    'Technical Design',
    'Maintenance Projects',
  ],
  'Property Development': [
    'Residential Development',
    'Commercial Development',
    'Township Planning',
    'Property Launch',
  ],
}

const industryDomains = [
  'Construction',
  'Infrastructure',
  'Property',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Energy',
  'Transportation',
  'Others',
]

const projectPhases = [
  'Initiation',
  'Planning',
  'Design',
  'Development',
  'Implementation',
  'Testing',
  'Deployment',
  'Maintenance',
]

const projectScales = [
  'Small (< 3 months)',
  'Medium (3-6 months)',
  'Large (6-12 months)',
  'Enterprise (> 12 months)',
]

const complexityLevels = ['Low', 'Medium', 'High', 'Very High']
const workLocations = ['On-site', 'Remote', 'Hybrid', 'Flexible']
const timeZones = [
  'Malaysia Time (MYT/GMT+8)',
  'Flexible',
  'Multiple Time Zones',
  'Project Specific',
]

const countries = ['Malaysia', 'Singapore', 'Indonesia', 'Thailand']
const locationData = {
  Malaysia: {
    states: {
      Selangor: ['Shah Alam', 'Petaling Jaya', 'Subang Jaya'],
      'Kuala Lumpur': ['KLCC', 'Bangsar', 'Mont Kiara'],
      Penang: ['Georgetown', 'Bayan Lepas', 'Butterworth'],
    },
  },
  Singapore: {
    states: {
      Central: ['Downtown Core', 'Marina Bay', 'Orchard'],
      East: ['Changi', 'Tampines', 'Pasir Ris'],
    },
  },
}

const commonCategories = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Software Development',
  'Project Management',
  'Quality Assurance',
  'Business Analysis',
  'Design',
  'Marketing',
  'Finance',
]

const experienceLevels = ['Basic', 'Intermediate', 'Advanced', 'Expert']
const priorityLevels = ['Must Have', 'Important', 'Nice to Have']
const professionalStandards = [
  'ISO 9001',
  'ISO 14001',
  'OHSAS 18001',
  'CMMI',
  'IEEE Standards',
  'ASTM Standards',
  'ASME Standards',
  'IEC Standards',
]

const deliverableTypes = [
  'Technical Documentation',
  'Design Specifications',
  'Software/System',
  'Infrastructure',
  'Research Report',
  'Marketing Materials',
  'Training Materials',
  'Process Documentation',
  'Financial Reports',
  'Compliance Documents',
]

const commonRoles = [
  'Project Manager',
  'Technical Lead',
  'Engineer',
  'Developer',
  'Designer',
  'Analyst',
  'Specialist',
  'Coordinator',
]

const seniorityLevels = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal']
const commitmentLevels = ['Full-time', 'Part-time', 'Contract', 'Consultant']
const certifications = [
  'PMP',
  'Professional Engineer (PE)',
  'AWS Certified',
  'CISSP',
  'PRINCE2',
  'ITIL',
  'Six Sigma',
  'LEED AP',
]

const softwareTools = [
  'AutoCAD',
  'Revit',
  'MATLAB',
  'MS Project',
  'Primavera',
  'Adobe Creative Suite',
  'Office 365',
  'SAP',
]

// Computed Properties
const getProjectTypes = computed(() => {
  return formData.department ? projectTypes[formData.department] || [] : []
})

const availableStates = computed(() => {
  return formData.projectLocation.country
    ? Object.keys(locationData[formData.projectLocation.country]?.states || {})
    : []
})

const availableCities = computed(() => {
  if (!formData.projectLocation.country || !formData.projectLocation.state)
    return []
  return (
    locationData[formData.projectLocation.country]?.states[
      formData.projectLocation.state
    ] || []
  )
})

// Methods for Technical Requirements
const addNewCategory = () => {
  formData.technicalRequirements.push({
    name: '',
    requirements: [],
  })
}

const removeCategory = (index) => {
  formData.technicalRequirements.splice(index, 1)
}

const addRequirement = (categoryIndex) => {
  formData.technicalRequirements[categoryIndex].requirements.push({
    skill: '',
    level: '',
    yearsRequired: null,
    priority: 'Important',
    certifications: [],
  })
}

const removeRequirement = (categoryIndex, reqIndex) => {
  formData.technicalRequirements[categoryIndex].requirements.splice(reqIndex, 1)
}

// Methods for Team Composition
const addNewRole = () => {
  formData.teamComposition.push({
    title: '',
    count: 1,
    seniority: '',
    commitment: '',
    certification: [],
    software: [],
    specificRequirements: '',
  })
}

const removeRole = (index) => {
  formData.teamComposition.splice(index, 1)
}

const getCommonSkills = (category) => {
  const skillsMap = {
    'Civil Engineering': ['Structural Analysis', 'AutoCAD', 'Site Planning'],
    'Mechanical Engineering': ['CAD/CAM', 'Thermal Analysis', 'Fluid Dynamics'],
    'Electrical Engineering': [
      'Circuit Design',
      'Power Systems',
      'Control Systems',
    ],
    'Software Development': [
      'Programming',
      'System Design',
      'Database Management',
    ],
  }
  return skillsMap[category] || []
}

// Form submission handler
const handleSubmit = async () => {
  loading.value = true
  try {
    const result = await projectRequirementsStore.submitRequirements(formData)
    // Use regular Vue Router navigation
    router.push('/assemble-team/results')
  } catch (error) {
    console.error('Submission error:', error)
    alert('Error submitting project requirements. Please try again.')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  try {
    loading.value = true // Start loading animation

    await nextTick() // Ensure submitButton is rendered

    if (submitButton.value) {
      submitButton.value.$el.click()
    } else {
      console.warn(
        'Submit button ref not available, falling back to direct submission.'
      )
      handleSubmit() // Fallback in case the button ref is not available
    }
  } catch (error) {
    console.error('Error during submitForm:', error)
    handleSubmit() // Even if there's an error getting the ref, try direct submission
  }
}

// Updated Methods
const handleScroll = () => {
  if (mainContent.value) {
    showScrollButton.value = mainContent.value.scrollTop > 300
  }
}

// Update the scrollToTop function
const scrollToTop = () => {
  if (mainContent.value) {
    mainContent.value.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element && mainContent.value) {
    // Toggle the panel state
    expandedPanels[sectionId] = expandedPanels[sectionId] === 0 ? -1 : 0

    // Only scroll if opening the panel
    if (expandedPanels[sectionId] === 0) {
      setTimeout(() => {
        const headerOffset = 20
        const elementPosition = element.getBoundingClientRect().top
        const containerScrollTop = mainContent.value.scrollTop
        const offsetPosition =
          elementPosition + containerScrollTop - headerOffset

        mainContent.value.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })
      }, 100)
    }
  }
}

// Keep all your other existing methods
const handleDepartmentChange = () => {
  formData.projectType = ''
}

const updateStates = () => {
  formData.projectLocation.state = ''
  formData.projectLocation.city = ''
}

const updateCities = () => {
  formData.projectLocation.city = ''
}

// Lifecycle hooks
onMounted(() => {
  if (mainContent.value) {
    mainContent.value.addEventListener('scroll', handleScroll, {
      passive: true,
    })
    handleScroll() // Initial check
  }
})

onUnmounted(() => {
  if (mainContent.value) {
    mainContent.value.removeEventListener('scroll', handleScroll)
  }
})

const minBudgetDisplay = ref('0.00')
const maxBudgetDisplay = ref('0.00')

function handleInput(event, field) {
  let value = event.target.value.replace(/[^\d]/g, '')

  if (value.length === 0) {
    if (field === 'minBudget') minBudgetDisplay.value = '0.00'
    else maxBudgetDisplay.value = '0.00'
    return
  }

  const numericValue = (parseFloat(value) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  if (field === 'minBudget') minBudgetDisplay.value = numericValue
  else maxBudgetDisplay.value = numericValue
}

function handleClear(field) {
  if (field === 'minBudget') minBudgetDisplay.value = '0.00'
  else maxBudgetDisplay.value = '0.00'
}
</script>

<style scoped>
.form-container {
  flex-direction: column;
}

.side-nav {
  position: fixed;
  width: 280px;
  height: 100vh;
  background-color: white;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  z-index: 1;
  overflow-y: auto;
}
.side-nav-header {
  color: #b1a184;
}

.side-nav .v-btn {
  text-transform: none;
  letter-spacing: normal;
}

.side-nav .v-btn:hover {
  background-color: #f5f0e8;
}

.side-nav .v-btn .v-icon {
  margin-right: 4px;
}

.active-section {
  background-color: #f5f0e8 !important;
  color: #b1a184 !important;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 24px;
  min-height: 100vh;
  overflow-y: auto;
  height: calc(100vh - 64px);
}
body {
  overflow: hidden;
}

.form-card {
  background-color: white;
  padding: 24px;
  height: 100%;
}

.primary-color {
  color: #b1a184;
}

:deep(.v-list-item) {
  min-height: 44px;
  padding: 8px 16px;
}

:deep(.v-list-item:hover) {
  background-color: #f5f0e8;
}

:deep(.v-list-item__prepend) {
  margin-right: 8px;
}

.scroll-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
  background-color: #b1a184 !important;
  color: white !important;
}

.scroll-to-top:hover {
  transform: translateY(-2px);
  opacity: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2) !important;
}

/* Add scrollbar styles */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #b1a184;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #9a8b70;
}

.main-content {
  scrollbar-width: thin;
  scrollbar-color: #b1a184 #f1f1f1;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-text-field .v-input__details) {
  padding-inline: 16px;
}

:deep(.v-expansion-panels) {
  margin-bottom: 24px;
}

:deep(.v-expansion-panel) {
  margin-bottom: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

:deep(.v-expansion-panel-title) {
  padding: 16px;
}

.technical-category,
.team-role {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: #fafafa;
}

:root {
  scroll-behavior: smooth;
}

:deep(.v-expansion-panel-content__wrap) {
  transition: all 0.3s ease;
}

/* Remove unwanted gaps */
.v-container {
  padding: 0 !important;
  margin: 0 !important;
  max-width: none !important;
}

.v-main {
  padding: 0 !important;
}

@media (max-width: 960px) {
  .main-content {
    padding-left: 0;
    padding-top: 60px;
  }

  .side-nav {
    width: 100%;
    height: auto;
    position: relative;
  }
}

.technical-category {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background-color: #ffffff;
}

.requirement-container {
  display: flex;
  align-items: stretch; /* Changed to stretch to align with box height */
  gap: 16px;
}

.requirement-box {
  flex-grow: 1;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
}

.remove-button {
  display: flex;
  padding: 8px 0; /* Adds some vertical padding */
}

/* Optional: Add hover effect to the requirement box */
.requirement-box:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Optional: Style for the chips in multiple select */
:deep(.v-chip) {
  margin: 2px;
}

.gap-4 {
  gap: 16px;
}

:deep(.v-text-field input) {
  text-align: right;
  padding-right: 8px;
  font-family: monospace;
}

:deep(.v-field__prefix) {
  padding-right: 8px;
}

.loading-text {
  display: flex;
  justify-content: center;
  min-width: 240px;
}

.bounce-letter {
  display: inline-block;
  animation: bounce 1s infinite;
  font-weight: 500;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Make the button taller to accommodate the animation */
.submit-button {
  min-height: 48px;
  background-color: #b1a184 !important;
  color: white !important;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 12px 0;
  position: relative;
  overflow: hidden;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background-color: #a08f73 !important;
}

.submit-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: translateX(-100%);
}

.submit-button:hover::after {
  animation: shine 1.5s infinite;
}

@keyframes shine {
  100% {
    transform: translateX(100%);
  }
}

/* Make the submit button more prominent */
.side-nav .v-list-item.mt-4 {
  padding: 8px 16px;
  margin-top: 16px !important;
}

.button-container {
  display: flex;
  flex-direction: column;
}

.button-hint {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.2;
  margin-top: 8px;
}

/* Optional: Add a subtle pulsing effect to draw attention */
.button-hint {
  animation: subtle-pulse 3s infinite;
}

@keyframes subtle-pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.form-hint {
  color: #666;
  line-height: 1.4;
  text-align: left;
  padding-left: 0 !important;
  margin-bottom: 24px;
  font-size: 14px;
  white-space: normal;
  max-width: 100%;
}

/* Fix Vuetify's default card subtitle padding */
:deep(.v-card-subtitle) {
  padding-left: 0;
  padding-right: 0;
  white-space: normal;
}
</style>
