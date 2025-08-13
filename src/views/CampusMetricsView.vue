<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">Campus Metrics Management</h1>

    <!-- Historical Data Section -->
    <div class="p-8 bg-white rounded-lg shadow-md mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Historical Data</h2>

      <!-- Filter Controls -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        <BaseSelect
          id="historyCategory"
          label="Category"
          v-model="metricsStore.historyFilters.category"
          :options="categoryOptions"
        />
        <BaseInput
          id="historyStartDate"
          label="Start Date"
          type="date"
          v-model="metricsStore.historyFilters.startDate"
        />
        <BaseInput
          id="historyEndDate"
          label="End Date"
          type="date"
          v-model="metricsStore.historyFilters.endDate"
        />
        <div class="flex space-x-2">
          <BaseButton @click="applyHistoryFilters" class="w-full">Apply Filters</BaseButton>
          <BaseButton @click="clearHistoryFilters" theme="secondary" class="w-full">Clear</BaseButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="metricsStore.historyLoading" class="text-center p-8">
        Loading historical data...
      </div>

      <!-- Historical Data Table -->
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!metricsStore.metricHistory.length">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                No historical data found.
              </td>
            </tr>
            <tr v-for="metric in metricsStore.metricHistory" :key="metric.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ metric.metricDate }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCategoryName(metric.category) }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ formatDescription(metric.description) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ metric.metricValue }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ metric.unit }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="metricsStore.metricHistory.length > 0" class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600">
            Page {{ metricsStore.historyPagination.number + 1 }} of {{ metricsStore.historyPagination.totalPages }}
          </span>
          <div>
            <BaseButton
              theme="secondary"
              @click="metricsStore.changeHistoryPage(metricsStore.historyPagination.number - 1)"
              :disabled="metricsStore.historyPagination.number <= 0"
            >
              Previous
            </BaseButton>
            <BaseButton
              theme="secondary"
              @click="metricsStore.changeHistoryPage(metricsStore.historyPagination.number + 1)"
              :disabled="metricsStore.historyPagination.number >= metricsStore.historyPagination.totalPages - 1"
              class="ml-2"
            >
              Next
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <BaseSelect
          id="categoryFilter"
          label="Filter by Category"
          v-model="filters.category"
          :options="categoryOptions"
        />
        <div></div>
        <div></div>
        <BaseButton @click="applyLatestMetricsFilter" class="w-full">Apply Filters</BaseButton>
      </div>
    </div>

    <div v-if="metricsStore.loading" class="text-center p-8">Loading metrics...</div>
    <div v-else-if="metricsStore.error" class="p-4 bg-red-100 text-red-700 rounded-md">
      {{ metricsStore.error }}
    </div>
    <div v-else-if="!metricsStore.metrics.length" class="text-center p-8 text-gray-500">
      No metrics found for the selected criteria.
    </div>

    <div
      v-else
      v-for="(group, category) in groupedMetrics"
      :key="category"
      class="p-8 bg-white rounded-lg shadow-md"
    >
      <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ formatCategoryName(category) }}</h2>
      <div class="space-y-4">
        <div
          v-for="metric in group"
          :key="metric.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-700">{{ formatDescription(metric.description) }}</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metric.metricValue }} {{ metric.unit || '' }}
            </p>
          </div>
          <div class="flex space-x-2">
            <BaseButton theme="secondary" @click="openHistoryModal(metric)">History</BaseButton>
            <BaseButton theme="secondary" @click="openEditModal(metric)">Edit</BaseButton>
          </div>
        </div>
      </div>
    </div>

    <EditMetricModal
      v-if="isEditModalOpen"
      :metric="selectedMetric"
      :formatted-description="formatDescription(selectedMetric.description)"
      @close="closeEditModal"
      @save="handleSaveMetric"
    />

    <MetricHistoryModal
      v-if="isHistoryModalOpen"
      :metric="selectedMetric"
      :historyData="selectedMetricHistory"
      :formatted-description="formatDescription(selectedMetric.description)"
      @close="closeHistoryModal"
      @page-changed="handleHistoryModalPageChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMetricsStore } from '../stores/metrics.store'
