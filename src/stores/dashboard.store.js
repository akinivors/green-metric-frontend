// src/stores/dashboard.store.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useVehicleStore } from './vehicle.store'
import { useWaterStore } from './water.store'
import { useElectricityStore } from './electricity.store'
import { useWasteStore } from './waste.store'

export const useDashboardStore = defineStore('dashboard', () => {
  const consumptionStats = ref(null)
  const vehicleStats = ref(null)
  const wasteStats = ref(null)
  const recentActivity = ref([]) // <-- New state for activity feed
  const loading = ref(false)
  const error = ref(null)

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

  // --- NEW ACTION for Recent Activity ---
  async function getRecentActivity() {
    loading.value = true
    error.value = null
    try {
      // Initialize other stores to use their actions
      const vehicleStore = useVehicleStore()
      const waterStore = useWaterStore()
      const electricityStore = useElectricityStore()
      const wasteStore = useWasteStore()

      // Set pagination to get the first few entries from each store
      vehicleStore.pagination.page = 0
      waterStore.pagination.page = 0
      electricityStore.pagination.page = 0
      wasteStore.pagination.page = 0

      // Clear any existing filters to get the most recent entries
      vehicleStore.filters.startDate = ''
      vehicleStore.filters.endDate = ''
      waterStore.filters.startDate = ''
      waterStore.filters.endDate = ''
      electricityStore.filters.startDate = ''
      electricityStore.filters.endDate = ''
      wasteStore.filters.startDate = ''
      wasteStore.filters.endDate = ''

      // Fetch the first page of recent entries from each store in parallel
      await Promise.all([
        vehicleStore.getEntries(),
        waterStore.getEntries(),
        electricityStore.getEntries(),
        wasteStore.getEntries(),
      ])

      // Combine and format the data from all stores
      const combined = [
        ...vehicleStore.entries.map((e) => ({ ...e, type: 'Vehicle Entry', date: e.entryDate })),
        ...waterStore.entries.map((e) => ({ ...e, type: 'Water Log', date: e.periodEndDate })),
        ...electricityStore.entries.map((e) => ({
          ...e,
          type: 'Electricity Log',
          date: e.periodEndDate,
        })),
        ...wasteStore.entries.map((e) => ({ ...e, type: 'Waste Log', date: e.dataDate })),
      ]

      // Sort all entries by date, descending
      combined.sort((a, b) => new Date(b.date) - new Date(a.date))

      // Take the top 5 most recent activities
      recentActivity.value = combined.slice(0, 5)
    } catch (e) {
      error.value = 'Failed to load recent activity.'
      console.error('Dashboard activity error:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    consumptionStats,
    vehicleStats,
    wasteStats,
    recentActivity, // <-- Expose new state
    loading,
    error,
    getStats,
    getRecentActivity, // <-- Expose new action
  }
})
