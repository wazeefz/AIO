import { ref } from 'vue'

export function useJobFilter() {
  const isLoading = ref(false)

  const filterJobs = async (filterData) => {
    isLoading.value = true
    try {
      // Here you would typically make an API call with the filter data
      // Example:
      // const response = await axios.post('/api/jobs/filter', filterData)
      console.log('Filtering with:', filterData)
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
    } catch (error) {
      console.error('Error filtering jobs:', error)
      // Handle error appropriately
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    filterJobs,
  }
}
