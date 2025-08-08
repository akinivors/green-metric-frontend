<template>
  <tr :class="isExpanded ? 'bg-gray-50' : ''">
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {{ entry.dataDate }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
      {{ entry.organicProductionKg }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
      {{ entry.inorganicRecycledKg }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
      {{ entry.toxicWasteKg }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {{ entry.submittedByUsername }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button @click="isExpanded = !isExpanded" class="text-indigo-600 hover:text-indigo-900 mr-4">
        {{ isExpanded ? 'Hide Details' : 'Show Details' }}
      </button>
      <button @click="$emit('delete', entry)" class="text-red-600 hover:text-red-900">
        Delete
      </button>
    </td>
  </tr>

  <tr v-if="isExpanded">
    <td colspan="6" class="p-0">
      <div class="p-6 bg-gray-100">
        <h4 class="font-semibold text-gray-800 mb-4 border-b pb-2">
          Full Waste Report for {{ entry.dataDate }}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
          <div class="space-y-3">
            <h5 class="font-bold text-gray-700">Organic Waste</h5>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Production:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.organicProductionKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Consumption:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.organicConsumptionKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Treated:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.organicTreatedKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
          </div>

          <div class="space-y-3">
            <h5 class="font-bold text-gray-700">Inorganic Waste</h5>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Production:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.inorganicProductionKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Consumption:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.inorganicConsumptionKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Recycled:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.inorganicRecycledKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
          </div>

          <div class="space-y-3">
            <h5 class="font-bold text-gray-700">Other Waste</h5>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Toxic Waste:</span>
              <span class="font-medium text-red-700 w-24 text-right flex-shrink-0">{{
                entry.toxicWasteKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Treated Toxic:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.treatedToxicWasteKg
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">kg</span>
            </div>
            <div class="flex">
              <span class="text-gray-500 w-32 flex-shrink-0">Sewage Disposal:</span>
              <span class="font-medium text-gray-900 w-24 text-right flex-shrink-0">{{
                entry.sewageDisposalLiters
              }}</span>
              <span class="text-gray-500 ml-14 w-6 flex-shrink-0">L</span>
            </div>
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

defineEmits(['delete'])

const isExpanded = ref(false)
</script>
