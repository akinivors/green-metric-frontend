<template>
  <div class="h-screen flex bg-gray-100 font-sans">
    <aside
      class="flex flex-col text-white bg-slate-800 transition-width duration-300 ease-in-out"
      :class="isSidebarOpen ? 'w-64' : 'w-20'"
    >
      <div
        class="h-16 flex items-center justify-between px-4 border-b border-slate-700 flex-shrink-0"
      >
        <span v-if="isSidebarOpen" class="text-xl font-bold">GreenMetrik</span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        <router-link
          to="/"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Dashboard</span>
        </router-link>
        <router-link
          v-if="userStore.user?.role === 'ADMIN'"
          to="/users"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Users</span>
        </router-link>
        <router-link
          v-if="['ADMIN', 'GUVENLIK'].includes(userStore.user?.role)"
          to="/vehicle-entries"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 17l-5 4v-5h-2a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Vehicle Entries</span>
        </router-link>
        <router-link
          v-if="['ADMIN', 'BINA_GOREVLISI'].includes(userStore.user?.role)"
          to="/water-consumption"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Water Consumption</span>
        </router-link>
        <router-link
          v-if="['ADMIN', 'BINA_GOREVLISI'].includes(userStore.user?.role)"
          to="/electricity-consumption"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Electricity</span>
        </router-link>
        <router-link
          v-if="['ADMIN', 'YEMEKHANE'].includes(userStore.user?.role)"
          to="/waste-data"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Waste Data</span>
        </router-link>
        <router-link
          v-if="userStore.user?.role === 'ADMIN'"
          to="/campus-metrics"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Campus Metrics</span>
        </router-link>
        <router-link
          v-if="userStore.user?.role === 'ADMIN'"
          to="/activity-log"
          class="flex items-center px-2 py-2 rounded-md hover:bg-slate-700"
          active-class="bg-slate-700"
        >
          <svg class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span v-if="isSidebarOpen" class="ml-4">Activity Log</span>
        </router-link>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div>
          <button
            @click="toggleSidebar"
            class="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        <div class="relative">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
          >
            <span>{{ userStore.user?.fullName }}</span>
            <svg
              class="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            v-if="isUserMenuOpen"
            @click="isUserMenuOpen = false"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
          >
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              My Profile
            </router-link>
            <a
              href="#"
              @click.prevent="handleLogout"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </a>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        <router-view />
      </main>
    </div>
    <ChangePasswordModal v-if="userStore.user && userStore.user.isTemporaryPassword" />
    <ConfirmationModal
      :show="showConfirmationModal"
      :title="confirmationTitle"
      :message="confirmationMessage"
      :confirm-button-text="confirmButtonText"
      :cancel-button-text="cancelButtonText"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import ChangePasswordModal from '@/components/ChangePasswordModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'
import { useModal } from '@/services/modalService'

const authStore = useAuthStore()
const userStore = useUserStore()
const router = useRouter()

const {
  show: showConfirmationModal,
  title: confirmationTitle,
  message: confirmationMessage,
  confirmButtonText,
  cancelButtonText,
  handleConfirm,
  handleCancel,
} = useModal()

const isSidebarOpen = ref(true) // Sidebar is open by default
const isUserMenuOpen = ref(false) // State for the new user menu

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const handleLogout = () => {
  isUserMenuOpen.value = false // Close menu on logout
  authStore.logout()
  router.push('/login')
}
</script>
