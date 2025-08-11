<template>
  <tr>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
      <router-link :to="`/users/${user.id}`" class="hover:underline text-indigo-600">
        {{ user.username }}
      </router-link>
    </td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.fullName }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.role }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.unitName }}</td>
    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <router-link :to="`/users/${user.id}/edit`" class="text-indigo-600 hover:text-indigo-900 mr-4"
        >Edit</router-link
      >
      <button
        @click="$emit('reset-password', user)"
        class="text-yellow-600 hover:text-yellow-900 mr-4"
      >
        Reset Password
      </button>
      <button
        @click="$emit('delete', user)"
        class="text-red-600 hover:text-red-900 p-1"
        title="Delete User"
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
defineProps({
  user: {
    type: Object,
    required: true,
  },
})

defineEmits(['delete', 'reset-password'])
</script>
