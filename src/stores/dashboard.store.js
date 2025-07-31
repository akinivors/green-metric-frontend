// src/stores/dashboard.store.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store' // <-- Import auth store

export const useDashboardStore = defineStore('dashboard', () => {
  const consumptionStats = ref(null)
  const vehicleStats = ref(null)
  const wasteStats = ref(null)
  const recentActivity = ref([])
  // AFTER: Add new state for the full activity log and pagination
  const activityLog = ref([])
  const activityLogPagination = ref({})
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore() // <-- Initialize auth store

  async function getStats(period = 'last_month') {
    loading.value = true
    error.value = null
    try {
      // Fetch all three categories in parallel
      const [consumptionRes, vehicleRes, wasteRes] = await Promise.all([
        fetch(`http://localhost:8080/api/public/statistics?category=consumption&period=${period}`),
        fetch(`http://localhost:8080/api/public/statistics?category=vehicles&period=${period}`),
        fetch(`http://localhost:8080/api/public/statistics?category=waste&period=${period}`),
      ])

      if (!consumptionRes.ok || !vehicleRes.ok || !wasteRes.ok) {
        throw new Error('Failed to fetch one or more dashboard statistics.')
      }

      consumptionStats.value = await consumptionRes.json()
      vehicleStats.value = await vehicleRes.json()
      wasteStats.value = await wasteRes.json()
    } catch (e) {
      error.value = e.message
      console.error('Dashboard store error:', e)
    } finally {
      loading.value = false
    }
  }

  // AFTER: Replace it with this new getActivityLog function.
  async function getActivityLog(page = 0, size = 20) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page, size })
      const response = await fetch(`http://localhost:8080/api/activity-log?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch activity log.')
      }
      const data = await response.json()
      activityLog.value = data.content
      activityLogPagination.value = {
        page: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
      }
      // For the dashboard preview, still populate recentActivity
      if (page === 0) {
        recentActivity.value = data.content.slice(0, 5)
      }
    } catch (e) {
      error.value = 'Failed to load activity log.'
      console.error('Dashboard activity error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    consumptionStats,
    vehicleStats,
    wasteStats,
    recentActivity,
    // AFTER: Expose new state and actions
    activityLog,
    activityLogPagination,
    loading,
    error,
    getStats,
    getActivityLog,
  }
})
