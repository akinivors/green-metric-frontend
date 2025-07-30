// src/stores/vehicle.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth.store'

// We no longer import anything from the mock service for vehicle entries

export const useVehicleStore = defineStore('vehicle', () => {
  const router = useRouter()
  const authStore = useAuthStore()

  // State remains the same
  const entries = ref([])
  const pagination = reactive({ page: 0, totalPages: 1 }) // Backend is 0-indexed
  const filters = reactive({ startDate: '', endDate: '' })
  const loading = ref(false)
  const error = ref(null)

  // --- Actions are now connected to the real API ---

  async function getEntries() {
    loading.value = true
    error.value = null
    try {
      // Build URL with query parameters for the backend
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', pagination.page)

      const response = await fetch(
        `http://localhost:8080/api/entries/vehicle?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${authStore.token}` },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch vehicle entries.')
      }

      const data = await response.json()
      entries.value = data.content // Spring Pageable uses "content"
      pagination.page = data.number // "number" is the current page (0-indexed)
      pagination.totalPages = data.totalPages
    } catch (e) {
      error.value = e.message
      console.error('Error fetching vehicle entries:', e)
    } finally {
      loading.value = false
    }
  }

  async function submitLog(logData) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:8080/api/entries/vehicle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify(logData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit log.')
      }

      await getEntries() // Refresh the list with the latest data
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error submitting vehicle log:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // --- URL and Filter Management ---
  function applyFilters() {
    pagination.page = 0 // Reset to the first page for a new filter
    router.push({ query: { ...filters, page: 0 } })
  }

  function clearFilters() {
    filters.startDate = ''
    filters.endDate = ''
    applyFilters()
  }

  function changePage(newPage) {
    // newPage is already the correct 0-indexed number
    if (newPage >= 0 && newPage < pagination.totalPages) {
      router.push({ query: { ...filters, page: newPage } })
    }
  }

  function initializeFromUrl(query) {
    filters.startDate = query.startDate || ''
    filters.endDate = query.endDate || ''
    pagination.page = parseInt(query.page || 0, 10)
    getEntries()
  }

  return {
    entries,
    pagination,
    filters,
    loading,
    error,
    getEntries,
    submitLog,
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
  }
})
