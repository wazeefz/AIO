// stores/editProfileStore.js
import { defineStore } from 'pinia'
import { mockData } from '@/mockdata/mockData' // Import mockData

export const useProfileStore = defineStore('profile', {
  state: () => ({
    projectTeam: [], // Stores added profiles
  }),
  getters: {
    // Combine mockData and projectTeam for display
    combinedResults: (state) => {
      return [...mockData, ...state.projectTeam]
    },
  },
  actions: {
    // Add a new profile
    addProfile(profile) {
      const newProfile = {
        ...profile,
        id: this.projectTeam.length + mockData.length + 1, // Generate unique ID
      }
      this.projectTeam.push(newProfile)
    },

    // Remove a profile by ID
    removeProfile(id) {
      this.projectTeam = this.projectTeam.filter((profile) => profile.id !== id)
    },
  },
})
