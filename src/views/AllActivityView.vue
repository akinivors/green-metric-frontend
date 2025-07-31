<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">System Activity Log</h1>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">All Entries</h2>

      <div v-if="dashboardStore.loading" class="text-center p-8">Loading activity data...</div>
      <div v-else-if="dashboardStore.error" class="p-4 bg-red-100 text-red-700 rounded-md">
        {{ dashboardStore.error }}
      </div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Event Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!dashboardStore.activityLog.length">
              <td colspan="4" class="text-center p-4">No activities found.</td>
            </tr>
            <tr v-for="entry in dashboardStore.activityLog" :key="entry.id">
              <td class="px-6 py-4">{{ new Date(entry.timestamp).toLocaleString() }}</td>
              <td class="px-6 py-4">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                >
                  {{ entry.eventType }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ entry.description }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ entry.username }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard.store'

const dashboardStore = useDashboardStore()

onMounted(() => {
  dashboardStore.getActivityLog()
})
</script>
