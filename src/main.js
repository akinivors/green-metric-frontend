import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import { useUserStore } from './stores/user.store' // <-- Import user store
import './assets/main.css'

// --- Main App Initialization Function ---
async function startApp() {
  const app = createApp(App)

  // Install Pinia first, as other stores depend on it
  app.use(createPinia())

  // Now that Pinia is installed, we can use the stores
  const authStore = useAuthStore()
  const userStore = useUserStore()

  // Attempt to fetch the user profile if a token exists
  // This is the key step: we do this BEFORE setting up the router guard
  if (authStore.token) {
    try {
      await userStore.fetchUser()
    } catch (error) {
      console.warn('Failed to fetch user on startup:', error)
      // Clear the invalid token
      authStore.logout()
    }
  }

  // The Navigation Guard
  router.beforeEach((to, from, next) => {
    // Now, userStore.user is guaranteed to be populated on page load
    if (to.meta.requiresAuth && !authStore.token) {
      next({ name: 'login' })
    } else if (to.meta.requiresAdmin && userStore.user?.role !== 'ADMIN') {
      next({ name: 'dashboard' })
    } else {
      next()
    }
  })

  // Use the router and mount the app
  app.use(router)
  app.mount('#app')
}

// --- Start the application ---
startApp()
