<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold text-gray-800">User Management</h1>
      <router-link to="/users/create">
        <BaseButton>Create New User</BaseButton>
      </router-link>
    </div>

    <div v-if="userStore.loading" class="text-center p-4">Loading users...</div>
    <div v-else-if="userStore.error" class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
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
              Username
            </th>
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
              Role
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Unit
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="usersWithUnitNames.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">No users found.</td>
          </tr>
          <UserListRow
            v-for="user in usersWithUnitNames"
            :key="user.id"
            :user="user"
            @delete="handleDelete"
            @reset-password="handleResetPassword"
          />
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200">
        <PaginationControls :pagination="pagination" @page-changed="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { useUnitsStore } from '@/stores/units.store'
import BaseButton from '@/components/BaseButton.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import UserListRow from '@/components/UserListRow.vue'
import notificationService from '@/services/notificationService'
import { useModal } from '@/services/modalService'

const userStore = useUserStore()
const unitsStore = useUnitsStore()
const { confirm } = useModal()

// Computed property to add unit names to users
const usersWithUnitNames = computed(() => {
  const allUsers = userStore.users || []

  return allUsers
    .map((user) => ({
      ...user,
      unitName: unitsStore.units.find((unit) => unit.id === user.unitId)?.name || 'N/A',
    }))
    .sort((a, b) => {
      // If user 'a' is the current logged-in user, put them first
      if (a.id === userStore.user?.id) return -1
      // If user 'b' is the current logged-in user, put them first
      if (b.id === userStore.user?.id) return 1
      // Otherwise, maintain original order
      return 0
    })
})

const pagination = computed(() => userStore.pagination)

// Handle page change
const handlePageChange = (page) => {
  userStore.fetchAllUsers(page)
}

// Add delete handler function
const handleDelete = async (user) => {
  const confirmed = await confirm({
    title: 'Delete User',
    message: `Are you sure you want to delete the user '${user.username}'? This action cannot be undone.`,
    confirmButtonText: 'Delete',
  })

  if (confirmed) {
    const success = await userStore.deleteUser(user.id)
    if (success) {
      notificationService.success('User deleted successfully.')
    } else {
      notificationService.error(userStore.error || 'Failed to delete user.')
    }
  }
}

// Add reset password handler function
const handleResetPassword = async (user) => {
  const confirmed = await confirm({
    title: 'Reset Password',
    message: `Are you sure you want to reset the password for '${user.username}'? They will be forced to change it on their next login.`,
    confirmButtonText: 'Reset Password',
  })

  if (confirmed) {
    const result = await userStore.resetPassword(user.id)
    if (result && result.temporaryPassword) {
      // Use the modal service again to show the new password
      await confirm({
        title: 'Password Reset Successfully',
        message: `The new temporary password for '${user.username}' is: ${result.temporaryPassword}`,
        confirmButtonText: 'OK',
        cancelButtonText: 'Copy Password', // A little UX enhancement
      }).then((isOk) => {
        if (!isOk) {
          // If 'Copy Password' was clicked
          navigator.clipboard.writeText(result.temporaryPassword)
          notificationService.success('Password copied to clipboard!')
        }
      })
    } else {
      notificationService.error(userStore.error || 'Failed to reset password.')
    }
  }
}

onMounted(async () => {
  // Fetch units first, then users to ensure unit names are available
  await unitsStore.fetchUnits()
  userStore.fetchAllUsers(0, 10) // Start with page 0, 10 items per page
})
</script>
