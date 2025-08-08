<template>
  <div class="max-w-2xl mx-auto">
    <div class="p-8 bg-white rounded-lg shadow-md">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-800">Create New User</h1>
        <router-link to="/users" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Back to Users
        </router-link>
      </div>

      <div v-if="userStore.error" class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
        {{ userStore.error }}
      </div>

      <form class="space-y-6" @submit.prevent="handleCreateUser">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseInput
            id="fullName"
            label="Full Name"
            type="text"
            v-model="form.fullName"
            :disabled="userStore.loading"
            :error="errors.fullName"
            required
          />
          <BaseInput
            id="username"
            label="Username"
            type="text"
            v-model="form.username"
            :disabled="userStore.loading"
            :error="errors.username"
            required
          />
        </div>
        <div>
          <BaseInput
            id="password"
            label="Temporary Password"
            type="text"
            v-model="form.password"
            :disabled="userStore.loading"
            :error="errors.password"
            required
            help="The user will be required to change this on their first login."
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BaseSelect
            id="role"
            label="Role"
            v-model="form.role"
            :options="roleOptions"
            :disabled="userStore.loading"
            required
          />
          <BaseSelect
            id="unit"
            label="Unit"
            v-model="form.unitId"
            :options="unitOptions"
            :disabled="userStore.loading"
            required
          />
        </div>
        <div class="pt-4">
          <BaseButton type="submit" :disabled="userStore.loading">
            {{ userStore.loading ? 'Creating...' : 'Create User' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed, ref, watch } from 'vue' // Import ref and watch
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import notificationService from '@/services/notificationService'

const userStore = useUserStore()
const router = useRouter()

const form = reactive({
  username: '',
  fullName: '',
  password: '',
  role: '',
  unitId: '',
})

// NEW: Add state for validation errors
const errors = ref({
  username: '',
  fullName: '',
  password: '',
})

// NEW: Watch for changes on the username field
watch(
  () => form.username,
  (value) => {
    if (value.length > 0 && value.length < 3) {
      errors.value.username = 'Username must be at least 3 characters long.'
    } else {
      errors.value.username = ''
    }
  },
)

// NEW: Watch for changes on the fullName field
watch(
  () => form.fullName,
  (value) => {
    if (value.length > 0 && value.length < 2) {
      errors.value.fullName = 'Full Name must be at least 2 characters long.'
    } else {
      errors.value.fullName = ''
    }
  },
)

// NEW: Watch for changes on the password field
watch(
  () => form.password,
  (value) => {
    if (value.length > 0 && value.length < 8) {
      errors.value.password = 'Password must be at least 8 characters long.'
    } else {
      errors.value.password = ''
    }
  },
)

const roleOptions = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'GUVENLIK', label: 'Security' },
  { value: 'YEMEKHANE', label: 'Cafeteria Staff' },
  { value: 'BINA_GOREVLISI', label: 'Building Manager' },
]

const unitOptions = computed(() => {
  if (!userStore.units || userStore.units.length === 0) {
    return [{ value: '', label: 'Loading...' }]
  }
  return userStore.units.map((unit) => ({ value: unit.id, label: unit.name }))
})

onMounted(() => {
  userStore.fetchUnits()
})

const handleCreateUser = async () => {
  // Check for client-side errors before submitting
  if (errors.value.username || errors.value.fullName || errors.value.password) {
    userStore.error = 'Please correct the errors before submitting.'
    return
  }

  if (!form.username || !form.fullName || !form.password || !form.role || !form.unitId) {
    userStore.error = 'All fields are required.'
    return
  }
  const success = await userStore.createUser(form)
  if (success) {
    notificationService.success('User created successfully!')
    router.push('/users')
  }
}
</script>
