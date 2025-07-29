<template>
  <div>
    <label :for="selectId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    <div class="mt-1">
      <select
        :id="selectId"
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        @change="$emit('update:modelValue', $event.target.value)"
        :class="[
          'block w-full pl-3 pr-10 py-2 text-base focus:outline-none sm:text-sm rounded-md disabled:bg-gray-50 disabled:cursor-not-allowed',
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-green-500 focus:border-green-500',
        ]"
      >
        <option value="" disabled>Please select one</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// This component provides a styled and v-model-compatible select dropdown.

// Props define the component's API.
const props = defineProps({
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substr(2, 9)}`,
  },
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
  // The options prop accepts an array of objects, e.g., [{ value: 'admin', label: 'Administrator' }]
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

const selectId = computed(() => props.id)

// Emits are declared to make v-model work correctly.
defineEmits(['update:modelValue'])
</script>
