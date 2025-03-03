import { ref } from 'vue'
import axios from 'axios'

export function useGoogleDriveUpload() {
  const error = ref(null)
  const loading = ref(false)

  const uploadFileToGoogleDrive = async (file) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(
        'http://localhost:8000/upload-pdf/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

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
    uploadFileToGoogleDrive,
    error,
    loading,
  }
}
