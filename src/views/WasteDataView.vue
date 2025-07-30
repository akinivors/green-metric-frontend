<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">Waste Data Management</h1>

    <!-- Historical Data Section -->
    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Historical Waste Data</h2>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
        <BaseInput
          id="startDate"
          label="Start Date"
          type="date"
          v-model="wasteStore.filters.startDate"
        />
        <BaseInput id="endDate" label="End Date" type="date" v-model="wasteStore.filters.endDate" />
        <div class="flex space-x-2">
          <BaseButton @click="wasteStore.applyFilters" class="w-full"> Apply Filters </BaseButton>
          <BaseButton @click="wasteStore.clearFilters" variant="secondary" class="w-full">
            Clear
          </BaseButton>
        </div>
      </div>

      <!-- Data Table -->
      <div v-if="wasteStore.loading && !wasteStore.entries.length">Loading data...</div>
      <div v-else-if="wasteStore.error">
        {{ wasteStore.error }}
      </div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Organic Prod. (kg)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Inorganic Recycled (kg)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Toxic Waste (kg)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Submitted By
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!wasteStore.entries.length">
              <td colspan="5" class="text-center p-4">No entries found.</td>
            </tr>
            <tr v-for="entry in wasteStore.entries" :key="entry.id">
              <td class="px-6 py-4">{{ entry.dataDate }}</td>
              <td class="px-6 py-4">{{ entry.organicProductionKg }}</td>
              <td class="px-6 py-4">{{ entry.inorganicRecycledKg }}</td>
              <td class="px-6 py-4">{{ entry.toxicWasteKg }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ entry.submittedByUsername }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600">
            Page {{ wasteStore.pagination.page }} of {{ wasteStore.pagination.totalPages }}
          </span>
          <div>
            <BaseButton
              variant="secondary"
              @click="wasteStore.changePage(wasteStore.pagination.page - 1)"
              :disabled="wasteStore.pagination.page <= 1"
            >
              Previous
            </BaseButton>
            <BaseButton
              variant="secondary"
              @click="wasteStore.changePage(wasteStore.pagination.page + 1)"
              :disabled="wasteStore.pagination.page >= wasteStore.pagination.totalPages"
              class="ml-2"
            >
              Next
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Log New Waste Data Section -->
    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Log New Waste Data</h2>

      <form class="space-y-8" @submit.prevent="handleLogSubmit">
        <div>
          <BaseInput
            id="data_date"
            label="Data Date"
            type="date"
            v-model="logForm.dataDate"
            required
          />
        </div>

        <!-- Organic Waste Section -->
        <div class="p-4 border rounded-md">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Organic Waste</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BaseInput
              label="Production (kg)"
              type="number"
              v-model.number="logForm.organicProductionKg"
              required
            />
            <BaseInput
              label="Consumption (kg)"
              type="number"
              v-model.number="logForm.organicConsumptionKg"
              required
            />
            <BaseInput
              label="Treated (kg)"
              type="number"
              v-model.number="logForm.organicTreatedKg"
              required
            />
          </div>
        </div>

        <!-- Inorganic Waste Section -->
        <div class="p-4 border rounded-md">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Inorganic Waste</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BaseInput
              label="Production (kg)"
              type="number"
              v-model.number="logForm.inorganicProductionKg"
              required
            />
            <BaseInput
              label="Consumption (kg)"
              type="number"
              v-model.number="logForm.inorganicConsumptionKg"
              required
            />
            <BaseInput
              label="Recycled (kg)"
              type="number"
              v-model.number="logForm.inorganicRecycledKg"
              required
            />
          </div>
        </div>

        <!-- Other Waste Section -->
        <div class="p-4 border rounded-md">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Other Waste</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BaseInput
              label="Toxic Waste (kg)"
              type="number"
              v-model.number="logForm.toxicWasteKg"
              required
            />
            <BaseInput
              label="Treated Toxic Waste (kg)"
              type="number"
              v-model.number="logForm.treatedToxicWasteKg"
              required
            />
            <BaseInput
              label="Sewage Disposal (Liters)"
              type="number"
              v-model.number="logForm.sewageDisposalLiters"
              required
            />
          </div>
        </div>

        <div class="pt-4">
          <BaseButton type="submit" :disabled="wasteStore.loading">
            {{ wasteStore.loading ? 'Submitting...' : 'Log Waste Data' }}
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Admin Metrics Section -->
    <div v-if="userStore.user?.role === 'ADMIN'" class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Waste Related Campus Metrics</h2>

      <div v-if="metricsStore.loading">Loading metrics...</div>
      <div v-else class="space-y-4">
        <div
          v-for="metric in wasteMetrics"
          :key="metric.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-700">{{ metric.description }}</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metric.metricValue }} {{ metric.metricUnit || '' }}
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
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useWasteStore } from '@/stores/waste.store'
import { useMetricsStore } from '@/stores/metrics.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import EditMetricModal from '@/components/EditMetricModal.vue'

const wasteStore = useWasteStore()
const userStore = useUserStore()
const metricsStore = useMetricsStore()
const route = useRoute()

// Filter metrics for waste category
const wasteMetrics = computed(() => {
  return metricsStore.metrics.filter(metric => metric.category === 'WASTE')
})

// Form for logging new waste data
const logForm = reactive({
  dataDate: '',
  organicProductionKg: 0,
  organicConsumptionKg: 0,
  organicTreatedKg: 0,
  inorganicProductionKg: 0,
  inorganicConsumptionKg: 0,
  inorganicRecycledKg: 0,
  toxicWasteKg: 0,
  treatedToxicWasteKg: 0,
  sewageDisposalLiters: 0,
})

const handleLogSubmit = async () => {
  const success = await wasteStore.submitLog(logForm)

  if (success) {
    alert('Waste data logged successfully!')
    // Reset form
    Object.assign(logForm, {
      dataDate: '',
      organicProductionKg: 0,
      organicConsumptionKg: 0,
      organicTreatedKg: 0,
      inorganicProductionKg: 0,
      inorganicConsumptionKg: 0,
      inorganicRecycledKg: 0,
      toxicWasteKg: 0,
      treatedToxicWasteKg: 0,
      sewageDisposalLiters: 0,
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
  const success = await metricsStore.updateMetric(updatedMetric)
  if (success) {
    closeEditModal()
    alert('Metric updated successfully!')
    // Refresh the waste metrics to show the updated data
    await metricsStore.getMetrics('WASTE')
  }
}

// Watch the URL to drive the page state
watch(
  () => route.query,
  (newQuery) => {
    wasteStore.initializeFromUrl(newQuery)
  },
  { immediate: true },
)

onMounted(() => {
  if (userStore.user?.role === 'ADMIN') {
    metricsStore.getMetrics('WASTE')
  }
})
</script>
