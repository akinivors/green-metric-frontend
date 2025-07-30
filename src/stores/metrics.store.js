// src/stores/metrics.store.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useMetricsStore = defineStore('metrics', () => {
  const metrics = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  async function getMetrics(category) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(
        `http://localhost:8080/api/metrics?category=${category.toUpperCase()}`,
        {
          headers: { Authorization: `Bearer ${authStore.token}` },
        },
      )
      if (!response.ok) throw new Error(`Failed to fetch ${category} metrics.`)
      const data = await response.json()
      // Replace metrics for the specific category to avoid mixing data
      const otherMetrics = metrics.value.filter((m) => m.category !== category.toUpperCase())
      metrics.value = [...otherMetrics, ...data.content]
    } catch (e) {
      error.value = e.message
      console.error(`Error fetching ${category} metrics:`, e)
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
          metricValue: metricData.metric_value,
          category: metricData.category.toUpperCase(),
          description: metricData.description,
        }),
      })
      if (!response.ok) {
        const errorBody = await response.json()
        throw new Error(errorBody.message || 'Failed to save metric.')
      }
      // Refresh the list for the relevant category after creation
      await getMetrics(metricData.category)
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error creating metric:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateMetric(updatedMetric) {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`http://localhost:8080/api/metrics/${updatedMetric.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          metricKey: updatedMetric.metricKey,
          metricValue: updatedMetric.metricValue,
          category: updatedMetric.category,
          description: updatedMetric.description,
        }),
      })
      if (!response.ok) {
        const errorBody = await response.json()
        throw new Error(errorBody.message || 'Failed to update metric.')
      }
      // Refresh the list for the relevant category after update
      await getMetrics(updatedMetric.category.toLowerCase())
      return true
    } catch (e) {
      error.value = e.message
      console.error('Error updating metric:', e)
      return false
    } finally {
      loading.value = false
    }
  }

  return { metrics, loading, error, getMetrics, createMetric, updateMetric }
})
