<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">Vehicle Entry Management</h1>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Historical Entries</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        <BaseInput
          id="startDate"
          label="Start Date"
          type="date"
          v-model="vehicleStore.filters.startDate"
        />
        <BaseInput
          id="endDate"
          label="End Date"
          type="date"
          v-model="vehicleStore.filters.endDate"
        />
        <div class="flex space-x-2">
          <BaseButton @click="vehicleStore.applyFilters" class="w-full">Apply Filters</BaseButton>
          <BaseButton @click="vehicleStore.clearFilters" variant="secondary" class="w-full"
            >Clear</BaseButton
          >
        </div>
      </div>

      <div v-if="vehicleStore.loading && !vehicleStore.entries.length" class="text-center p-4">
        Loading entries...
      </div>
      <div v-else-if="vehicleStore.error" class="text-red-500 p-4">{{ vehicleStore.error }}</div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Public Transport
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Private Vehicles
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ZEVs</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Submitted By
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!vehicleStore.entries.length">
              <td colspan="5" class="text-center p-4">
                No entries found for the selected criteria.
              </td>
            </tr>
            <tr v-for="entry in vehicleStore.entries" :key="entry.id">
              <td class="px-6 py-4">{{ entry.entryDate }}</td>
              <td class="px-6 py-4">{{ entry.publicTransportCount }}</td>
              <td class="px-6 py-4">{{ entry.privateVehicleCount }}</td>
              <td class="px-6 py-4">{{ entry.zevCount }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ entry.submittedBy }}</td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600"
            >Page {{ vehicleStore.pagination.page }} of
            {{ vehicleStore.pagination.totalPages }}</span
          >
          <div>
            <BaseButton
              variant="secondary"
              @click="vehicleStore.changePage(vehicleStore.pagination.page - 1)"
              :disabled="vehicleStore.pagination.page <= 1"
              >Previous</BaseButton
            >
            <BaseButton
              variant="secondary"
              @click="vehicleStore.changePage(vehicleStore.pagination.page + 1)"
              :disabled="vehicleStore.pagination.page >= vehicleStore.pagination.totalPages"
              class="ml-2"
              >Next</BaseButton
            >
          </div>
        </div>
      </div>
    </div>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Log New Daily Entries</h2>

      <div
        v-if="vehicleStore.error"
        class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
      >
        {{ vehicleStore.error }}
        <button @click="vehicleStore.clearError()" class="ml-2 text-red-800 underline">
          Dismiss
        </button>
      </div>

      <form class="space-y-6" @submit.prevent="handleLogSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <BaseInput
            id="newEntryDate"
            label="Entry Date"
            type="date"
            v-model="logForm.entryDate"
            required
          />
          <BaseInput
            id="newPublicTransport"
            label="Public Transport Count"
            type="number"
            v-model.number="logForm.publicTransportCount"
            required
          />
          <BaseInput
            id="newPrivateVehicle"
            label="Private Vehicle Count"
            type="number"
            v-model.number="logForm.privateVehicleCount"
            required
          />
          <BaseInput
            id="newZev"
            label="ZEV Count"
            type="number"
            v-model.number="logForm.zevCount"
            required
          />
        </div>
        <div class="pt-4">
          <BaseButton type="submit" :disabled="vehicleStore.loading">
            {{ vehicleStore.loading ? 'Submitting...' : 'Log Entries' }}
          </BaseButton>
        </div>
      </form>
    </div>

    <div v-if="userStore.user?.role === 'ADMIN'" class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Transportation Campus Metrics</h2>
      <div class="space-y-4">
        <div
          v-for="metric in vehicleStore.metrics"
          :key="metric.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-700">{{ metric.description }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ metric.metric_value }}</p>
          </div>
          <BaseButton variant="secondary" @click="openEditModal(metric)">Edit</BaseButton>
        </div>
      </div>
    </div>

    <EditMetricModal
      v-if="isEditModalOpen"
      :metric="selectedMetric"
      @close="closeEditModal"
      @save="handleSaveMetric"
    />
  </div>
</template>

<script setup>
import { onMounted, watch, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useVehicleStore } from '@/stores/vehicle.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import EditMetricModal from '@/components/EditMetricModal.vue'

const userStore = useUserStore()
const vehicleStore = useVehicleStore()
const route = useRoute()

// The component no longer holds its own filter state. It just tells the store when to act.

// Keep the form state local to the component since it's not related to URL state
const logForm = reactive({
  entryDate: new Date().toISOString().substring(0, 10),
  publicTransportCount: 0,
  privateVehicleCount: 0,
  zevCount: 0,
})

// Modal state for editing metrics
const isEditModalOpen = ref(false)
const selectedMetric = ref(null)

function openEditModal(metric) {
  selectedMetric.value = metric
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  selectedMetric.value = null
}

async function handleSaveMetric(updatedMetric) {
  const success = await vehicleStore.updateMetric(updatedMetric)
  if (success) {
    closeEditModal()
    alert('Metric updated successfully!')
  } else {
    alert('Failed to update metric. Please try again.')
  }
}

const handleLogSubmit = async () => {
  console.log('Submitting daily log:', logForm)

  const success = await vehicleStore.submitLog({
    entryDate: logForm.entryDate,
    publicTransportCount: logForm.publicTransportCount,
    privateVehicleCount: logForm.privateVehicleCount,
    zevCount: logForm.zevCount,
  })

  if (success) {
    // Reset form after successful submission
    logForm.publicTransportCount = 0
    logForm.privateVehicleCount = 0
    logForm.zevCount = 0
    logForm.entryDate = new Date().toISOString().substring(0, 10)
    alert('Entry submitted successfully!')
  } else {
    alert('Failed to submit entry. Please try again.')
  }
}

// Watch the URL's query. When it changes, tell the store to initialize itself from that query.
// This is how the page becomes bookmarkable and reactive to browser back/forward buttons.
watch(
  () => route.query,
  (newQuery) => {
    vehicleStore.initializeFromUrl(newQuery)
  },
  { immediate: true },
) // immediate:true runs this once on component load

onMounted(() => {
  if (userStore.user?.role === 'ADMIN') {
    vehicleStore.getMetrics()
  }
})
</script>
