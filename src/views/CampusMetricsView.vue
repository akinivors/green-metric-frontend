<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">Campus Metrics Management</h1>

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
        <BaseButton @click="applyFilters" class="w-full">Apply Filters</BaseButton>
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
            <p class="font-medium text-gray-700">{{ metric.description }}</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metric.metricValue }} {{ metric.unit || '' }}
            </p>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { useMetricsStore } from '@/stores/metrics.store'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import EditMetricModal from '@/components/EditMetricModal.vue'
import notificationService from '@/services/notificationService'

const metricsStore = useMetricsStore()

const filters = reactive({
  category: '', // Default to all
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

// Add computed property to group metrics by category
const groupedMetrics = computed(() => {
  // First, group the metrics by category (this part is unchanged)
  const grouped = metricsStore.metrics.reduce((acc, metric) => {
    const category = metric.category || 'uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(metric)
    return acc
  }, {})

  // Now, sort the metrics within each category alphabetically by description
  for (const category in grouped) {
    grouped[category].sort((a, b) => a.description.localeCompare(b.description))
  }

  return grouped
})

// Helper function to format category names for display
const formatCategoryName = (category) => {
  return category
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const applyFilters = () => {
  metricsStore.getMetrics({ category: filters.category })
}

// --- Modal Logic ---
const isEditModalOpen = ref(false)
const selectedMetric = ref(null)

function openEditModal(metric) {
  selectedMetric.value = { ...metric }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  selectedMetric.value = null
}

async function handleSaveMetric(updatedMetric) {
  const success = await metricsStore.createMetric(updatedMetric)
  if (success) {
    closeEditModal()
    // After saving, refresh the view with the current filters
    applyFilters()
    notificationService.success('Metric history updated successfully!')
  } else {
    notificationService.error(metricsStore.error || 'Failed to update metric.')
  }
}

// Fetch all metrics with a large page size when the component is first mounted
onMounted(() => {
  metricsStore.getMetrics({ size: 1000, category: '' }) // Fetch up to 1000 metrics
})
</script>
