<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-800 mb-4">My Profile</h1>
    <div class="p-8 bg-white rounded-lg shadow-md max-w-lg">
      <div v-if="userStore.user" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-500">Full Name</label>
          <p class="mt-1 text-lg text-gray-900">{{ userStore.user.fullName }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Username</label>
          <p class="mt-1 text-lg text-gray-900">{{ userStore.user.username }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Role</label>
          <p class="mt-1 text-lg text-gray-900">{{ userStore.user.role }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-500">Assigned Unit</label>
          <p class="mt-1 text-lg text-gray-900">{{ unitName }}</p>
        </div>
      </div>
      <div v-else>
        <p>Loading user profile...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';
import { useUnitsStore } from '@/stores/units.store';

const userStore = useUserStore();
const unitsStore = useUnitsStore();

// Find the unit name corresponding to the user's unitId
const unitName = computed(() => {
  if (!userStore.user || !unitsStore.units.length) {
    return 'Loading...';
  }
  const unit = unitsStore.units.find(u => u.id === userStore.user.unitId);
  return unit ? unit.name : 'N/A';
});

onMounted(() => {
  // Ensure units are fetched if they aren't already
  if (unitsStore.units.length === 0) {
    unitsStore.fetchUnits();
  }
});
</script>
