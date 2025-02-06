<template>
  <div class="relative">
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索书签..."
        class="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
        @focus="showDropdown = true"
        @blur="handleBlur"
      />
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </span>
    </div>

    <!-- 搜索下拉框 -->
    <div
      v-if="showDropdown"
      class="absolute w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50"
    >
      <!-- 搜索结果 -->
      <div v-if="searchQuery" class="p-2">
        <div v-if="searchResults.length > 0">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
            @mousedown="handleSelect(result)"
          >
            <div class="flex items-start justify-between">
              <div>
                <div class="font-medium dark:text-gray-200">{{ result.title }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ result.url }}</div>
              </div>
              <div class="flex gap-1">
                <span
                  v-for="tag in result.tags"
                  :key="tag"
                  class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs dark:text-gray-300"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="p-4 text-center text-gray-500 dark:text-gray-400">
          未找到相关结果
        </div>
      </div>

      <!-- 搜索历史 -->
      <div v-else>
        <div class="p-2 text-sm text-gray-500 dark:text-gray-400">最近搜索</div>
        <div
          v-for="item in recentSearches"
          :key="item"
          class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center dark:text-gray-200"
          @mousedown="searchQuery = item"
        >
          <span>{{ item }}</span>
          <button
            @mousedown.stop="removeFromHistory(item)"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
        <div
          v-if="recentSearches.length > 0"
          class="p-2 border-t text-center"
        >
          <button
            @mousedown="clearHistory"
            class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            清除搜索历史
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookmarkStore } from '@/stores/bookmark'
import { useSearchStore } from '@/stores/search'
import type { Bookmark } from '@/types'

const router = useRouter()
const bookmarkStore = useBookmarkStore()
const searchStore = useSearchStore()

const searchQuery = ref('')
const showDropdown = ref(false)

// 搜索结果
const searchResults = computed(() => {
  if (!searchQuery.value) return []
  
  const query = searchQuery.value.toLowerCase()
  return bookmarkStore.bookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(query) ||
    bookmark.url.toLowerCase().includes(query) ||
    bookmark.description?.toLowerCase().includes(query) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(query))
  ).slice(0, 5)
})

// 最近搜索记录
const recentSearches = computed(() => searchStore.recentSearches)

const handleBlur = () => {
  // 使用setTimeout确保点击事件在blur事件之后触发
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const handleSelect = (bookmark: Bookmark) => {
  // 记录搜索历史
  if (searchQuery.value) {
    searchStore.addSearchHistory(searchQuery.value)
  }
  
  // 增加访问次数
  bookmarkStore.incrementVisitCount(bookmark.id)
  
  // 打开链接
  window.open(bookmark.url, '_blank')
  
  // 清空搜索并关闭下拉框
  searchQuery.value = ''
  showDropdown.value = false
}

const removeFromHistory = (keyword: string) => {
  searchStore.removeFromHistory(keyword)
}

const clearHistory = () => {
  searchStore.clearSearchHistory()
}
</script> 