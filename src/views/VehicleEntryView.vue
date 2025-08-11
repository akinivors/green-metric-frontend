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
          :error="filterErrors.date"
        />
        <BaseInput
          id="endDate"
          label="End Date"
          type="date"
          v-model="vehicleStore.filters.endDate"
          :error="filterErrors.date"
        />
        <div class="flex space-x-2">
          <BaseButton @click="applyFilters" class="w-full">Apply Filters</BaseButton>
          <BaseButton @click="vehicleStore.clearFilters" theme="secondary" class="w-full"
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
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Motorcycle
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ZEVs</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Submitted By
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!vehicleStore.entries.length">
              <td colspan="7" class="text-center p-4">
                No entries found for the selected criteria.
              </td>
            </tr>
            <VehicleEntryRow
              v-for="entry in vehicleStore.entries"
              :key="entry.id"
              :entry="entry"
              @delete="handleDelete"
            />
          </tbody>
        </table>
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600">
            Page {{ vehicleStore.pagination.page + 1 }} of {{ vehicleStore.pagination.totalPages }}
          </span>
          <div>
            <BaseButton
              theme="secondary"
              @click="vehicleStore.changePage(vehicleStore.pagination.page - 1)"
              :disabled="vehicleStore.pagination.page <= 0"
            >
              Previous
            </BaseButton>
            <BaseButton
              theme="secondary"
              @click="vehicleStore.changePage(vehicleStore.pagination.page + 1)"
              :disabled="vehicleStore.pagination.page >= vehicleStore.pagination.totalPages - 1"
              class="ml-2"
            >
              Next
            </BaseButton>
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
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
            id="newMotorcycle"
            label="Motorcycle Count"
            type="number"
            v-model.number="logForm.motorcycleCount"
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
          <BaseButton type="submit" :loading="vehicleStore.loading">
            {{ vehicleStore.loading ? 'Submitting...' : 'Log Entries' }}
          </BaseButton>
        </div>
      </form>
    </div>

    <div v-if="userStore.user?.role === 'ADMIN'" class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Transportation Campus Metrics</h2>
      <div v-if="metricsStore.loading" class="text-center">Loading metrics...</div>
      <div v-else class="space-y-4">
        <div
          v-for="metric in transportationMetrics"
          :key="metric.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-700">{{ metric.description }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ metric.metricValue }}</p>
          </div>
          <BaseButton theme="secondary" @click="openEditModal(metric)">Edit</BaseButton>
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
import { ref, reactive, onMounted, watch, computed } from 'vue' // Add computed
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useVehicleStore } from '@/stores/vehicle.store'
import { useMetricsStore } from '@/stores/metrics.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import EditMetricModal from '@/components/EditMetricModal.vue'
import VehicleEntryRow from '@/components/VehicleEntryRow.vue'
import notificationService from '@/services/notificationService'
import { useModal } from '@/services/modalService'

const userStore = useUserStore()
const vehicleStore = useVehicleStore()
const metricsStore = useMetricsStore()
const { confirm } = useModal()
const route = useRoute()

// The component no longer holds its own filter state. It just tells the store when to act.

// Keep the form state local to the component since it's not related to URL state
const logForm = reactive({
  entryDate: new Date().toISOString().substring(0, 10),
  publicTransportCount: 0,
  privateVehicleCount: 0,
  motorcycleCount: 0,
  zevCount: 0,
})

// NEW: Add state for FILTER validation errors
const filterErrors = ref({
  date: '',
})

// NEW: Watch for changes on the FILTER date fields
watch(
  [() => vehicleStore.filters.startDate, () => vehicleStore.filters.endDate],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate && new Date(newEndDate) < new Date(newStartDate)) {
      filterErrors.value.date = 'End date cannot be before start date.'
    } else {
      filterErrors.value.date = ''
    }
  },
)

// Modal state for editing metrics
const isEditModalOpen = ref(false)
const selectedMetric = ref(null)

// NEW computed property to filter metrics for this page
const transportationMetrics = computed(() => {
  return metricsStore.metrics.filter((m) => m.category === 'TRANSPORTATION')
})

function openEditModal(metric) {
  selectedMetric.value = metric
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  selectedMetric.value = null
}

async function handleSaveMetric(updatedMetric) {
  // Call the central metrics store's action
  const success = await metricsStore.createMetric(updatedMetric)
  if (success) {
    closeEditModal()
    notificationService.success('Metric history updated successfully!')
  }
}

// Add delete handler function
const handleDelete = async (entry) => {
  const confirmed = await confirm({
    title: 'Delete Vehicle Entry',
    message: `Are you sure you want to delete the entry for ${entry.entryDate}?`,
    confirmButtonText: 'Delete',
  })

  if (confirmed) {
    const success = await vehicleStore.deleteVehicleEntry(entry.id)
    if (success) {
      notificationService.success('Entry deleted successfully.')
    } else {
      notificationService.error(vehicleStore.error || 'Failed to delete entry.')
    }
  }
}

const handleLogSubmit = async () => {
  console.log('Submitting daily log:', logForm)

  const success = await vehicleStore.submitLog({
    entryDate: logForm.entryDate,
    publicTransportCount: logForm.publicTransportCount,
    privateVehicleCount: logForm.privateVehicleCount,
    motorcycleCount: logForm.motorcycleCount,
    zevCount: logForm.zevCount,
  })

  if (success) {
    // Reset form after successful submission
    logForm.publicTransportCount = 0
    logForm.privateVehicleCount = 0
    logForm.motorcycleCount = 0
    logForm.zevCount = 0
    logForm.entryDate = new Date().toISOString().substring(0, 10)
    notificationService.success('Entry submitted successfully!')
  } else {
    notificationService.error(vehicleStore.error || 'Failed to submit entry. Please try again.')
  }
}

// NEW: Local wrapper for applyFilters with validation
const applyFilters = () => {
  // NEW: Add check for filter error before fetching data
  if (filterErrors.value.date) {
    notificationService.error('Please correct the filter date range.')
    return
  }
  vehicleStore.applyFilters()
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
  // Logic for vehicle entries remains the same
  // vehicleStore.initializeFromUrl(route.query);

  // Fetch only the metrics for this page's category
  if (userStore.user?.role === 'ADMIN') {
    metricsStore.getMetrics({ category: 'TRANSPORTATION' })
  }
})
</script>
