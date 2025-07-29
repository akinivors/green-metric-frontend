<template>
  <div>
    <label :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    <div class="mt-1">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :disabled="disabled"
        :placeholder="placeholder"
        :required="required"
        @input="$emit('update:modelValue', $event.target.value)"
        :class="[
          'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm disabled:bg-gray-50 disabled:cursor-not-allowed',
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-green-500 focus:border-green-500',
        ]"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-if="help && !error" class="mt-1 text-sm text-gray-500">{{ help }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// This component provides a styled and v-model-compatible input field.

// Props define the component's API.
const props = defineProps({
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  },
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  help: {
    type: String,
    default: '',
  },
})

const inputId = computed(() => props.id)

// Emits are declared to make v-model work correctly.
defineEmits(['update:modelValue'])
</script>
