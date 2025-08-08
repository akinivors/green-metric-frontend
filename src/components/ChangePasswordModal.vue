<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div class="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-xl">
      <h2 class="text-2xl font-bold text-center text-gray-900">Change Your Password</h2>
      <p class="text-sm text-center text-gray-600">Please update your password to continue.</p>

      <div v-if="userStore.error" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
        {{ userStore.error }}
      </div>
      <div v-if="clientError" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
        {{ clientError }}
      </div>

      <form class="space-y-4" @submit.prevent="handleChangePassword">
        <BaseInput
          id="oldPassword"
          label="Old Password"
          type="password"
          v-model="oldPassword"
          :disabled="userStore.loading"
        />
        <BaseInput
          id="newPassword"
          label="New Password"
          type="password"
          v-model="newPassword"
          :disabled="userStore.loading"
          :error="errors.newPassword"
        />
        <BaseInput
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          v-model="confirmPassword"
          :disabled="userStore.loading"
          :error="errors.confirmPassword"
        />
        <div>
          <BaseButton type="submit" class="w-full" :disabled="userStore.loading">
            {{ userStore.loading ? 'Updating...' : 'Update Password' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue' // Import watch
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import notificationService from '@/services/notificationService'

const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const clientError = ref(null)

// NEW: Add state for validation errors
const errors = ref({
  newPassword: '',
  confirmPassword: '',
})

// NEW: Watch for changes on the newPassword field
watch(newPassword, (value) => {
  if (value.length > 0 && value.length < 8) {
    errors.value.newPassword = 'Password must be at least 8 characters long.'
  } else {
    errors.value.newPassword = ''
  }
})

// NEW: Watch for changes on the confirmPassword field
watch(confirmPassword, (value) => {
  if (value && value !== newPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match.'
  } else {
    errors.value.confirmPassword = ''
  }
})

const handleChangePassword = async () => {
  clientError.value = null
  // Check our new validation state before submitting
  if (errors.value.newPassword || errors.value.confirmPassword) {
    clientError.value = 'Please correct the errors before submitting.'
    return
  }

  // The rest of the function remains the same...
  const success = await userStore.changePassword(oldPassword.value, newPassword.value)

  if (success) {
    authStore.logout()
    notificationService.success('Password changed successfully! Please log in again.')
    router.push('/login')
  }
}
</script>
