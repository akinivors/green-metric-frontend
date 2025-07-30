// src/stores/electricity.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from './auth.store'
import { useMetricsStore } from './metrics.store' // Use the central metrics store

export const useElectricityStore = defineStore('electricity', () => {
  const router = useRouter()
  const authStore = useAuthStore()
  const metricsStore = useMetricsStore() // Use the central metrics store

  const entries = ref([])
  const pagination = reactive({ page: 0, totalPages: 1 })
  const filters = reactive({ startDate: '', endDate: '' })
  const loading = ref(false)
  const error = ref(null)

  async function getEntries() {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('page', pagination.page)

      const response = await fetch(
        `http://localhost:8080/api/consumption/electricity?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${authStore.token}` },
        },
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch electricity entries.')
      }

      const data = await response.json()
      entries.value = data.content
      pagination.page = data.number
      pagination.totalPages = data.totalPages
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function submitLog(logData) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:8080/api/consumption/electricity', {
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
      await getEntries() // Refresh list
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  // --- ADDED THIS FUNCTION ---
  async function getMetrics() {
    // Delegate to the central metrics store
    return await metricsStore.getMetrics('ENERGY_CLIMATE_CHANGE')
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
    const zeroIndexedPage = newPage - 1
    if (zeroIndexedPage >= 0 && zeroIndexedPage < pagination.totalPages) {
      router.push({ query: { ...filters, page: zeroIndexedPage } })
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
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
    submitLog,
    getMetrics, // Expose the new function
  }
})
