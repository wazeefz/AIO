import { defineStore } from 'pinia'

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resumeData: JSON.parse(localStorage.getItem('resumeData')) || null,
  }),
  actions: {
    setResumeData(data) {
      this.resumeData = data
      localStorage.setItem('resumeData', JSON.stringify(data)) // Store in localStorage
    },
    getResumeData() {
      return this.resumeData
        ? JSON.parse(localStorage.getItem('resumeData'))
        : null
    },
    clearResumeData() {
      this.resumeData = null
      localStorage.removeItem('resumeData') // Remove from localStorage
    },
  },
})
