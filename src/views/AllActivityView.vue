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
import { ref, onMounted } from 'vue'; // <-- Add ref
import { useDashboardStore } from '@/stores/dashboard.store';
import { useAuthStore } from '@/stores/auth.store'; // <-- Add this import
import BaseButton from '@/components/BaseButton.vue'; // <-- Add this import

const dashboardStore = useDashboardStore();
const authStore = useAuthStore(); // <-- Initialize the auth store

// AFTER: Add this ref for loading state
const isDownloading = ref(false);

// AFTER: Add this new function to handle the download
const handleDownloadReport = async () => {
  isDownloading.value = true;
  try {
    const response = await fetch('http://localhost:8080/api/reports/activity-log', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download report. Please try again.');
    }

    // Get the blob data and the filename from headers
    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'activity_log.pdf'; // Default filename
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length > 1) {
            filename = filenameMatch[1];
        }
    }

    // Create a temporary URL and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error downloading report:', error);
    alert(error.message);
  } finally {
    isDownloading.value = false;
  }
};

onMounted(() => {
  dashboardStore.getActivityLog();
});
</script>
