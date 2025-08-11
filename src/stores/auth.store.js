import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './user.store' // Import the user store
import { apiService } from '@/services/apiService' // <-- Import the new service

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const error = ref(null)

  async function login(username, password) {
    error.value = null
    try {
      // OLD fetch logic is replaced with this one line
      const receivedToken = await apiService.post('/auth/login', { username, password })
      token.value = receivedToken
      localStorage.setItem('token', receivedToken)

      // After successful login, fetch the user's profile
      const userStore = useUserStore()
      await userStore.fetchUser()

      return true
    } catch (e) {
      error.value = e.message
      return false
    }
  }

  function logout() {
    const userStore = useUserStore()
    token.value = null
    localStorage.removeItem('token')
    userStore.clearUser() // Clear user data on logout
  }

  return { token, error, login, logout }
})
