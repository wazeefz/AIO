import { defineStore } from 'pinia'

const API_URL = 'http://localhost:8000'

export const useTalentStore = defineStore('talent', {
  state: () => ({
    talents: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    getTalentById: (state) => (id) => {
      return state.talents.find((talent) => talent.talent_id === id)
    },

    getTalents: (state) => {
      return state.talents
    },
  },

  actions: {
    async fetchTalents() {
      this.isLoading = true
      try {
        const response = await fetch(`${API_URL}/talents/`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        this.talents = await response.json()
        console.log('talents', this.talents)
        this.error = null
      } catch (error) {
        this.error = error.message
        console.error('Error fetching talents:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addTalent(talent) {
      try {
        const response = await fetch(`${API_URL}/talents/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(talent),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const newTalent = await response.json()
        this.talents.push(newTalent)
        return newTalent
      } catch (error) {
        console.error('Error adding talent:', error)
        throw error
      }
    },

    async updateTalent(talent) {
      try {
        const response = await fetch(`${API_URL}/talents/${talent.talent_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(talent),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const updatedTalent = await response.json()
        const index = this.talents.findIndex(
          (t) => t.talent_id === talent.talent_id
        )
        if (index !== -1) {
          this.talents[index] = updatedTalent
        }
        return updatedTalent
      } catch (error) {
        console.error('Error updating talent:', error)
        throw error
      }
    },

    async deleteTalent(talentId) {
      try {
        const response = await fetch(`${API_URL}/talents/${talentId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        this.talents = this.talents.filter((t) => t.talent_id !== talentId)
      } catch (error) {
        console.error('Error deleting talent:', error)
        throw error
      }
    },
  },
})
