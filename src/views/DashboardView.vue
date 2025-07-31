<template>
  <div>
    <div v-if="userStore.user?.role === 'ADMIN'">
      <h1 class="text-2xl font-semibold text-gray-800 mb-4">Admin Dashboard Overview</h1>

      <div v-if="dashboardStore.loading" class="text-center p-8">Loading dashboard data...</div>
      <div v-else-if="dashboardStore.error" class="p-4 bg-red-100 text-red-700 rounded-md">
        {{ dashboardStore.error }}
      </div>
      <div
        v-else-if="
          dashboardStore.consumptionStats &&
          dashboardStore.vehicleStats &&
          dashboardStore.wasteStats
        "
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-sm font-medium text-gray-500">Water Consumption (Last Month)</h3>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ dashboardStore.consumptionStats.summary.totalWaterTon?.toLocaleString() || 0 }}
              <span class="text-lg font-medium">Tons</span>
            </p>
          </div>
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-sm font-medium text-gray-500">Electricity (Last Month)</h3>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{
                dashboardStore.consumptionStats.summary.totalElectricityKwh?.toLocaleString() || 0
              }}
              <span class="text-lg font-medium">kWh</span>
            </p>
          </div>
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-sm font-medium text-gray-500">Private Vehicles (Last Month)</h3>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ dashboardStore.vehicleStats.summary.totalPrivateVehicle?.toLocaleString() || 0 }}
            </p>
          </div>
          <div class="p-6 bg-white rounded-lg shadow-md">
            <h3 class="text-sm font-medium text-gray-500">Total Waste (Last Month)</h3>
            <p class="text-3xl font-bold text-gray-900 mt-2">
              {{ totalWasteKg.toLocaleString() }} <span class="text-lg font-medium">kg</span>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 p-8 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">
              Vehicle Entry Trends (Last Month)
            </h2>
            <div class="h-96"><Bar :data="chartData" :options="chartOptions" /></div>
          </div>
          <div class="p-8 bg-white rounded-lg shadow-md">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div v-if="dashboardStore.loading">Loading activity...</div>
            <ul v-else class="divide-y divide-gray-200">
              <li
                v-for="item in dashboardStore.recentActivity"
                :key="item.id"
                class="py-3"
              >
                <p class="font-medium text-gray-800">
                  {{ item.eventType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) }}
                </p>
                <span class="text-sm text-gray-500">
                  Logged by {{ item.username }} on
                  {{ new Date(item.timestamp).toLocaleDateString() }}
                </span>
              </li>
            </ul>
            <div class="mt-4 text-center">
              <router-link
                to="/activity-log"
                class="text-sm font-medium text-green-600 hover:text-green-500"
              >
                View All Activity &rarr;
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-8 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-semibold text-gray-800">Welcome, {{ userStore.user?.fullName }}!</h1>
      <p class="mt-2 text-gray-600">Use the sidebar navigation to access your assigned tasks.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { useDashboardStore } from '@/stores/dashboard.store'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const userStore = useUserStore()
const dashboardStore = useDashboardStore()

const totalWasteKg = computed(() => {
  const summary = dashboardStore.wasteStats?.summary
  if (!summary) return 0
  return (
    (summary.totalOrganicWasteKg || 0) +
    (summary.totalInorganicWasteKg || 0) +
    (summary.totalToxicWasteKg || 0)
  )
})

const chartData = computed(() => {
  const stats = dashboardStore.vehicleStats?.graphData
  if (!stats || !Array.isArray(stats) || stats.length === 0) return { labels: [], datasets: [] }

  const labels = stats.map((d) => d.date) // Assuming monthly data gives a month string
  return {
    labels,
    datasets: [
      {
        label: 'Public Transport',
        backgroundColor: '#34D399',
        data: stats.map((d) => d.publicTransport),
      },
      {
        label: 'Private Vehicles',
        backgroundColor: '#60A5FA',
        data: stats.map((d) => d.privateVehicle),
      },
      { label: 'ZEVs', backgroundColor: '#A78BFA', data: stats.map((d) => d.zev) },
    ],
  }
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
})

onMounted(() => {
  if (userStore.user?.role === 'ADMIN') {
    dashboardStore.getStats()
    dashboardStore.getActivityLog(0, 5) // Fetch the first 5 activities for the preview
  }
})
</script>
