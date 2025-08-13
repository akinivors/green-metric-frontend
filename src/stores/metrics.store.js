// src/stores/metrics.store.js
import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { apiService } from '../services/apiService'

export const useMetricsStore = defineStore('metrics', () => {
  const router = useRouter()

  const metrics = ref([])
  // AFTER: Add pagination state
  const pagination = reactive({
    page: 0,
    totalPages: 1,
  })
  const loading = ref(false)
  const error = ref(null)

  // History state
  const metricHistory = ref([])
  const historyPagination = reactive({
    number: 0,
    totalPages: 1,
    totalElements: 0,
    size: 10,
  })
  const historyLoading = ref(false)

  // History filters state
  const historyFilters = reactive({
    category: '',
    startDate: '',
    endDate: ''
  })

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

      metrics.value = data.content

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

  async function getMetricHistory({ page = 0, size = 10, category = '', startDate = '', endDate = '' } = {}) {
    historyLoading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page, size })

      if (category) {
        params.append('category', category.toUpperCase())
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const data = await apiService.get(`/metrics/history?${params.toString()}`)

      metricHistory.value = data.content || []
      Object.assign(historyPagination, {
        number: data.number || 0,
        totalPages: data.totalPages || 1,
        totalElements: data.totalElements || 0,
        size: data.size || 10
      })

      return data
    } catch (e) {
      error.value = e.message
      console.error('Error fetching metric history:', e)
      return null
    } finally {
      historyLoading.value = false
    }
  }

  async function getMetricHistoryByKey({ metricKey, page = 0, size = 10 } = {}) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page, size })
      const data = await apiService.get(`/metrics/${metricKey}/history?${params.toString()}`)
      return data
    } catch (e) {
      error.value = e.message
      console.error('Error fetching metric history by key:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  function changeHistoryPage(newPage) {
    if (newPage >= 0 && newPage < historyPagination.totalPages) {
      const query = {
        ...router.currentRoute.value.query,
        page: newPage.toString(),
        category: historyFilters.category || undefined,
        startDate: historyFilters.startDate || undefined,
        endDate: historyFilters.endDate || undefined
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

  function initializeHistoryFromUrl(query) {
    // Set filters from URL
    historyFilters.category = query.category || ''
    historyFilters.startDate = query.startDate || ''
    historyFilters.endDate = query.endDate || ''

    // Set pagination from URL
    const page = parseInt(query.page) || 0
    historyPagination.number = page

    // Fetch data with URL parameters
    getMetricHistory({
      page,
      size: historyPagination.size,
      category: historyFilters.category,
      startDate: historyFilters.startDate,
      endDate: historyFilters.endDate
    })
  }

  return {
    metrics,
    pagination,
    loading,
    error,
    metricHistory,
    historyPagination,
    historyLoading,
    historyFilters,
    getMetrics,
    createMetric,
    getMetricHistory,
    getMetricHistoryByKey,
    changeHistoryPage,
    initializeHistoryFromUrl
  }
})
