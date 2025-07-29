// src/stores/waste.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import {
  fetchWasteMetrics,
  fetchWasteEntries,
  submitWasteLog,
  updateWasteMetric,
} from '@/services/mock-api.service'

export const useWasteStore = defineStore('waste', () => {
  const router = useRouter()
  const entries = ref([])
  const metrics = ref([]) // For campus metrics
  const pagination = reactive({ page: 1, totalPages: 1 })
  const filters = reactive({ startDate: '', endDate: '' })
  const loading = ref(false)
  const error = ref(null)

  async function getEntries() {
    loading.value = true
    error.value = null
    try {
      const response = await fetchWasteEntries({ ...filters, page: pagination.page })
      entries.value = response.data
      Object.assign(pagination, response.pagination)
    } catch (err) {
      error.value = 'Failed to load waste data.'
      console.error('Error fetching waste entries:', err)
    } finally {
      loading.value = false
    }
  }

  function applyFilters() {
    pagination.page = 1
    router.push({ query: { ...filters, page: 1 } })
  }

  function clearFilters() {
    filters.startDate = ''
    filters.endDate = ''
    applyFilters()
  }

  function changePage(newPage) {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      pagination.page = newPage
      router.push({ query: { ...filters, page: newPage } })
    }
  }

  function initializeFromUrl(query) {
    filters.startDate = query.startDate || ''
    filters.endDate = query.endDate || ''
    pagination.page = parseInt(query.page || 1, 10)
    getEntries()
  }

  async function getMetrics() {
    loading.value = true
    try {
      metrics.value = await fetchWasteMetrics()
    } finally {
      loading.value = false
    }
  }

  async function updateMetric(metricData) {
    loading.value = true
    error.value = null
    try {
      const response = await updateWasteMetric(metricData)
      if (!response.success) throw new Error('Failed to update metric.')
      await getMetrics()
      return true
    } catch (err) {
      error.value = 'Failed to update metric.'
      console.error('Error updating waste metric:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function submitLog(logData) {
    loading.value = true
    error.value = null
    try {
      const response = await submitWasteLog(logData)
      if (!response.success) throw new Error('Submission failed.')
      await getEntries() // Refresh list
      return true
    } catch (err) {
      error.value = 'Submission failed.'
      console.error('Error submitting waste log:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    metrics,
    pagination,
    filters,
    loading,
    error,
    getEntries,
    getMetrics,
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
    submitLog,
    updateMetric,
  }
})
