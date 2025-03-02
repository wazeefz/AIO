import { ref } from 'vue'
import axios from 'axios'

export function useResume() {
  const resumeData = ref(null)
  const error = ref(null)

  // Base API URL
  const API_URL = 'http://localhost:8000/gemini'

  // Upload resume function
  const uploadResume = async (file) => {
    error.value = null
    if (!file) {
      error.value = 'No file selected'
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(
        `${API_URL}/summarize_resume`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )
      resumeData.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.detail || 'Failed to process resume'
      throw new Error(error.value)
    }
  }

  return { resumeData, error, uploadResume }
}
