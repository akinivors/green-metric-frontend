// src/stores/water.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from './user.store'
import { apiService } from '@/services/apiService' // <-- Import the new service

export const useWaterStore = defineStore('water', () => {
  const router = useRouter()

  const entries = ref([])
  const pagination = reactive({ page: 0, totalPages: 1 })
  const filters = reactive({ startDate: '', endDate: '', unitId: null })
  const loading = ref(false)
  const error = ref(null)

  // --- Actions Connected to Live API ---

  async function getEntries() {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', pagination.page)

      // NEW: Add unitId to the request if it's provided by the user's profile
      const userStore = useUserStore()
      let unitToFilter = filters.unitId

      // If user is a Building Manager, force their unitId
      if (userStore.user?.role === 'BINA_GOREVLISI') {
        unitToFilter = userStore.user.unitId
      }

      // Add the unitId to the request if it's set
      if (unitToFilter) {
        params.append('unitId', unitToFilter)
      }

      // OLD fetch logic is replaced with this one line
      const data = await apiService.get(`/consumption/water?${params.toString()}`)
      entries.value = data.content
      pagination.page = data.number
      pagination.totalPages = data.totalPages
    } catch (e) {
      error.value = e.message
      console.error('Error fetching water entries:', e)
    } finally {
      loading.value = false
    }
  }

  async function submitLog(logData) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      await apiService.post('/consumption/water', logData)
      await getEntries() // Refresh list
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error submitting water log:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  // Add the new deleteWaterConsumption function
  async function deleteWaterConsumption(entryId) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      await apiService.delete(`/consumption/water/${entryId}`)
      // Refresh the entry list after successful deletion
      await getEntries()
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error deleting water consumption entry:', e)
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
    deleteWaterConsumption, // Export the new deleteWaterConsumption function
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
    submitLog,
  }
})
