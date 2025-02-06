<template>
  <div class="min-h-screen flex flex-col">
    <!-- 固定导航栏 -->
    <nav class="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-50">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo和导航链接 -->
          <div class="flex items-center gap-8">
            <router-link to="/" class="flex items-center gap-2 text-blue-500">
              <img src="/src/assets/logo.svg" alt="DevNav Logo" class="w-8 h-8">
              <span class="text-xl font-bold">DevNav</span>
            </router-link>
            
            <div class="flex items-center gap-4">
              <router-link 
                v-for="item in navItems" 
                :key="item.path"
                :to="item.path"
                class="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :class="{ 'bg-gray-100 dark:bg-gray-800': isActive(item.path) }"
              >
                {{ item.name }}
              </router-link>
            </div>
          </div>

          <!-- 右侧功能按钮 -->
          <div class="flex items-center gap-4">
            <button
              @click="toggleDark()"
              class="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            
            <a
              href="https://github.com/YoungKing1212/DEV_NAV.git"
              target="_blank"
              class="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 全局加载状态 -->
    <div
      v-if="uiStore.loading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <LoadingSpinner />
        <div class="mt-4 text-center text-gray-600 dark:text-gray-300">
          {{ uiStore.loadingMessage || '加载中...' }}
        </div>
      </div>
    </div>

    <!-- 全局提示 -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUIStore } from './stores/ui'
import LoadingSpinner from './components/common/LoadingSpinner.vue'
import Toast from './components/common/Toast.vue'
import { useRoute } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'

const uiStore = useUIStore()
const toast = ref<{ show: (message: string, type?: 'success' | 'error') => void }>()
const route = useRoute()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const navItems = [
  { name: '首页', path: '/' },
  { name: '书签管理', path: '/bookmarks' },
  { name: '工具箱', path: '/tools' }
]

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

onMounted(() => {
  uiStore.initDarkMode()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 确保内容不会被导航栏遮挡 */
main {
  padding-top: 4rem; /* 导航栏高度 */
  min-height: 100vh;
}

/* 暗色模式过渡 */
html {
  transition: background-color 0.3s ease;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style> 