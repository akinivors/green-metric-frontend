// src/stores/units.store.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUnitsStore = defineStore('units', () => {
  // --- State ---
  const units = ref([])
  const loading = ref(false)
  const error = ref(null)

  // --- Action ---
  async function fetchUnits() {
    console.log('Units store: fetchUnits called, current units:', units.value.length)
    if (units.value.length > 0) {
      console.log('Units store: Units already loaded, skipping fetch')
      return // Don't fetch if we already have them
    }

    console.log('Units store: Fetching units from API...')
    loading.value = true
    error.value = null
    
    try {
      // Use the userStore to fetch units since units come from real API
      const { useUserStore } = await import('./user.store')
      const userStore = useUserStore()
      await userStore.fetchUnits()
      units.value = userStore.units
      console.log('Units store: Successfully loaded units:', units.value)
    } catch (e) {
      console.error('Failed to fetch units:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // Force refresh units (for debugging)
  async function refreshUnits() {
    console.log('Units store: Force refreshing units...')
    units.value = [] // Clear existing units
    await fetchUnits()
  }

  return {
    units,
    loading,
    error,
    fetchUnits,
    refreshUnits,
  }
})
