import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import TuneHistoryView from '@/views/TuneHistoryView.vue'
import WaferMapView from '@/views/WaferMapView.vue'
import ImprovementAnalysisView from '@/views/ImprovementAnalysisView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/tune-history', name: 'tune-history', component: TuneHistoryView },
    { path: '/wafer-map', name: 'wafer-map', component: WaferMapView },
    { path: '/improvement-analysis', name: 'improvement-analysis', component: ImprovementAnalysisView },
  ],
})

export default router
