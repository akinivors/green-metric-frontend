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

        <div class="flex justify-end space-x-4 mt-6">
          <BaseButton type="button" theme="secondary" @click="$emit('close')"> Cancel </BaseButton>
          <BaseButton type="submit"> Save Changes </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

onMounted(() => {
  // Create a local copy to avoid directly mutating the prop
  metricToEdit.value = { ...props.metric }
  editableValue.value = props.metric.metricValue
})

const handleSubmit = () => {
  emit('save', { ...metricToEdit.value, metricValue: editableValue.value })
}
</script>
