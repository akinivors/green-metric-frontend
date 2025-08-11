<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">Electricity Consumption Management</h1>

    <!-- Historical Data Section -->
    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Historical Consumption Data</h2>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 items-end">
        <BaseInput
          id="startDate"
          label="Start Date"
          type="date"
          v-model="electricityStore.filters.startDate"
          :error="filterErrors.date"
        />
        <BaseInput
          id="endDate"
          label="End Date"
          type="date"
          v-model="electricityStore.filters.endDate"
          :error="filterErrors.date"
        />
        <BaseSelect
          v-if="userStore.user?.role === 'ADMIN'"
          id="unitFilter"
          label="Filter by Unit"
          v-model="electricityStore.filters.unitId"
          :options="unitOptionsForFilter"
        />
        <div class="flex space-x-2">
          <BaseButton @click="applyFilters" class="w-full"> Apply </BaseButton>
          <BaseButton @click="electricityStore.clearFilters" theme="secondary" class="w-full">
            Clear
          </BaseButton>
        </div>
      </div>

      <!-- Data Table -->
      <div v-if="electricityStore.loading && !electricityStore.entries.length">Loading data...</div>
      <div v-else-if="electricityStore.error">
        {{ electricityStore.error }}
      </div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Period
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Consumption (kWh)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Submitted By
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!electricityStore.entries.length">
              <td colspan="5" class="text-center p-4">No entries found.</td>
            </tr>
            <ConsumptionDataRow
              v-for="entry in electricityStore.entries"
              :key="entry.id"
              :entry="entry"
              type="electricity"
              @delete="handleDelete"
            />
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600">
            Page {{ electricityStore.pagination.page + 1 }} of
            {{ electricityStore.pagination.totalPages }}
          </span>
          <div>
            <BaseButton
              theme="secondary"
              @click="electricityStore.changePage(electricityStore.pagination.page - 1)"
              :disabled="electricityStore.pagination.page <= 0"
            >
              Previous
            </BaseButton>
            <BaseButton
              theme="secondary"
              @click="electricityStore.changePage(electricityStore.pagination.page + 1)"
              :disabled="
                electricityStore.pagination.page >= electricityStore.pagination.totalPages - 1
              "
              class="ml-2"
            >
              Next
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Log New Consumption Section -->
    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Log New Electricity Consumption</h2>

      <form class="space-y-6" @submit.prevent="handleLogSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <BaseInput
            id="newStartDate"
            label="Period Start Date"
            type="date"
            v-model="logForm.periodStartDate"
            :error="errors.date"
            required
          />
          <BaseInput
            id="newEndDate"
            label="Period End Date"
            type="date"
            v-model="logForm.periodEndDate"
            :error="errors.date"
            required
          />
          <BaseSelect
            id="newUnit"
            label="Unit"
            v-model="logForm.unitId"
            :options="unitOptions"
            :disabled="userStore.user?.role === 'BINA_GOREVLISI'"
            required
          />
          <BaseInput
            id="newConsumption"
            label="Consumption (kWh)"
            type="number"
            v-model.number="logForm.consumptionKwh"
            required
          />
        </div>
        <div class="pt-4">
          <BaseButton type="submit" :loading="electricityStore.loading">
            {{ electricityStore.loading ? 'Submitting...' : 'Log Consumption' }}
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Admin Metrics Section -->
    <div v-if="userStore.user?.role === 'ADMIN'" class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Electricity Related Campus Metrics</h2>

      <div v-if="metricsStore.loading && !electricityMetrics.length">Loading metrics...</div>
      <div v-else class="space-y-4">
        <div
          v-for="metric in electricityMetrics"
          :key="metric.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-700">{{ metric.description }}</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metric.metricValue }} {{ metric.unit }}
            </p>
          </div>
          <BaseButton theme="secondary" @click="openEditModal(metric)"> Edit </BaseButton>
        </div>
      </div>
    </div>

    <!-- Edit Metric Modal -->
    <EditMetricModal
      v-if="isEditModalOpen"
      :metric="selectedMetric"
      @close="closeEditModal"
      @save="handleSaveMetric"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useElectricityStore } from '@/stores/electricity.store'
import { useUnitsStore } from '@/stores/units.store'
import { useMetricsStore } from '@/stores/metrics.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import EditMetricModal from '@/components/EditMetricModal.vue'
import ConsumptionDataRow from '@/components/ConsumptionDataRow.vue'
import notificationService from '@/services/notificationService'
import { useModal } from '@/services/modalService'

