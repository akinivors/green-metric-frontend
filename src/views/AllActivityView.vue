<template>
  <div class="space-y-8">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold text-gray-800">System Activity Log</h1>
      <BaseButton @click="handleDownloadReport" :disabled="isDownloading">
        {{ isDownloading ? 'Generating...' : 'Download Report' }}
      </BaseButton>
    </div>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">All Entries</h2>

      <!-- Filter Controls -->
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 items-end">
        <BaseInput
          id="dateAfter"
          label="Start Date"
          type="date"
          v-model="dashboardStore.activityLogFilters.dateAfter"
        />
        <BaseInput
          id="dateBefore"
          label="End Date"
          type="date"
          v-model="dashboardStore.activityLogFilters.dateBefore"
        />
        <BaseSelect
          id="actionType"
          label="Action Type"
          v-model="dashboardStore.activityLogFilters.actionType"
          :options="actionTypeOptions"
        />
        <BaseSelect
          id="dataType"
          label="Data Type"
          v-model="dashboardStore.activityLogFilters.dataType"
          :options="dataTypeOptions"
        />
        <BaseInput
          id="username"
          label="Username"
          type="text"
          v-model="dashboardStore.activityLogFilters.username"
        />
        <div class="flex space-x-2">
          <BaseButton @click="applyFilters" class="w-full">Apply Filters</BaseButton>
          <BaseButton @click="clearFilters" theme="secondary" class="w-full">Clear</BaseButton>
        </div>
      </div>

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

        <!-- Pagination Controls -->
        <div v-if="dashboardStore.activityLog.length > 0" class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600">
            Page {{ dashboardStore.activityLogPagination.page + 1 }} of {{ dashboardStore.activityLogPagination.totalPages }}
          </span>
          <div>
            <BaseButton
              theme="secondary"
              @click="dashboardStore.changeActivityLogPage(dashboardStore.activityLogPagination.page - 1)"
              :disabled="dashboardStore.activityLogPagination.page <= 0"
            >
              Previous
            </BaseButton>
            <BaseButton
              theme="secondary"
              @click="dashboardStore.changeActivityLogPage(dashboardStore.activityLogPagination.page + 1)"
              :disabled="dashboardStore.activityLogPagination.page >= dashboardStore.activityLogPagination.totalPages - 1"
              class="ml-2"
            >
              Next
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue' // <-- Add ref
import { useRoute } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard.store'
import { useAuthStore } from '@/stores/auth.store' // <-- Add this import
import BaseButton from '@/components/BaseButton.vue' // <-- Add this import
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import { useToast } from 'vue-toastification' // <-- Add this import

const dashboardStore = useDashboardStore()
const authStore = useAuthStore() // <-- Initialize the auth store
const route = useRoute()
const toast = useToast() // <-- Add this line

// AFTER: Add this ref for loading state
const isDownloading = ref(false)

// Action type options for filtering
const actionTypeOptions = [
  { value: '', label: 'All Action Types' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'VIEW', label: 'View' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'DOWNLOAD', label: 'Download' }
]

// Data type options for filtering
const dataTypeOptions = [
  { value: '', label: 'All Data Types' },
  { value: 'USER', label: 'User' },
  { value: 'VEHICLE_ENTRY', label: 'Vehicle Entry' },
  { value: 'WASTE_DATA', label: 'Waste Data' },
  { value: 'ELECTRICITY_CONSUMPTION', label: 'Electricity Consumption' },
  { value: 'WATER_CONSUMPTION', label: 'Water Consumption' },
  { value: 'METRIC', label: 'Metric' },
  { value: 'SYSTEM', label: 'System' }
]

// Filter functions
const applyFilters = () => {
  dashboardStore.applyActivityLogFilters()
}

const clearFilters = () => {
  dashboardStore.clearActivityLogFilters()
}

// AFTER: Add this new function to handle the download
const handleDownloadReport = async () => {
  isDownloading.value = true
  try {
    const response = await fetch('http://localhost:8080/api/reports/activity-log', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to download report. Please try again.')
    }

    // Get the blob data and the filename from headers
    const blob = await response.blob()
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = 'activity_log.pdf' // Default filename
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch.length > 1) {
        filename = filenameMatch[1]
      }
    }

    // Create a temporary URL and trigger the download
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading report:', error)
    // OLD: alert(error.message)
    // NEW:
    toast.error(error.message)
  } finally {
    isDownloading.value = false
  }
}

// Watch route changes to handle pagination
watch(
  () => route.query,
  (newQuery) => {
    dashboardStore.initializeActivityLogFromUrl(newQuery)
  },
  { immediate: true }
)
</script>
