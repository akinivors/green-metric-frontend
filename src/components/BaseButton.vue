<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
      themeClasses,
      disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-3 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  // NEW: Add the loading prop
  loading: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: 'primary', // primary, secondary, danger
  },
})

const themeClasses = computed(() => {
  switch (props.theme) {
    case 'secondary':
      return 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
    case 'danger':
      return 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
    case 'primary':
    default:
      return 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
  }
})
</script>
