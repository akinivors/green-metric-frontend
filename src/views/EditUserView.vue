<template>
  <div class="max-w-2xl mx-auto">
    <div v-if="loading" class="text-center p-12">Loading User...</div>
    <div v-else class="p-8 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">Edit User: {{ form.username }}</h1>
      <form v-if="form" class="space-y-6" @submit.prevent="handleUpdateUser">
        <BaseInput id="fullName" label="Full Name" type="text" v-model="form.fullName" required />
        <BaseSelect id="role" label="Role" v-model="form.role" :options="roleOptions" required />
        <BaseSelect id="unit" label="Unit" v-model="form.unitId" :options="unitOptions" required />
        <div class="pt-4 flex justify-end space-x-3">
          <BaseButton type="button" @click="router.push('/users')" theme="secondary"
            >Cancel</BaseButton
          >
          <BaseButton type="submit" :loading="userStore.loading">Save Changes</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import notificationService from '@/services/notificationService'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const loading = ref(true)

const form = reactive({
  username: '',
  fullName: '',
  role: '',
  unitId: '',
})

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

onMounted(async () => {
  await userStore.fetchUnits()
  const userId = route.params.id
  const userData = await userStore.fetchSingleUser(userId)
  if (userData) {
    form.username = userData.username
    form.fullName = userData.fullName
    form.role = userData.role
    form.unitId = userData.unitId
  }
  loading.value = false
})

const handleUpdateUser = async () => {
  const userId = route.params.id
  const success = await userStore.updateUser(userId, form)
  if (success) {
    notificationService.success('User updated successfully!')
    router.push('/users')
  } else {
    notificationService.error(userStore.error || 'Failed to update user.')
  }
}
</script>
