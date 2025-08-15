<template>
  <!-- Modal overlay -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <!-- Modal content area -->
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
      <!-- Modal header -->
      <div class="flex justify-between items-center p-6 border-b">
        <h2 class="text-xl font-semibold text-gray-800">
          History for {{ formattedDescription }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Modal body -->
      <div class="flex-1 overflow-auto p-6">
        <div v-if="!historyData?.content?.length" class="text-center py-8 text-gray-500">
          No history data available for this metric.
        </div>
        <div v-else>
          <!-- History table -->
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in historyData.content" :key="entry.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ entry.metricDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ entry.metricValue }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ entry.unit || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="$emit('delete', entry)"
                    class="text-red-600 hover:text-red-900 p-1"
                    title="Delete Entry"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal footer with pagination and close button -->
      <div class="flex justify-between items-center p-6 border-t bg-gray-50">
        <div class="flex items-center space-x-2">
          <!-- Pagination buttons -->
          <button
            @click="handlePrevious"
            :disabled="currentPage <= 0"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600">
            Page {{ currentPage + 1 }} of {{ totalPages }}
          </span>
          <button
            @click="handleNext"
            :disabled="currentPage >= totalPages - 1"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        <!-- Close button -->
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Define props
const props = defineProps({
  metric: {
    type: Object,
    required: true
  },
  historyData: {
    type: Object,
    required: true
  },
  formattedDescription: {
    type: String,
    required: true
  }
})

// Define emits
const emit = defineEmits(['close', 'page-changed', 'delete'])

// Computed properties for pagination
const currentPage = computed(() => props.historyData?.number || 0)
const totalPages = computed(() => props.historyData?.totalPages || 1)

// Handle pagination events
const handlePrevious = () => {
  if (currentPage.value > 0) {
    emit('page-changed', currentPage.value - 1)
  }
}

const handleNext = () => {
  if (currentPage.value < totalPages.value - 1) {
    emit('page-changed', currentPage.value + 1)
  }
}
</script>
