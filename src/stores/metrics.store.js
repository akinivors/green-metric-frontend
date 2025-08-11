// src/stores/metrics.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '../services/apiService'

export const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref([])
  // AFTER: Add pagination state
  const pagination = reactive({
    page: 0,
    totalPages: 1,
  })
  const loading = ref(false)
  const error = ref(null)

  // AFTER: Replace the current getMetrics with this version
  async function getMetrics({ page = 0, size = 1000, category = '' } = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page, size })
      if (category) {
        params.append('category', category.toUpperCase())
      }

      const data = await apiService.get(`/metrics?${params.toString()}`)

      if (category) {
        // If a specific category was requested, intelligently merge the new data
        const existingMetrics = metrics.value.filter((m) => m.category !== category)
        metrics.value = [...existingMetrics, ...data.content]
      } else {
        // If no category filter, replace all metrics
        metrics.value = data.content
      }

      pagination.page = data.pageable?.pageNumber || 0
      pagination.totalPages = data.totalPages || 1
    } catch (e) {
      error.value = e.message
      console.error('Error fetching metrics:', e)
    } finally {
      loading.value = false
    }
  }

  async function createMetric(metricData) {
    loading.value = true
    error.value = null
    try {
      await apiService.post('/metrics', {
        metricKey: metricData.metricKey,
        metricValue: metricData.metricValue,
        category: metricData.category.toUpperCase(),
        description: metricData.description,
        metricDate: new Date().toISOString().split('T')[0],
      })
      // After creation, refresh the data for the relevant category
      await getMetrics({ category: metricData.category })
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error creating metric:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  return { metrics, pagination, loading, error, getMetrics, createMetric }
})
