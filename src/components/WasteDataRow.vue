<template>
  <tr class="cursor-pointer hover:bg-gray-50" @click="isExpanded = !isExpanded">
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.dataDate }}</td>
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.organicProductionKg }}</td>
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.inorganicRecycledKg }}</td>
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.toxicWasteKg }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ entry.submittedByUsername }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div class="flex items-center justify-end space-x-2">
        <!-- Delete Button (Admin or own entry) -->
        <button
          v-if="userStore.user?.role === 'ADMIN' || userStore.user?.id === entry.submittedBy"
          @click.stop="handleDelete"
          class="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          :disabled="wasteStore.loading"
        >
          {{ wasteStore.loading ? 'Deleting...' : 'Delete' }}
        </button>

        <!-- Expand/Collapse Arrow -->
        <svg
          class="h-5 w-5 text-gray-400 transform transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </td>
  </tr>
  <tr v-if="isExpanded">
    <td colspan="6" class="p-0">
      <div class="p-4 bg-gray-50">
        <h4 class="font-semibold text-gray-700 mb-2">Full Entry Details:</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="font-medium text-gray-500">Organic Consumption</p>
            <p class="text-gray-900">{{ entry.organicConsumptionKg }} kg</p>
          </div>
          <div>
            <p class="font-medium text-gray-500">Organic Treated</p>
            <p class="text-gray-900">{{ entry.organicTreatedKg }} kg</p>
          </div>
          <div>
            <p class="font-medium text-gray-500">Inorganic Production</p>
            <p class="text-gray-900">{{ entry.inorganicProductionKg }} kg</p>
          </div>
          <div>
            <p class="font-medium text-gray-500">Inorganic Consumption</p>
            <p class="text-gray-900">{{ entry.inorganicConsumptionKg }} kg</p>
          </div>
          <div>
            <p class="font-medium text-gray-500">Treated Toxic Waste</p>
            <p class="text-gray-900">{{ entry.treatedToxicWasteKg }} kg</p>
          </div>
          <div>
            <p class="font-medium text-gray-500">Sewage Disposal</p>
            <p class="text-gray-900">{{ entry.sewageDisposalLiters }} L</p>
          </div>
        </div>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { useWasteStore } from '@/stores/waste.store'
import notificationService from '@/services/notificationService'
import { useModal } from '@/services/modalService'

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
})

const userStore = useUserStore()
const wasteStore = useWasteStore()
const isExpanded = ref(false)
const { confirm } = useModal()

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Delete Waste Entry',
    message: `Are you sure you want to delete the waste entry from ${props.entry.dataDate}? This action cannot be undone.`,
    confirmButtonText: 'Delete',
  })

  if (confirmed) {
    const success = await wasteStore.deleteWasteData(props.entry.id)
    if (success) {
      notificationService.success('Waste entry deleted successfully!')
    } else {
      notificationService.error('Failed to delete waste entry. Please try again.')
    }
  }
}
</script>
