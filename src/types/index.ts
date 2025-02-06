export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  tag: string
  folderId?: string
  visitCount: number
  createdAt: number
  updatedAt: number
}

export interface Category {
  id: string
  name: string
  description?: string
}

export interface SearchHistory {
  id: string
  keyword: string
  timestamp: Date
}

export interface Tool {
  id: string
  name: string
  description: string
}

export interface Folder {
  id: string
  name: string
  parentId?: string
  description?: string
}

export interface TagSearchResult {
  tag: string
  score: number
}

export interface ParseResult {
  bookmarks: Bookmark[]
  folders: Folder[]
} 