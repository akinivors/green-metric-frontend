import { useAuthStore } from '@/stores/auth.store'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

async function handleResponse(response) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = (data && data.message) || (data && data.errors) || response.statusText
    throw new Error(message)
  }

  // Special handling for text responses (like auth tokens)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return await response.json()
  } else {
    return await response.text()
  }
}

function authHeader() {
  const { token } = useAuthStore()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  } else {
    return {}
  }
}

export const apiService = {
  get: async (endpoint) => {
    const requestOptions = {
      method: 'GET',
      headers: authHeader(),
    }
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions)
    return handleResponse(response)
  },

  post: async (endpoint, body) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions)
    return handleResponse(response)
  },

  put: async (endpoint, body) => {
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body),
    }
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions)
    return handleResponse(response)
  },

  delete: async (endpoint) => {
    const requestOptions = {
      method: 'DELETE',
      headers: authHeader(),
    }
    const response = await fetch(`${API_URL}${endpoint}`, requestOptions)
    // For DELETE, we might not get a JSON body, so handle differently
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) // Gracefully handle empty error response
      const message = data.message || response.statusText
      throw new Error(message)
    }
    // No content to return on successful delete
  },
}