const electricityStore = useElectricityStore()
const userStore = useUserStore()
const unitsStore = useUnitsStore()
const metricsStore = useMetricsStore()
const { confirm } = useModal()
const route = useRoute()

// Form for logging new consumption
const logForm = reactive({
  periodStartDate: '',
  periodEndDate: '',
  unitId: '',
  consumptionKwh: 0,
})

// NEW: Add state for date validation errors
const errors = ref({
  date: '',
})

// NEW: Watch for changes on both date fields
watch(
  [() => logForm.periodStartDate, () => logForm.periodEndDate],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate && new Date(newEndDate) < new Date(newStartDate)) {
      errors.value.date = 'End date cannot be before the start date.'
    } else {
      errors.value.date = ''
    }
  },
)

// NEW: Add state for FILTER validation errors
const filterErrors = ref({
  date: '',
})

// NEW: Watch for changes on the FILTER date fields
watch(
  [() => electricityStore.filters.startDate, () => electricityStore.filters.endDate],
  ([newStartDate, newEndDate]) => {
    if (newStartDate && newEndDate && new Date(newEndDate) < new Date(newStartDate)) {
      filterErrors.value.date = 'End date cannot be before start date.'
    } else {
      filterErrors.value.date = ''
    }
  },
)

// Add computed property to filter the correct metrics
const electricityMetrics = computed(() => {
  return metricsStore.metrics.filter((metric) => metric.category === 'ENERGY_CLIMATE_CHANGE')
})

// Using real API units from userStore (consistent with our architecture)
const unitOptions = computed(() => {
  if (!userStore.units || userStore.units.length === 0) {
    return [{ value: '', label: 'Loading...' }]
  }
  return userStore.units.map((unit) => ({
    value: unit.id,
    label: unit.name,
  }))
})

// Admin unit filter options
const unitOptionsForFilter = computed(() => {
  if (!unitsStore.units || unitsStore.units.length === 0) {
    return [{ value: '', label: 'All Units' }]
  }
  return [
    { value: '', label: 'All Units' },
    ...unitsStore.units.map((unit) => ({ value: unit.id, label: unit.name })),
  ]
})

const handleLogSubmit = async () => {
  // NEW: Add check for date error before submitting
  if (errors.value.date) {
    notificationService.error('Please correct the date range before submitting.')
    return
  }

  const selectedUnit = userStore.units.find((u) => u.id === Number(logForm.unitId))
  const success = await electricityStore.submitLog({
    ...logForm,
    unitId: Number(logForm.unitId),
    unitName: selectedUnit?.name,
  })

  if (success) {
    notificationService.success('Electricity consumption logged successfully!')
    // Reset form
    Object.assign(logForm, {
      periodStartDate: '',
      periodEndDate: '',
      unitId: '',
      consumptionKwh: 0,
    })
  }
}

// NEW: Local wrapper for applyFilters with validation
const applyFilters = () => {
  // NEW: Add check for filter error before fetching data
  if (filterErrors.value.date) {
    notificationService.error('Please correct the filter date range.')
    return
  }
  electricityStore.applyFilters()
}

// Edit Metric Modal Logic
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

// Add delete handler function
const handleDelete = async (entry) => {
  const confirmed = await confirm({
    title: 'Delete Electricity Consumption Log',
    message: `Are you sure you want to delete the log for period ${entry.periodStartDate} to ${entry.periodEndDate}?`,
    confirmButtonText: 'Delete',
  })

  if (confirmed) {
    const success = await electricityStore.deleteElectricityConsumption(entry.id)
    if (success) {
      notificationService.success('Entry deleted successfully.')
    } else {
      notificationService.error(electricityStore.error || 'Failed to delete entry.')
    }
  }
}

async function handleSaveMetric(updatedMetric) {
  const success = await metricsStore.createMetric(updatedMetric)
  if (success) {
    closeEditModal()
    notificationService.success('Metric history updated successfully!')
  }
}

// Watch the URL to drive the page state
watch(
  () => route.query,
  (newQuery) => {
    electricityStore.initializeFromUrl(newQuery)
  },
  { immediate: true },
)

onMounted(() => {
  // Pre-fill the form's unitId if the user is a Building Manager
  if (userStore.user?.role === 'BINA_GOREVLISI') {
    logForm.unitId = userStore.user.unitId
  }

  // Fetch real units from API (consistent with our architecture)
  userStore.fetchUnits()

  // Fetch units for admin filtering
  unitsStore.fetchUnits()

  if (userStore.user?.role === 'ADMIN') {
    // Fetch only the metrics for this page's category
    metricsStore.getMetrics({ category: 'ENERGY_CLIMATE_CHANGE' })
  }
})
</script>
