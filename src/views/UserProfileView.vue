<template>
  <div class="max-w-4xl mx-auto">
    <div v-if="user" class="p-6 bg-white rounded-lg shadow-md mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-semibold text-gray-800">{{ user.fullName }}</h1>
          <p class="text-gray-600">@{{ user.username }}</p>
        </div>
        <BaseButton @click="router.push('/users')" theme="secondary">
          &larr; Back to User List
        </BaseButton>
      </div>
      <div class="mt-4 flex space-x-4">
        <span
          class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >{{ user.role }}</span
        >
        <span
          class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
          >{{ unitName }}</span
        >
      </div>
    </div>

    <div class="p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">User Activity Log</h2>
      <div v-if="loading" class="text-center">Loading activity...</div>
      <div v-else-if="activities.length === 0" class="text-center text-gray-500 py-4">
        No activity recorded for this user.
      </div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Timestamp
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Event Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Description
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in activities" :key="log.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.timestamp }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ log.eventType }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ log.description }}</td>
            </tr>
          </tbody>
        </table>
        <PaginationControls
          v-if="pagination && pagination.totalElements > 0"
          :pagination="pagination"
          @page-changed="fetchUserLogs"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import BaseButton from '@/components/BaseButton.vue'
import PaginationControls from '@/components/PaginationControls.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const user = ref(null)
const activities = ref([])
const pagination = ref(null)
const loading = ref(true)

const unitName = computed(() => {
  if (!user.value || !userStore.units) return ''
  const unit = userStore.units.find((u) => u.id === user.value.unitId)
  return unit ? unit.name : ''
})

// NEW: Create a function to fetch logs for a specific page
const fetchUserLogs = async (page = 0) => {
  loading.value = true
  const userId = route.params.id
  const logData = await userStore.fetchActivityLog(userId, page)
  if (logData) {
    activities.value = logData.content
    pagination.value = {
      number: logData.number,
      totalPages: logData.totalPages,
      totalElements: logData.totalElements,
      size: logData.size,
    }
  }
  loading.value = false
}

onMounted(async () => {
  const userId = route.params.id
  await userStore.fetchUnits() // Ensure units are loaded
  user.value = await userStore.fetchSingleUser(userId)
  await fetchUserLogs(0) // Call our new function
})
</script>
