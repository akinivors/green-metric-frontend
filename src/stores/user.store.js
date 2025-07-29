import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const user = ref(null) // Currently logged-in user
  const users = ref([]) // List of all users for the admin page
  const units = ref([]) // Units from real API
  const error = ref(null)
  const loading = ref(false)

  // --- Actions ---

  // NEW fetchAllUsers ACTION
  async function fetchAllUsers() {
    loading.value = true
    error.value = null
    const authStore = useAuthStore()
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch users.')
      users.value = await response.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // Fetch units from real API
  async function fetchUnits() {
    loading.value = true
    error.value = null
    const authStore = useAuthStore()
    try {
      const response = await fetch('http://localhost:8080/api/units', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch units.')
      units.value = await response.json()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    const authStore = useAuthStore()
    if (!authStore.token) return

    try {
      const response = await fetch('http://localhost:8080/api/users/me', {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      })
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          authStore.logout()
          return
        }
        throw new Error('Failed to fetch user data.')
      }
      user.value = await response.json()
    } catch (e) {
      console.error('Fetch user error:', e)
      user.value = null
      // If it's a network error, clear the token to prevent infinite loading
      if (e.message.includes('fetch') || e.name === 'TypeError') {
        console.warn('Network error detected, clearing token')
        authStore.logout()
      }
    }
  }

  async function changePassword(oldPassword, newPassword) {
    // ... (existing changePassword function remains the same)
    loading.value = true
    error.value = null
    const authStore = useAuthStore()
    if (!authStore.token) {
      error.value = 'You are not authenticated.'
      loading.value = false
      return false
    }
    try {
      const response = await fetch('http://localhost:8080/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to change password')
      }
      loading.value = false
      return true
    } catch (e) {
      error.value = e.message
      loading.value = false
      return false
    }
  }

  async function createUser(userData) {
    loading.value = true
    error.value = null
    const authStore = useAuthStore()

    try {
      const response = await fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify(userData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create user.')
      }
      loading.value = false
      return true
    } catch (e) {
      error.value = e.message
      loading.value = false
      return false
    }
  }

  function clearUser() {
    user.value = null
  }

  return {
    user,
    users, // <-- Expose all users
    units, // Real API units
    error,
    loading,
    fetchUser,
    fetchAllUsers, // <-- Expose the new action
    fetchUnits, // Real API fetchUnits
    changePassword,
    createUser,
    clearUser,
  }
})
