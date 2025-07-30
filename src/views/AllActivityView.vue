<template>
  <div class="space-y-8">
    <h1 class="text-2xl font-semibold text-gray-800">System Activity Log</h1>

    <div class="p-8 bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">All Entries</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
        <BaseInput id="startDate" label="Start Date" type="date" v-model="filters.startDate" />
        <BaseInput id="endDate" label="End Date" type="date" v-model="filters.endDate" />
        <BaseSelect
          id="activityType"
          label="Activity Type"
          :options="activityTypes"
          v-model="filters.activityType"
        />
        <div class="flex space-x-2">
          <BaseButton @click="applyFilters" class="w-full">Apply</BaseButton>
          <BaseButton @click="clearFilters" variant="secondary" class="w-full">Clear</BaseButton>
        </div>
      </div>

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
                Activity Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="!paginatedActivities.length">
              <td colspan="4" class="text-center p-4">No activities found.</td>
            </tr>
            <tr v-for="entry in paginatedActivities" :key="`${entry.type}-${entry.id}`">
              <td class="px-6 py-4">{{ new Date(entry.date).toLocaleDateString() }}</td>
              <td class="px-6 py-4">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="getActivityColor(entry.type)"
                >
                  {{ entry.type }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ getActivityDescription(entry) }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ entry.submittedByUsername || entry.submittedBy || 'Unknown' }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="flex justify-between items-center mt-4">
          <span class="text-sm text-gray-600"
            >Page {{ pagination.currentPage }} of {{ totalPages }}</span
          >
          <div>
            <BaseButton
              variant="secondary"
              @click="changePage(pagination.currentPage - 1)"
              :disabled="pagination.currentPage <= 1"
              >Previous</BaseButton
            >
            <BaseButton
              variant="secondary"
              @click="changePage(pagination.currentPage + 1)"
              :disabled="pagination.currentPage >= totalPages"
              class="ml-2"
              >Next</BaseButton
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard.store'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseSelect from '@/components/BaseSelect.vue'

const dashboardStore = useDashboardStore()

const filters = reactive({ startDate: '', endDate: '', activityType: '' })
const pagination = reactive({ currentPage: 1, perPage: 10 })

// FIX: Use `label` instead of `text` for BaseSelect compatibility
const activityTypes = [
  { value: '', label: 'All Activities' },
  { value: 'Vehicle Entry', label: 'Vehicle Entry' },
  { value: 'Water Log', label: 'Water Log' },
  { value: 'Electricity Log', label: 'Electricity Log' },
  { value: 'Waste Log', label: 'Waste Log' },
]

const filteredActivities = computed(() => {
  let activities = dashboardStore.allActivities
  if (filters.startDate)
    activities = activities.filter((a) => new Date(a.date) >= new Date(filters.startDate))
  if (filters.endDate)
    activities = activities.filter((a) => new Date(a.date) <= new Date(filters.endDate))
  if (filters.activityType) activities = activities.filter((a) => a.type === filters.activityType)
  return activities
})

const totalPages = computed(() => Math.ceil(filteredActivities.value.length / pagination.perPage))

const paginatedActivities = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.perPage
  const end = start + pagination.perPage
  return filteredActivities.value.slice(start, end)
})

function applyFilters() {
  pagination.currentPage = 1 // Reset to page 1 when filters change
}

function clearFilters() {
  filters.startDate = ''
  filters.endDate = ''
  filters.activityType = ''
  pagination.currentPage = 1
}

function changePage(page) {
  if (page > 0 && page <= totalPages.value) {
    pagination.currentPage = page
  }
}

function getActivityColor(type) {
  switch (type) {
    case 'Vehicle Entry':
      return 'bg-blue-100 text-blue-800'
    case 'Water Log':
      return 'bg-cyan-100 text-cyan-800'
    case 'Electricity Log':
      return 'bg-yellow-100 text-yellow-800'
    case 'Waste Log':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getActivityDescription(entry) {
  switch (entry.type) {
    case 'Vehicle Entry':
      return `Logged ${entry.privateVehicleCount || 0} private vehicles, ${entry.publicTransportCount || 0} public transport, ${entry.zevCount || 0} ZEVs`
    case 'Water Log':
      return `Logged ${entry.consumptionTon || 0} tons for ${entry.unitName || 'building'}`
    case 'Electricity Log':
      return `Logged ${entry.consumptionKwh || 0} kWh for ${entry.unitName || 'building'}`
    case 'Waste Log':
      return `Logged waste data for ${new Date(entry.date).toLocaleDateString()}`
    default:
      return 'Activity logged'
  }
}

onMounted(() => {
  dashboardStore.fetchAllActivities()
})
</script>
