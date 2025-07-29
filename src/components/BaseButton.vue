<template>
  <button :class="buttonClass" :disabled="disabled" :type="type" @click="$emit('click')">
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Define props using defineProps
const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary' or 'secondary'
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button',
  },
})

// Define emits
defineEmits(['click'])

// Compute the button's CSS classes based on the variant prop
const buttonClass = computed(() => {
  const baseClasses =
    'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200'

  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  if (props.variant === 'primary') {
    const primaryClasses = props.disabled
      ? 'bg-green-500 text-white'
      : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
    return `${baseClasses} ${primaryClasses} ${disabledClasses}`
  }

  if (props.variant === 'secondary') {
    const secondaryClasses = props.disabled
      ? 'bg-white text-gray-700 border border-gray-300'
      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
    return `${baseClasses} ${secondaryClasses} ${disabledClasses}`
  }

  return `${baseClasses} ${disabledClasses}`
})
</script>
