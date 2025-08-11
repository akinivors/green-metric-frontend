// src/stores/waste.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { apiService } from '../services/apiService'

export const useWasteStore = defineStore('waste', () => {
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

  // --- Actions Connected to Live API ---

  async function getEntries() {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', pagination.page)

      const data = await apiService.get(`/entries/waste?${params.toString()}`)
      entries.value = data.content
      pagination.page = data.number
      pagination.totalPages = data.totalPages
    } catch (e) {
      error.value = e.message
      console.error('Error fetching waste entries:', e)
    } finally {
      loading.value = false
    }
  }

  async function submitLog(logData) {
    loading.value = true
    error.value = null
    try {
      await apiService.post('/entries/waste', logData)
      await getEntries() // Refresh the list with the latest data
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error submitting waste log:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // Add the new deleteWasteData function
  async function deleteWasteData(entryId) {
    loading.value = true
    error.value = null
    try {
      await apiService.delete(`/entries/waste/${entryId}`)
      // Refresh the entry list after successful deletion
      await getEntries()
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error deleting waste data entry:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // --- URL and Filter Management ---
  function applyFilters() {
    pagination.page = 0
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
    deleteWasteData, // Export the new deleteWasteData function
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
  }
})
