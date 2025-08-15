<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div class="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-xl">
      <h2 class="text-xl font-bold text-gray-900">Edit Metric</h2>
      <p class="text-sm text-gray-600">{{ formattedDescription }}</p>

      <form @submit.prevent="handleSubmit">
        <div class="flex items-end space-x-2">
          <BaseInput
            class="flex-grow"
            id="metricValue"
            label="New Value"
            type="text"
            v-model="editableValue"
          />
          <span v-if="metricToEdit.unit" class="pb-2 text-gray-500">{{ metricToEdit.unit }}</span>
        </div>

        <!-- Error message display -->
        <div v-if="errorMessage" class="mt-2 text-sm text-red-600">
          {{ errorMessage }}
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <BaseButton type="button" theme="secondary" @click="$emit('close')"> Cancel </BaseButton>
          <BaseButton type="submit" :disabled="isInputInvalid"> Save Changes </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'

const props = defineProps({
  metric: {
    type: Object,
    required: true,
  },
  formattedDescription: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close', 'save'])

const metricToEdit = ref({})
const editableValue = ref('')
const errorMessage = ref('')

// Computed property to check if input is invalid
const isInputInvalid = computed(() => {
  if (!editableValue.value.trim()) {
    return true // Empty value is invalid
  }

  const dataType = metricToEdit.value.dataType
  const value = editableValue.value.trim()

  if (dataType === 'INTEGER') {
    // Use regular expression to ensure input contains only digits
    const integerRegex = /^\d+$/
    return !integerRegex.test(value)
  } else if (dataType === 'NUMBER') {
    // Use regular expression to ensure input is a valid floating-point number
    const numberRegex = /^[+-]?\d*(\.\d+)?$/
    return !numberRegex.test(value)
  }

  return false // If no specific data type, consider it valid
})

onMounted(() => {
  // Create a local copy to avoid directly mutating the prop
  metricToEdit.value = { ...props.metric }
  editableValue.value = props.metric.metricValue
})

// Watch effect to validate input and set error messages
watch(editableValue, (newValue) => {
  if (!newValue.trim()) {
    errorMessage.value = 'Value is required'
    return
  }

  const dataType = metricToEdit.value.dataType
  const value = newValue.trim()

  if (dataType === 'INTEGER') {
    // Use regular expression to ensure input contains only digits
    const integerRegex = /^\d+$/
    if (!integerRegex.test(value)) {
      errorMessage.value = 'Please enter a valid integer'
    } else {
      errorMessage.value = ''
    }
  } else if (dataType === 'NUMBER') {
    // Use regular expression to ensure input is a valid floating-point number
    const numberRegex = /^[+-]?\d*(\.\d+)?$/
    if (!numberRegex.test(value)) {
      errorMessage.value = 'Please enter a valid number'
    } else {
      errorMessage.value = ''
    }
  } else {
    errorMessage.value = ''
  }
})

const handleSubmit = () => {
  if (!isInputInvalid.value) {
    emit('save', { ...metricToEdit.value, metricValue: editableValue.value })
  }
}
</script>
