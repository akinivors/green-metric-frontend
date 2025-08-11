<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
      {{ entry.periodStartDate }} to {{ entry.periodEndDate }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ entry.unitName }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
      {{ isElectricity ? entry.consumptionKwh : entry.consumptionTon }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {{ entry.submittedByUsername }}
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <button
        @click="$emit('delete', entry)"
        class="text-red-600 hover:text-red-900 p-1"
        title="Delete Entry"
      >
        <svg
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </button>
    </td>
  </tr>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
  type: {
    type: String,
    required: true, // 'water' or 'electricity'
  },
})

defineEmits(['delete'])

const isElectricity = computed(() => props.type === 'electricity')
</script>
