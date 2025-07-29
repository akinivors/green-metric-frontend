<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center text-gray-900">GreenMetrik Login</h1>

      <div
        v-if="authStore.error"
        class="p-3 text-sm text-red-700 bg-red-100 rounded-md"
        role="alert"
      >
        {{ authStore.error }}
      </div>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <BaseInput
          id="username"
          label="Username"
          type="text"
          v-model="username"
          :disabled="loading"
        />
        <BaseInput
          id="password"
          label="Password"
          type="password"
          v-model="password"
          :disabled="loading"
        />
        <div>
          <BaseButton type="submit" class="w-full" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'

const authStore = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const success = await authStore.login(username.value, password.value)
  loading.value = false

  if (success) {
    router.push('/')
  }
}
</script>
