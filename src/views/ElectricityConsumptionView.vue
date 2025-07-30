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
        />
        <BaseInput
          id="endDate"
          label="End Date"
          type="date"
          v-model="electricityStore.filters.endDate"
        />
        <BaseSelect
          v-if="userStore.user?.role === 'ADMIN'"
          id="unitFilter"
          label="Filter by Unit"
          v-model="electricityStore.filters.unitId"
          :options="unitOptionsForFilter"
        />
        <div class="flex space-x-2">
          <BaseButton @click="electricityStore.applyFilters" class="w-full"> Apply </BaseButton>
          <BaseButton @click="electricityStore.clearFilters" variant="secondary" class="w-full">
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
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!electricityStore.entries.length">
              <td colspan="4" class="text-center p-4">No entries found.</td>
            </tr>
            <tr v-for="entry in electricityStore.entries" :key="entry.id">
              <td class="px-6 py-4">{{ entry.periodStartDate }} to {{ entry.periodEndDate }}</td>
              <td class="px-6 py-4">{{ entry.unitName }}</td>
              <td class="px-6 py-4">{{ entry.consumptionKwh }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ entry.submittedByUsername }}
              </td>
            </tr>
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
              variant="secondary"
              @click="electricityStore.changePage(electricityStore.pagination.page - 1)"
              :disabled="electricityStore.pagination.page <= 0"
            >
              Previous
            </BaseButton>
            <BaseButton
              variant="secondary"
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
            required
          />
          <BaseInput
            id="newEndDate"
            label="Period End Date"
            type="date"
            v-model="logForm.periodEndDate"
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
          <BaseButton type="submit" :disabled="electricityStore.loading">
            {{ electricityStore.loading ? 'Submitting...' : 'Log Consumption' }}
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Admin Metrics Section -->
    <div v-if="userStore.user?.role === 'ADMIN'" class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Electricity Related Campus Metrics</h2>

      <div v-if="electricityStore.loading">Loading metrics...</div>
      <div v-else class="space-y-4">
        <div
          v-for="metric in electricityStore.metrics"
          :key="metric.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-700">{{ metric.description }}</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metric.metric_value }} {{ metric.metric_unit }}
            </p>
          </div>
          <BaseButton variant="secondary" @click="openEditModal(metric)"> Edit </BaseButton>
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
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import EditMetricModal from '@/components/EditMetricModal.vue'

const electricityStore = useElectricityStore()
const userStore = useUserStore()
const unitsStore = useUnitsStore()
const route = useRoute()

// Form for logging new consumption
const logForm = reactive({
  periodStartDate: '',
  periodEndDate: '',
  unitId: '',
  consumptionKwh: 0,
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
  const selectedUnit = userStore.units.find((u) => u.id === Number(logForm.unitId))
  const success = await electricityStore.submitLog({
    ...logForm,
    unitId: Number(logForm.unitId),
    unitName: selectedUnit?.name,
  })

  if (success) {
    alert('Electricity consumption logged successfully!')
    // Reset form
    Object.assign(logForm, {
      periodStartDate: '',
      periodEndDate: '',
      unitId: '',
      consumptionKwh: 0,
    })
  }
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

async function handleSaveMetric(updatedMetric) {
  const success = await electricityStore.updateMetric(updatedMetric)
  if (success) {
    closeEditModal()
    alert('Metric updated successfully!')
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
    electricityStore.getMetrics()
  }
})
</script>
