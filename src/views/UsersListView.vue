<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">User Management</h1>
      <router-link to="/users/create">
        <BaseButton>Create New User</BaseButton>
      </router-link>
    </div>

    <div v-if="userStore.loading" class="text-center p-4">Loading users...</div>
    <div v-if="userStore.error" class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
      {{ userStore.error }}
    </div>

    <div v-else class="bg-white rounded-lg shadow-md">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Full Name
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Username
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Role
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="userStore.users.length === 0">
            <td colspan="3" class="px-6 py-4 text-center text-gray-500">No users found.</td>
          </tr>
          <tr v-for="user in userStore.users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ user.fullName }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ user.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
              >
                {{ user.role }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user.store'
import BaseButton from '@/components/BaseButton.vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.fetchAllUsers()
})
</script>
