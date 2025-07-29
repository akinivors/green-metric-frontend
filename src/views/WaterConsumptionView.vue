<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">Water Consumption Management</h1>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Historical Consumption Data</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        <BaseInput
          id="startDate"
          label="Start Date"
          type="date"
          v-model="waterStore.filters.startDate"
        />
        <BaseInput id="endDate" label="End Date" type="date" v-model="waterStore.filters.endDate" />
        <div class="flex space-x-2">
          <BaseButton @click="waterStore.applyFilters" class="w-full">Apply</BaseButton>
          <BaseButton @click="waterStore.clearFilters" variant="secondary" class="w-full"
            >Clear</BaseButton
          >
        </div>
      </div>

      <div v-if="waterStore.loading && !waterStore.entries.length">Loading data...</div>
      <div v-else-if="waterStore.error">{{ waterStore.error }}</div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Period
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Consumption (Tons)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Recycled Water (Liters)
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Treated Water (Liters)
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!waterStore.entries.length">
              <td colspan="5" class="text-center p-4">No entries found.</td>
            </tr>
            <tr v-for="entry in waterStore.entries" :key="entry.id">
              <td class="px-6 py-4">
                {{ entry.period_start_date }} to {{ entry.period_end_date }}
              </td>
              <td class="px-6 py-4">{{ entry.unitName }}</td>
              <td class="px-6 py-4">{{ entry.consumption_ton }}</td>
              <td class="px-6 py-4">{{ entry.recycled_water_usage_liters }}</td>
              <td class="px-6 py-4">{{ entry.treated_water_consumption_liters }}</td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600"
            >Page {{ waterStore.pagination.page }} of {{ waterStore.pagination.totalPages }}</span
          >
          <div>
            <BaseButton
              variant="secondary"
              @click="waterStore.changePage(waterStore.pagination.page - 1)"
              :disabled="waterStore.pagination.page <= 1"
              >Previous</BaseButton
            >
            <BaseButton
              variant="secondary"
              @click="waterStore.changePage(waterStore.pagination.page + 1)"
              :disabled="waterStore.pagination.page >= waterStore.pagination.totalPages"
              class="ml-2"
              >Next</BaseButton
            >
          </div>
        </div>
      </div>
    </div>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Log New Water Consumption</h2>
      <form class="space-y-6" @submit.prevent="handleLogSubmit">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <BaseInput
            id="newStartDate"
            label="Period Start Date"
            type="date"
            v-model="logForm.period_start_date"
            required
          />
          <BaseInput
            id="newEndDate"
            label="Period End Date"
            type="date"
            v-model="logForm.period_end_date"
            required
          />
          <BaseSelect
            id="newUnit"
            label="Unit"
            v-model="logForm.unitId"
            :options="unitOptions"
            required
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <BaseInput
            id="newConsumption"
            label="Consumption (Tons)"
            type="number"
            v-model.number="logForm.consumption_ton"
            required
          />
          <BaseInput
            id="newRecycled"
            label="Recycled Water Usage (Liters)"
            type="number"
            v-model.number="logForm.recycled_water_usage_liters"
            required
          />
          <BaseInput
            id="newTreated"
            label="Treated Water Consumption (Liters)"
            type="number"
            v-model.number="logForm.treated_water_consumption_liters"
            required
          />
        </div>
        <div class="pt-4">
          <BaseButton type="submit" :disabled="waterStore.loading">{{
            waterStore.loading ? 'Submitting...' : 'Log Consumption'
          }}</BaseButton>
        </div>
      </form>
    </div>

    <div v-if="userStore.user?.role === 'ADMIN'" class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Water Related Campus Metrics</h2>
      <div v-if="waterStore.loading">Loading metrics...</div>
      <div v-else class="space-y-4">
        <div
          v-for="metric in waterStore.metrics"
          :key="metric.id"
          class="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p class="font-medium text-gray-700">{{ metric.description }}</p>
            <p class="text-2xl font-bold text-gray-900">
              {{ metric.metric_value }} {{ metric.metric_unit }}
            </p>
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { useWaterStore } from '@/stores/water.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import EditMetricModal from '@/components/EditMetricModal.vue'

const userStore = useUserStore()
const waterStore = useWaterStore()
const route = useRoute()

const logForm = reactive({
  period_start_date: '',
  period_end_date: '',
  unitId: '',
  consumption_ton: 0,
  recycled_water_usage_liters: 0,
  treated_water_consumption_liters: 0,
})

// This uses the real API units from userStore
const unitOptions = computed(() => {
  if (!userStore.units || userStore.units.length === 0) {
    return [{ value: '', label: 'Loading...' }]
  }
  return userStore.units.map((unit) => ({ value: unit.id, label: unit.name }))
})

const handleLogSubmit = async () => {
  const selectedUnit = userStore.units.find((u) => u.id === Number(logForm.unitId))
  const success = await waterStore.submitLog({
    ...logForm,
    unitId: Number(logForm.unitId),
    unitName: selectedUnit?.name,
  })
  if (success) {
    alert('Water consumption logged successfully!')
    // Reset form
    Object.assign(logForm, {
      period_start_date: '',
      period_end_date: '',
      unitId: '',
      consumption_ton: 0,
      recycled_water_usage_liters: 0,
      treated_water_consumption_liters: 0,
    })
  }
}

const { isEditModalOpen, selectedMetric, openEditModal, closeEditModal, handleSaveMetric } =
  useMetricEditing(waterStore)

watch(
  () => route.query,
  (newQuery) => {
    waterStore.initializeFromUrl(newQuery)
  },
  { immediate: true },
)

onMounted(() => {
  userStore.fetchUnits() // Fetch real units from API
  if (userStore.user?.role === 'ADMIN') {
    waterStore.getMetrics()
  }
})

// Extracted modal logic into a reusable composable for cleanliness
function useMetricEditing(store) {
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
    const success = await store.updateMetric(updatedMetric)
    if (success) {
      closeEditModal()
      alert('Metric updated successfully!')
    }
  }
  return { isEditModalOpen, selectedMetric, openEditModal, closeEditModal, handleSaveMetric }
}
</script>