import BaseButton from '../components/BaseButton.vue'
import BaseSelect from '../components/BaseSelect.vue'
import BaseInput from '../components/BaseInput.vue'
import EditMetricModal from '../components/EditMetricModal.vue'
import MetricHistoryModal from '../components/MetricHistoryModal.vue'
import notificationService from '../services/notificationService'

const metricsStore = useMetricsStore()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  category: '',
})

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'SETTING_INFRASTRUCTURE', label: 'Setting and Infrastructure' },
  { value: 'ENERGY_CLIMATE_CHANGE', label: 'Energy and Climate Change' },
  { value: 'WASTE', label: 'Waste' },
  { value: 'WATER', label: 'Water' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'EDUCATION_RESEARCH', label: 'Education and Research' },
]

const groupedMetrics = computed(() => {
  const grouped = metricsStore.metrics.reduce((acc, metric) => {
    const category = metric.category || 'uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(metric)
    return acc
  }, {})

  for (const category in grouped) {
    grouped[category].sort((a, b) => a.description.localeCompare(b.description))
  }

  return grouped
})

const formatCategoryName = (category) => {
  return category
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatDescription = (description) => {
  if (!description) return ''

  return description
    .replace(/^Sample data for /, '') // Remove "Sample data for " prefix
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
}

// New methods for Historical Data section
const applyHistoryFilters = () => {
  metricsStore.historyPagination.number = 0
  router.push({
    query: {
      ...metricsStore.historyFilters,
      page: 0
    }
  })
}

const clearHistoryFilters = () => {
  metricsStore.historyFilters.category = ''
  metricsStore.historyFilters.startDate = ''
  metricsStore.historyFilters.endDate = ''
  applyHistoryFilters()
}

const applyLatestMetricsFilter = () => {
  metricsStore.getMetrics({ category: filters.category })
}

const isEditModalOpen = ref(false)
const selectedMetric = ref(null)

// History modal state
const isHistoryModalOpen = ref(false)
const selectedMetricHistory = ref(null)

function openEditModal(metric) {
  selectedMetric.value = { ...metric }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  selectedMetric.value = null
}

async function openHistoryModal(metric) {
  selectedMetric.value = { ...metric }
  const historyData = await metricsStore.getMetricHistoryByKey({
    metricKey: metric.metricKey,
    page: 0,
    size: 10
  })

  if (historyData) {
    selectedMetricHistory.value = historyData
    isHistoryModalOpen.value = true
  } else {
    notificationService.error('Failed to fetch metric history.')
  }
}

function closeHistoryModal() {
  isHistoryModalOpen.value = false
  selectedMetricHistory.value = null
}

async function handleHistoryModalPageChange(newPage) {
  if (selectedMetric.value?.metricKey) {
    const historyData = await metricsStore.getMetricHistoryByKey({
      metricKey: selectedMetric.value.metricKey,
      page: newPage,
      size: 10
    })

    if (historyData) {
      selectedMetricHistory.value = historyData
    } else {
      notificationService.error('Failed to fetch metric history page.')
    }
  }
}

async function handleSaveMetric(updatedMetric) {
  const success = await metricsStore.createMetric(updatedMetric)
  if (success) {
    closeEditModal()
    applyLatestMetricsFilter()
    notificationService.success('Metric updated successfully!')
  } else {
    notificationService.error(metricsStore.error || 'Failed to update metric.')
  }
}

// Watch the URL to drive the historical data state
watch(
  () => route.query,
  (newQuery) => {
    metricsStore.initializeHistoryFromUrl(newQuery)
  },
  { immediate: true }
)

onMounted(() => {
  metricsStore.getMetrics({ size: 1000, category: '' })
})
</script>
