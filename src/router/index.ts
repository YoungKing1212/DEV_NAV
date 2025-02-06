import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/bookmarks',
    name: 'bookmarks',
    component: () => import('@/views/BookmarksView.vue')
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('@/views/ToolsView.vue'),
    children: [
      {
        path: ':toolId',
        name: 'tool-detail',
        component: () => import('@/views/ToolDetail.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 