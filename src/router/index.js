import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import LoginView from '../views/LoginView.vue'
import UsersListView from '../views/UsersListView.vue'
import VehicleEntryView from '../views/VehicleEntryView.vue'
import WaterConsumptionView from '../views/WaterConsumptionView.vue'
import ElectricityConsumptionView from '../views/ElectricityConsumptionView.vue'
import WasteDataView from '../views/WasteDataView.vue'
import ProfileView from '../views/ProfileView.vue'
import AllActivityView from '../views/AllActivityView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true }, // Mark this group as requiring authentication
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
        },
        {
          path: '/users',
          name: 'users-list',
          component: UsersListView,
          meta: { requiresAdmin: true }, // <-- Add this meta flag
        },
        {
          path: '/users/create',
          name: 'users-create',
          component: () => import('../views/CreateUserView.vue'),
          meta: { requiresAdmin: true }, // <-- Add this meta flag
        },
        {
          path: '/vehicle-entries',
          name: 'vehicle-entries',
          component: VehicleEntryView,
          // No admin meta required here, as the component itself handles the admin view
        },
        {
          path: '/water-consumption',
          name: 'water-consumption',
          component: WaterConsumptionView,
        },
        {
          path: '/electricity-consumption',
          name: 'electricity-consumption',
          component: ElectricityConsumptionView,
        },
        {
          path: '/waste-data',
          name: 'waste-data',
          component: WasteDataView,
        },
        {
          path: '/profile',
          name: 'profile',
          component: ProfileView,
        },
        {
          path: '/activity-log',
          name: 'activity-log',
          component: AllActivityView,
          meta: { requiresAdmin: true },
        },
      ],
    },
  ],
})

export default router
