// src/stores/water.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import {
  fetchWaterMetrics,
  fetchWaterEntries,
  submitWaterLog,
  updateWaterMetric,
} from '@/services/mock-api.service'

export const useWaterStore = defineStore('water', () => {
  const router = useRouter()
  const metrics = ref([])
  const entries = ref([])
  const pagination = reactive({ page: 1, totalPages: 1 })
  const filters = reactive({ startDate: '', endDate: '' })
  const loading = ref(false)
  const error = ref(null)

  async function getEntries() {
    loading.value = true
    error.value = null
    try {
      const response = await fetchWaterEntries({ ...filters, page: pagination.page })
      entries.value = response.data
      Object.assign(pagination, response.pagination)
    } catch (err) {
      error.value = 'Failed to load historical water data.'
      console.error('Error fetching water entries:', err)
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
      metrics.value = await fetchWaterMetrics()
    } finally {
      loading.value = false
    }
  }

  async function updateMetric(metricData) {
    loading.value = true
    error.value = null
    try {
      const response = await updateWaterMetric(metricData)
      if (!response.success) throw new Error('Failed to update metric.')
      await getMetrics()
      return true
    } catch (err) {
      error.value = 'Failed to update metric.'
      console.error('Error updating water metric:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function submitLog(logData) {
    loading.value = true
    error.value = null
    try {
      const response = await submitWaterLog(logData)
      if (!response.success) throw new Error('Submission failed.')
      await getEntries() // Refresh the list
      return true
    } catch (err) {
      error.value = 'Submission failed. Please try again.'
      console.error('Error submitting water log:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    metrics,
    entries,
    pagination,
    filters,
    loading,
    error,
    getMetrics,
    getEntries,
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
    submitLog,
    updateMetric,
  }
})
