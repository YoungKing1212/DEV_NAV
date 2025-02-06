import { defineStore } from 'pinia'
import type { Bookmark, Category, Folder } from '@/types'
import { nanoid } from 'nanoid'
import { syncBookmarks } from '@/api/sync'

export const useBookmarkStore = defineStore('bookmark', {
  state: () => ({
    bookmarks: [] as Bookmark[],
    categories: [] as Category[],
    folders: [] as Folder[],
    tags: [] as string[],
    syncing: false,
    lastSyncTime: null as Date | null,
  }),

  getters: {
    rootFolders: (state) => {
      return state.folders.filter(folder => !folder.parentId)
    },

    getSubFolders: (state) => {
      return (parentId: string) => state.folders.filter(folder => folder.parentId === parentId)
    },

    getFolderBookmarks: (state) => {
      return (folderId: string) => state.bookmarks.filter(bookmark => bookmark.folderId === folderId)
    },

    unclassifiedBookmarks: (state) => {
      return state.bookmarks.filter(bookmark => !bookmark.folderId)
    }
  },

  actions: {
    addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) {
      const newBookmark: Bookmark = {
        id: nanoid(),
        ...bookmark,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      this.bookmarks.push(newBookmark)
      this.saveToLocalStorage()
    },

    removeBookmark(id: string) {
      this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id)
      this.saveToLocalStorage()
    },

    updateBookmark(id: string, data: Partial<Bookmark>) {
      const index = this.bookmarks.findIndex(bookmark => bookmark.id === id)
      if (index !== -1) {
        this.bookmarks[index] = {
          ...this.bookmarks[index],
          ...data,
          updatedAt: new Date()
        }
        this.saveToLocalStorage()
      }
    },

    incrementVisitCount(id: string) {
      const bookmark = this.bookmarks.find(b => b.id === id)
      if (bookmark) {
        bookmark.visitCount++
        this.saveToLocalStorage()
      }
    },

    async importBookmarks(data: { bookmarks: Bookmark[], folders: Folder[] }) {
      // 处理文件夹
      const newFolders = data.folders.filter(folder => {
        return !this.folders.find(f => f.name === folder.name)
      })
      this.folders.push(...newFolders)

      // 处理书签
      const validBookmarks = data.bookmarks.filter(bookmark => {
        return bookmark.title && bookmark.url && isValidUrl(bookmark.url)
      })

      // 合并标签
      const newTags = new Set<string>()
      validBookmarks.forEach(bookmark => {
        bookmark.tags.forEach(tag => newTags.add(tag))
      })
      this.tags = [...new Set([...this.tags, ...newTags])]

      // 添加书签
      validBookmarks.forEach(bookmark => {
        const existingBookmark = this.bookmarks.find(b => b.url === bookmark.url)
        if (!existingBookmark) {
          this.bookmarks.push({
            ...bookmark,
            id: crypto.randomUUID(),
            visitCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      })

      this.saveToLocalStorage()
      return validBookmarks.length
    },

    // 保存到本地存储
    saveToLocalStorage() {
      localStorage.setItem('bookmarks', JSON.stringify({
        bookmarks: this.bookmarks,
        categories: this.categories,
        folders: this.folders,
        tags: this.tags
      }))
    },

    // 从本地存储加载
    loadFromLocalStorage() {
      const saved = localStorage.getItem('bookmarks')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          this.bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : []
          this.folders = Array.isArray(data.folders) ? data.folders : []
          this.tags = Array.isArray(data.tags) ? data.tags : []
        } catch (error) {
          console.error('Failed to parse stored data:', error)
          // 初始化为默认值
          this.bookmarks = []
          this.folders = []
          this.tags = []
        }
      }
    },

    // 添加按文件夹删除方法
    removeBookmarksByFolder(folderPath: string) {
      this.bookmarks = this.bookmarks.filter(bookmark => bookmark.tag !== folderPath)
      this.saveToLocalStorage()
    },

    async syncFromChrome() {
      try {
        this.syncing = true
        // 检查是否安装了扩展
        if (!chrome?.runtime) {
          throw new Error('请先安装 Chrome 扩展')
        }
        
        // 通过消息获取书签
        const response = await new Promise<{ bookmarks?: chrome.bookmarks.BookmarkTreeNode[] }>((resolve) => {
          chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS' }, resolve);
        });
        
        if (response?.bookmarks) {
          // 处理书签数据
          await this.processBookmarks(response.bookmarks);
          
          // 更新同步时间
          this.lastSyncTime = new Date()
        } else {
          throw new Error('获取书签失败')
        }
        
        return true
      } catch (error) {
        console.error('同步失败:', error)
        throw error
      } finally {
        this.syncing = false
      }
    },

    // 添加处理 Chrome 书签的方法
    async processBookmarks(chromeBookmarks: ChromeBookmark[]): Promise<void> {
      for (const node of chromeBookmarks) {
        if (node.url) {
          // 这是一个书签
          const bookmark: Bookmark = {
            id: nanoid(),
            title: node.title,
            url: node.url,
            tags: [], // 根据需要设置标签
            visitCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          this.addBookmark(bookmark)
        } else if (node.children) {
          // 这是一个文件夹
          const folder: Folder = {
            id: nanoid(),
            name: node.title,
            parentId: null
          }
          this.folders.push(folder)
          
          // 递归处理子书签
          await this.processBookmarks(node.children)
        }
      }
      
      this.saveToLocalStorage()
    }
  }
})

// 辅助函数：验证 URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

interface ChromeBookmark {
  id: string;
  title: string;
  url?: string;
  children?: ChromeBookmark[];
} 