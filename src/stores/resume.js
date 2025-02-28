import { defineStore } from 'pinia'

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resumeData: null, // Will store the stringified resume response
  }),
  actions: {
    setResumeData(data) {
      this.resumeData = JSON.stringify(data) // Convert to string before storing
    },
    getResumeData() {
      return this.resumeData ? JSON.parse(this.resumeData) : null
    },
  },
})
