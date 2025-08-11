// src/stores/vehicle.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { apiService } from '../services/apiService'

// We no longer import anything from the mock service for vehicle entries

export const useVehicleStore = defineStore('vehicle', () => {
  const router = useRouter()

  // Reactive state
  const entries = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = reactive({
    startDate: '',
    endDate: '',
  })
  const pagination = reactive({
    page: 0,
    totalPages: 0,
  })

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

      const data = await apiService.get(`/entries/vehicle?${params.toString()}`)
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
      await apiService.post('/entries/vehicle', logData)
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

  // Add the new deleteVehicleEntry function
  async function deleteVehicleEntry(entryId) {
    loading.value = true
    error.value = null
    try {
      await apiService.delete(`/entries/vehicle/${entryId}`)
      // Refresh the entry list after successful deletion
      await getEntries()
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error deleting vehicle entry:', e)
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
    deleteVehicleEntry, // Export the new deleteVehicleEntry function
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
  }
})
