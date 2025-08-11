// src/stores/dashboard.store.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '../services/apiService'

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

  async function getStats(period = 'last_month') {
    loading.value = true
    error.value = null
    try {
      // Fetch all three categories in parallel using apiService
      const [consumptionData, vehicleData, wasteData] = await Promise.all([
        apiService.get(`/public/statistics?category=consumption&period=${period}`),
        apiService.get(`/public/statistics?category=vehicles&period=${period}`),
        apiService.get(`/public/statistics?category=waste&period=${period}`),
      ])

      consumptionStats.value = consumptionData
      vehicleStats.value = vehicleData
      wasteStats.value = wasteData
    } catch (e) {
      error.value = e.message
      console.error('Error fetching dashboard statistics:', e)
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
      const data = await apiService.get(`/activity-log?${params.toString()}`)
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
