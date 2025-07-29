import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from './user.store' // Import the user store

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const error = ref(null)

  async function login(username, password) {
    error.value = null
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }
      const receivedToken = await response.text()
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
