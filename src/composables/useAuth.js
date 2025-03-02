import { ref } from 'vue'
import axios from 'axios'

export function useAuth() {
  const user = ref(null)
  const error = ref(null)

  // Base API URL (adjust as needed)
  const API_URL = 'http://localhost:8000/users'

  // Signup function
  const signup = async ({ name, email, department_id, role }) => {
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        department_id,
        role,
      })
      user.value = response.data // Store user in Vue state
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Signup failed'
      throw new Error(error.value)
    }
  }

  // Login function
  const login = async (email) => {
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/login`, { email })
      console.log('response', response.data.user)
      user.value = response.data.user
      return response.data.user
    } catch (err) {
      error.value = err.response?.data?.detail || 'Login failed'
      throw error.value
    }
  }

  return { user, error, signup, login }
}
