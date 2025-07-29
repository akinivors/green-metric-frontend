<template>
  <div>
    <!-- Admin Dashboard -->
    <div v-if="userStore.user?.role === 'ADMIN'">
      <h1 class="text-2xl font-semibold text-gray-800 mb-4">Admin Dashboard Overview</h1>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Water Consumption (Last 30 Days)</h3>
          <p class="text-3xl font-bold text-gray-900 mt-2">
            12,500 <span class="text-lg font-medium">Tons</span>
          </p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Electricity (Last 30 Days)</h3>
          <p class="text-3xl font-bold text-gray-900 mt-2">
            150,000 <span class="text-lg font-medium">kWh</span>
          </p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Private Vehicles (Last 30 Days)</h3>
          <p class="text-3xl font-bold text-gray-900 mt-2">24,000</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-sm font-medium text-gray-500">Waste Recycled (Last 30 Days)</h3>
          <p class="text-3xl font-bold text-gray-900 mt-2">
            5,200 <span class="text-lg font-medium">kg</span>
          </p>
        </div>
      </div>

      <!-- Charts and Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Chart Section -->
        <div class="lg:col-span-2 p-8 bg-white rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Vehicle Entry Trends (Last 7 Days)
          </h2>
          <div class="h-96">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Recent Activity Section -->
        <div class="p-8 bg-white rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <ul class="divide-y divide-gray-200">
            <li v-for="item in mockRecentActivity" :key="item.id" class="py-3">
              <p class="font-medium text-gray-800">{{ item.description }}</p>
              <span class="text-sm text-gray-500">{{ item.user }} on {{ item.date }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Non-Admin Dashboard -->
    <div v-else class="p-8 bg-white rounded-lg shadow-md">
      <h1 class="text-2xl font-semibold text-gray-800">Welcome, {{ userStore.user?.fullName }}!</h1>
      <p class="mt-2 text-gray-600">
        This is your dashboard. Use the sidebar navigation to access your assigned tasks.
      </p>
      <div class="mt-4">
        <p><strong>Your Role:</strong> {{ userStore.user?.role }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user.store'
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

// This setup logic is now only for the Admin view
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const userStore = useUserStore()

// Mock data for the chart
const chartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Public Transport',
      backgroundColor: '#34D399', // Green
      data: [150, 155, 160, 152, 158, 165, 170],
    },
    {
      label: 'Private Vehicles',
      backgroundColor: '#60A5FA', // Blue
      data: [800, 810, 790, 820, 830, 850, 840],
    },
    {
      label: 'ZEVs',
      backgroundColor: '#A78BFA', // Purple
      data: [50, 55, 60, 58, 62, 65, 70],
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: false,
    },
    legend: {
      position: 'bottom',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
})

// Mock data for recent activity
const mockRecentActivity = [
  {
    id: 1,
    description: 'Logged new Water Consumption data.',
    user: 'bina_gorevlisi_1',
    date: 'July 29, 2025',
  },
  {
    id: 2,
    description: 'Logged new Vehicle Entry.',
    user: 'security_user1',
    date: 'July 29, 2025',
  },
  { id: 3, description: 'Updated a Campus Metric.', user: 'admin', date: 'July 28, 2025' },
  { id: 4, description: 'Logged new Waste Data.', user: 'yemekhane_user1', date: 'July 28, 2025' },
]
</script>
