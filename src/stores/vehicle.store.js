// src/stores/vehicle.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import {
  fetchVehicleMetrics,
  submitVehicleLog,
  fetchVehicleEntries,
  updateVehicleMetric,
} from '@/services/mock-api.service'

export const useVehicleStore = defineStore('vehicle', () => {
  // --- Router ---
  const router = useRouter()

  // --- State ---
  const metrics = ref([])
  const entries = ref([])
  const pagination = reactive({ page: 1, totalPages: 1 })
  const filters = reactive({ startDate: '', endDate: '' })
  const loading = ref(false)
  const error = ref(null)

  // --- Actions ---

  // This is the main action to fetch data, driven by the current state of filters and pagination
  async function getEntries() {
    loading.value = true
    error.value = null
    try {
      // Pass the current state of filters and pagination to the service
      const response = await fetchVehicleEntries({
        ...filters,
        page: pagination.page,
      })
      entries.value = response.data
      Object.assign(pagination, response.pagination)
    } catch (e) {
      error.value = 'Failed to load historical entries.'
      console.error('Error fetching entries:', e)
    } finally {
      loading.value = false
    }
  }

  // This action is called when the user clicks "Apply Filters" or "Clear"
  function applyFilters() {
    pagination.page = 1 // Reset to first page on new filter
    // Update the URL to match the current filter state
    router.push({ query: { ...filters, page: pagination.page } })
    // The router's watcher will trigger getEntries()
  }

  function clearFilters() {
    filters.startDate = ''
    filters.endDate = ''
    applyFilters() // Apply the empty filters
  }

  // This action is called by pagination buttons
  function changePage(newPage) {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      pagination.page = newPage
      router.push({ query: { ...filters, page: newPage } })
    }
  }

  // This action is called once when the page first loads
  function initializeFromUrl(query) {
    filters.startDate = query.startDate || ''
    filters.endDate = query.endDate || ''
    pagination.page = parseInt(query.page || 1, 10)
    getEntries()
  }

  async function submitLog(logData) {
    loading.value = true
    error.value = null
    try {
      const response = await submitVehicleLog(logData)
      if (!response.success) throw new Error('Failed to submit log.')
      await getEntries() // Refresh the list after submitting
      return true
    } catch (e) {
      error.value = 'Submission failed. Please try again.'
      console.error('Error submitting log:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function getMetrics() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchVehicleMetrics()
      metrics.value = data
    } catch (err) {
      error.value = 'Failed to fetch vehicle metrics'
      console.error('Error fetching metrics:', err)
    } finally {
      loading.value = false
    }
  }

  // NEW action to update a metric
  async function updateMetric(metricData) {
    loading.value = true
    error.value = null
    try {
      const response = await updateVehicleMetric(metricData)
      if (!response.success) throw new Error('Failed to update metric.')
      // Refresh the metrics list to show the change
      await getMetrics()
      return true
    } catch (e) {
      error.value = 'Failed to update metric.'
      console.error('Error updating metric:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    metrics,
    entries,
    pagination,
    filters, // Expose filters to be used with v-model
    loading,
    error,
    getMetrics,
    getEntries,
    submitLog,
    updateMetric,
    applyFilters,
    clearFilters,
    changePage,
    initializeFromUrl,
    clearError,
  }
})
