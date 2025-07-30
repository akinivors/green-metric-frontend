<template>
  <tr class="cursor-pointer hover:bg-gray-50" @click="isExpanded = !isExpanded">
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.dataDate }}</td>
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.organicProductionKg }}</td>
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.inorganicRecycledKg }}</td>
    <td class="px-6 py-4 whitespace-nowrap">{{ entry.toxicWasteKg }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ entry.submittedByUsername }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <svg
        class="h-5 w-5 text-gray-400 transform transition-transform duration-200"
        :class="{ 'rotate-90': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
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

defineProps({
  entry: {
    type: Object,
    required: true,
  },
})

const isExpanded = ref(false)
</script>
