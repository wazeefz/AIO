// src/composables/useGoogleDriveUpload.js
import { ref } from 'vue'
import axios from 'axios'

export function useGoogleDriveUpload() {
  const loading = ref(false)
  const error = ref(null)
  const uploadedFileData = ref(null)

  const uploadFileToGoogleDrive = async (file) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Replace with your FastAPI backend endpoint
      const response = await axios.post(
        'http://localhost:8000/upload-pdf/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      uploadedFileData.value = response.data
      return response.data
    } catch (err) {
      error.value =
        err.response?.data?.detail || 'Failed to upload file to Google Drive.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    uploadedFileData,
    uploadFileToGoogleDrive,
  }
}
