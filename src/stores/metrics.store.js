// src/stores/metrics.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref([])
  // AFTER: Add pagination state
  const pagination = reactive({
    page: 0,
    totalPages: 1,
  })
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // AFTER: Replace the current getMetrics with this version
  async function getMetrics({ page = 0, size = 1000, category = '' } = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page, size })
      if (category) {
        params.append('category', category.toUpperCase())
      }

      const response = await fetch(`http://localhost:8080/api/metrics?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch metrics.')
      }

      const data = await response.json()

      if (category) {
        // If a specific category was requested, intelligently merge the new data
        const otherMetrics = metrics.value.filter((m) => m.category !== category.toUpperCase())
        metrics.value = [...otherMetrics, ...data.content]
      } else {
        // If no category was specified, replace the entire state
        metrics.value = data.content
      }

      pagination.page = data.number + 1
      pagination.totalPages = data.totalPages
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
      const response = await fetch('http://localhost:8080/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          metricKey: metricData.metricKey,
          metricValue: metricData.metricValue,
          category: metricData.category.toUpperCase(),
          description: metricData.description,
          metricDate: new Date().toISOString().split('T')[0],
        }),
      })
      if (!response.ok) {
        const errorBody = await response.json()
        throw new Error(errorBody.message || 'Failed to save metric.')
      }
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
