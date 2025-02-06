<template>
  <div class="container mx-auto px-4 py-8">
    <!-- 头部区域 -->
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4">
        DevNav
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        为开发者打造的导航与工具集
      </p>
    </header>

    <!-- 搜索框和结果 -->
    <div 
      class="relative max-w-2xl mx-auto mt-8 mb-12"
      style="z-index: 10;"
    >
      <input
        type="text"
        v-model="searchText"
        placeholder="搜索书签、工具..."
        class="w-full px-6 py-4 text-lg bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
          placeholder-gray-400 dark:placeholder-gray-500"
        @click.stop
        @focus.stop
      />
      
      <div 
        class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400"
        @click.stop
      >
        <kbd class="hidden sm:inline-block px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded">⌘</kbd>
        <kbd class="hidden sm:inline-block px-2 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 rounded">K</kbd>
      </div>

      <!-- 搜索结果下拉框 -->
      <div
        v-show="searchText && (searchResults.length > 0 || showNoResults)"
        class="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto"
        style="z-index: 20;"
      >
        <div 
          class="p-2"
        >
          <div class="space-y-1">
            <a
              v-for="result in searchResults"
              :key="result.id"
              :href="result.url"
              target="_blank"
              class="block px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
              @click="handleVisit(result)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ result.title }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {{ result.url }}
                  </div>
                </div>
                <span 
                  v-if="result.tag"
                  class="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full shrink-0"
                >
                  {{ result.tag }}
                </span>
              </div>
            </a>
            
            <!-- 无结果提示 -->
            <div 
              v-if="searchResults.length === 0" 
              class="px-3 py-4 text-center text-gray-500 dark:text-gray-400"
            >
              没有找到匹配的结果
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 常用书签 -->
    <section class="mb-16">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold dark:text-gray-200 flex items-center">
          <svg class="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          常用书签
        </h2>
        <router-link
          to="/bookmarks"
          class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          查看全部
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="bookmark in frequentBookmarks"
          :key="bookmark.id"
          :href="bookmark.url"
          target="_blank"
          class="group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
          @click="handleVisit(bookmark)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                {{ bookmark.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ bookmark.description }}
              </p>
            </div>
            <span class="ml-4 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
              {{ bookmark.visitCount }}次访问
            </span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="tag in bookmark.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </a>
      </div>
    </section>

    <!-- 最近添加 -->
    <section class="mb-16">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold dark:text-gray-200 flex items-center">
          <svg class="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          最近添加
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a
          v-for="bookmark in recentBookmarks"
          :key="bookmark.id"
          :href="bookmark.url"
          target="_blank"
          class="group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
          @click="handleVisit(bookmark)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                {{ bookmark.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ bookmark.description }}
              </p>
            </div>
            <span class="ml-4 text-xs text-gray-400 dark:text-gray-500">
              {{ formatDate(bookmark.createdAt) }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span
              v-for="tag in bookmark.tags"
              :key="tag"
              class="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"
            >
              {{ tag }}
            </span>
          </div>
        </a>
      </div>
    </section>

    <!-- 常用工具 -->
    <section>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold dark:text-gray-200 flex items-center">
          <svg class="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          常用工具
        </h2>
        <router-link
          to="/tools"
          class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          查看全部
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <router-link
          v-for="tool in commonTools"
          :key="tool.id"
          :to="{ name: 'tool-detail', params: { toolId: tool.id }}"
          class="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
        >
          <div class="text-center">
            <div class="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
              {{ tool.name }}
            </div>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {{ tool.description }}
            </p>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookmarkStore } from '@/stores/bookmark'
import type { Bookmark } from '@/types'
import dayjs from 'dayjs'

const bookmarkStore = useBookmarkStore()
const searchText = ref('')
const showNoResults = computed(() => searchText.value.length > 0)

// 搜索结果
const searchResults = computed(() => {
  if (!searchText.value) return []
  
  const query = searchText.value.toLowerCase()
  return bookmarkStore.bookmarks.filter(bookmark => {
    return bookmark.title.toLowerCase().includes(query) ||
      bookmark.url.toLowerCase().includes(query) ||
      bookmark.tag?.toLowerCase().includes(query)
  })
})

// 常用书签（按访问次数排序）
const frequentBookmarks = computed(() => {
  return [...bookmarkStore.bookmarks]
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 6)
})

// 最近添加的书签
const recentBookmarks = computed(() => {
  return [...bookmarkStore.bookmarks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
})

// 常用工具列表
const commonTools = [
  {
    id: 'code-formatter',
    name: '代码格式化',
    description: '支持多种语言的代码格式化工具'
  },
  {
    id: 'image-compressor',
    name: '图片压缩',
    description: '在线图片压缩工具'
  },
  {
    id: 'pdf-tools',
    name: 'PDF工具',
    description: 'PDF转换、合并、分割等功能'
  },
  {
    id: 'qrcode',
    name: '二维码工具',
    description: '生成自定义二维码'
  }
]

// 处理书签访问
const handleVisit = (bookmark: Bookmark) => {
  bookmarkStore.incrementVisitCount(bookmark.id)
}

// 格式化日期
const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}
</script>

<style>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 