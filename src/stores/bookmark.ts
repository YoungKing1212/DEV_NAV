import { defineStore } from 'pinia'
import type { Bookmark, Category, Folder } from '@/types'
import { nanoid } from 'nanoid'
import { isValidUrl } from '@/utils/validators'
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
      return (folderId: string) => {
        // 找到对应的文件夹
        const folder = state.folders.find(f => f.id === folderId)
        if (!folder) return []
        
        // 获取该文件夹下的所有书签
        return state.bookmarks.filter(bookmark => {
          // 检查书签的 folderId 是否匹配
          if (bookmark.folderId === folderId) return true
          
          // 检查书签的 tag 是否匹配文件夹名称
          if (bookmark.tag === folder.name) {
            // 如果匹配，更新书签的 folderId
            bookmark.folderId = folderId
            return true
          }
          
          return false
        })
      }
    },

    unclassifiedBookmarks: (state) => {
      return state.bookmarks.filter(bookmark => !bookmark.folderId && !bookmark.tag)
    }
  },

  actions: {
    addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) {
      console.log('Adding bookmark:', bookmark)
      const newBookmark: Bookmark = {
        id: nanoid(),
        ...bookmark,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      console.log('New bookmark:', newBookmark)
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
        if (bookmark.tag) {
          newTags.add(bookmark.tag)
        }
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
            createdAt: Date.now(),
            updatedAt: Date.now()
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

    async syncFromChrome() {
      try {
        this.syncing = true
        // 检查扩展是否可用
        if (!window.chrome || !window.chrome.runtime) {
          throw new Error('请先安装 Chrome 扩展')
        }
        
        // 通过消息获取书签
        const response = await new Promise<{ bookmarks?: chrome.bookmarks.BookmarkTreeNode[] }>((resolve, reject) => {
          chrome.runtime.sendMessage(
            'chnkkjkkjhpocggimaakdkomgejjdajf',
            { type: 'GET_BOOKMARKS' },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message))
              } else {
                resolve(response)
              }
            }
          )
        })
        
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
        console.error('同步失败:', error instanceof Error ? error.message : String(error))
        throw error
      } finally {
        this.syncing = false
      }
    },

    // 处理书签变化
    async handleBookmarkChange(): Promise<void> {
      try {
        const bookmarks = await chrome.bookmarks.getTree();
        // 通过消息传递给前端应用
        await chrome.runtime.sendMessage('chnkkjkkjhpocggimaakdkomgejjdajf', {
          type: 'BOOKMARKS_CHANGED',
          data: bookmarks
        });
      } catch (error) {
        console.error('同步失败:', error instanceof Error ? error.message : String(error));
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
            tag: '',
            folderId: undefined,
            visitCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
          this.addBookmark(bookmark)
        } else if (node.children) {
          // 这是一个文件夹
          const folder: Folder = {
            id: nanoid(),
            name: node.title,
            parentId: undefined
          }
          this.folders.push(folder)
          
          // 为子书签设置文件夹 ID
          const folderId = folder.id
          node.children.forEach(child => {
            if (child.url) {
              const bookmark: Bookmark = {
                id: nanoid(),
                title: child.title,
                url: child.url,
                tag: folder.name,
                folderId,
                visitCount: 0,
                createdAt: Date.now(),
                updatedAt: Date.now()
              }
              this.addBookmark(bookmark)
            }
          })
          
          // 递归处理子文件夹
          const subFolders = node.children.filter(child => !child.url)
          await this.processBookmarks(subFolders)
        }
      }
      
      this.saveToLocalStorage()
    }
  }
})

interface ChromeBookmark {
  id: string;
  title: string;
  url?: string;
  children?: ChromeBookmark[];
} 