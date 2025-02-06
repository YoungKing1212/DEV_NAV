import type { Bookmark } from '@/types'

export async function syncBookmarks(bookmarks: chrome.bookmarks.BookmarkTreeNode[]) {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmarks)
    })
    
    if (!response.ok) {
      throw new Error('同步失败')
    }
    
    return await response.json()
  } catch (error) {
    console.error('同步请求失败:', error)
    throw error
  }
} 