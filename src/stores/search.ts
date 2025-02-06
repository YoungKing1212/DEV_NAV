import { defineStore } from 'pinia'
import type { SearchHistory } from '@/types'

export const useSearchStore = defineStore('search', {
  state: () => ({
    searchHistory: [] as SearchHistory[],
    recentSearches: [] as string[]
  }),

  actions: {
    addSearchHistory(keyword: string) {
      // 添加搜索历史记录
      const searchItem: SearchHistory = {
        id: crypto.randomUUID(),
        keyword,
        timestamp: new Date()
      }
      this.searchHistory.push(searchItem)
      
      // 更新最近搜索记录
      if (!this.recentSearches.includes(keyword)) {
        this.recentSearches.unshift(keyword)
        if (this.recentSearches.length > 10) {
          this.recentSearches.pop()
        }
      } else {
        // 如果已存在，将其移到最前面
        this.recentSearches = [
          keyword,
          ...this.recentSearches.filter(k => k !== keyword)
        ]
      }

      // 保存到本地存储
      this.saveToLocalStorage()
    },

    removeFromHistory(keyword: string) {
      this.recentSearches = this.recentSearches.filter(k => k !== keyword)
      this.searchHistory = this.searchHistory.filter(item => item.keyword !== keyword)
      this.saveToLocalStorage()
    },

    clearSearchHistory() {
      this.searchHistory = []
      this.recentSearches = []
      this.saveToLocalStorage()
    },

    // 从本地存储加载数据
    loadFromLocalStorage() {
      const savedHistory = localStorage.getItem('searchHistory')
      if (savedHistory) {
        const { history, recent } = JSON.parse(savedHistory)
        this.searchHistory = history
        this.recentSearches = recent
      }
    },

    // 保存到本地存储
    saveToLocalStorage() {
      localStorage.setItem('searchHistory', JSON.stringify({
        history: this.searchHistory,
        recent: this.recentSearches
      }))
    }
  }
}) 