// src/stores/dashboard.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { apiService } from '../services/apiService'

export const useDashboardStore = defineStore('dashboard', () => {
  const router = useRouter()
  const consumptionStats = ref(null)
  const vehicleStats = ref(null)
  const wasteStats = ref(null)
  const recentActivity = ref([])
  // AFTER: Add new state for the full activity log and pagination
  const activityLog = ref([])
  const activityLogPagination = ref({
    page: 0,
    totalPages: 1,
    totalElements: 0,
  })

  // Activity log filters state
  const activityLogFilters = reactive({
    dateAfter: '',
    dateBefore: '',
    actionType: '',
    dataType: '',
    username: ''
  })

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
  async function getActivityLog(page = 0, size = 20, filters = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page, size })

      // Add filter parameters if they exist
      if (filters.dateAfter) {
        params.append('dateAfter', filters.dateAfter)
      }
      if (filters.dateBefore) {
        params.append('dateBefore', filters.dateBefore)
      }
      if (filters.actionType) {
        params.append('actionType', filters.actionType)
      }
      if (filters.dataType) {
        params.append('dataType', filters.dataType)
      }
      if (filters.username) {
        params.append('username', filters.username)
      }

      const data = await apiService.get(`/activity-log?${params.toString()}`)
      activityLog.value = data.content
      activityLogPagination.value = {
        page: data.number || 0,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || 0,
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

  function changeActivityLogPage(newPage) {
    if (newPage >= 0 && newPage < activityLogPagination.value.totalPages) {
      const query = {
        ...router.currentRoute.value.query,
        page: newPage.toString(),
        dateAfter: activityLogFilters.dateAfter || undefined,
        dateBefore: activityLogFilters.dateBefore || undefined,
        actionType: activityLogFilters.actionType || undefined,
        dataType: activityLogFilters.dataType || undefined,
        username: activityLogFilters.username || undefined
      }

      // Remove undefined values
      Object.keys(query).forEach(key => {
        if (query[key] === undefined) {
          delete query[key]
        }
      })

      router.push({ query })
    }
  }

  function initializeActivityLogFromUrl(query) {
    // Set filters from URL
    activityLogFilters.dateAfter = query.dateAfter || ''
    activityLogFilters.dateBefore = query.dateBefore || ''
    activityLogFilters.actionType = query.actionType || ''
    activityLogFilters.dataType = query.dataType || ''
    activityLogFilters.username = query.username || ''

    // Set pagination from URL
    const page = parseInt(query.page) || 0
    activityLogPagination.value.page = page

    // Fetch data with URL parameters
    getActivityLog(page, 20, {
      dateAfter: activityLogFilters.dateAfter,
      dateBefore: activityLogFilters.dateBefore,
      actionType: activityLogFilters.actionType,
      dataType: activityLogFilters.dataType,
      username: activityLogFilters.username
    })
  }

  // Apply activity log filters
  const applyActivityLogFilters = () => {
    activityLogPagination.value.page = 0
    router.push({
      query: {
        ...activityLogFilters,
        page: 0
      }
    })
  }

  // Clear activity log filters
  const clearActivityLogFilters = () => {
    activityLogFilters.dateAfter = ''
    activityLogFilters.dateBefore = ''
    activityLogFilters.actionType = ''
    activityLogFilters.dataType = ''
    activityLogFilters.username = ''
    applyActivityLogFilters()
  }

  return {
    consumptionStats,
    vehicleStats,
    wasteStats,
    recentActivity,
    // AFTER: Expose new state and actions
    activityLog,
    activityLogPagination,
    activityLogFilters,
    loading,
    error,
    getStats,
    getActivityLog,
    changeActivityLogPage,
    initializeActivityLogFromUrl,
    applyActivityLogFilters,
    clearActivityLogFilters,
  }
})
