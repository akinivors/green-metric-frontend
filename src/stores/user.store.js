import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiService } from '@/services/apiService' // <-- Import the new service

export const useUserStore = defineStore('user', () => {
  // --- State ---
  const user = ref(null) // Currently logged-in user
  const users = ref([]) // List of all users for the admin page
  const units = ref([]) // Units from real API
  const error = ref(null)
  const loading = ref(false)
  const pagination = ref({
    number: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10,
  }) // Add pagination state with default values

  // --- Actions ---

  // NEW fetchAllUsers ACTION
  async function fetchAllUsers(page = 0, size = 10) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      const data = await apiService.get(`/users?page=${page}&size=${size}`)
      users.value = data.content
      pagination.value = {
        number: data.number,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        size: data.size,
      }
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
    try {
      // OLD fetch logic is replaced with this one line
      units.value = await apiService.get('/units')
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    try {
      // OLD fetch logic is replaced with this one line
      user.value = await apiService.get('/users/me')
    } catch (e) {
      console.error('Error fetching user profile:', e)
    }
  }

  async function changePassword(oldPassword, newPassword) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      await apiService.post('/users/change-password', { oldPassword, newPassword })
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
    try {
      // OLD fetch logic is replaced with this one line
      await apiService.post('/users/register', userData)
      loading.value = false
      return true
    } catch (e) {
      error.value = e.message
      loading.value = false
      return false
    }
  }

  // Add the new deleteUser function
  async function deleteUser(userId) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      await apiService.delete(`/users/${userId}`)
      // Refresh the user list after successful deletion
      await fetchAllUsers()
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  // NEW: Action to fetch a single user
  async function fetchSingleUser(id) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      const user = await apiService.get(`/users/${id}`)
      // We can return the user directly, no need to store it in a shared state
      return user
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  // NEW: Action to update a user
  async function updateUser(id, userData) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      await apiService.put(`/users/${id}`, userData)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  // NEW: Action to reset a user's password
  async function resetPassword(userId) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      return await apiService.post(`/users/${userId}/reset-password`)
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  // NEW: Action to fetch the activity log for a specific user
  async function fetchActivityLog(userId, page = 0, size = 10) {
    loading.value = true
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      return await apiService.get(`/activity-log?userId=${userId}&page=${page}&size=${size}`)
    } catch (e) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
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
    pagination, // <-- Add pagination
    fetchUser,
    fetchAllUsers, // <-- Expose the new action
    fetchUnits, // Real API fetchUnits
    changePassword,
    createUser,
    deleteUser, // Export the new deleteUser function
    fetchSingleUser, // <-- Add this
    updateUser, // <-- Add this
    resetPassword, // <-- Add this
    fetchActivityLog, // <-- Add this
    clearUser,
  }
})
