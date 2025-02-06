import type { Bookmark, Folder, ParseResult } from '@/types'
import { isValidUrl } from './validators'

interface ParseResult {
  bookmarks: Bookmark[]
  folders: Folder[]
}

// 获取完整的文件夹路径
function getFolderPath(node: Element): string[] {
  const paths: string[] = []
  let currentNode = node.parentElement
  
  while (currentNode) {
    if (currentNode.tagName === 'DT') {
      const h3 = currentNode.querySelector('h3')
      if (h3 && h3.textContent) {
        const folderName = h3.textContent.trim()
        paths.unshift(folderName)
      }
    }
    currentNode = currentNode.parentElement
  }
  
  return paths
}

// 创建或获取文件夹
function getOrCreateFolder(
  path: string[],
  folders: Folder[],
  folderMap: Map<string, string>,
  parentId?: string
): string | undefined {
  if (path.length === 0) return parentId

  const folderName = path[0]
  const fullPath = path.join('/')
  
  // 检查是否已存在相同路径的文件夹
  const existingFolder = folders.find(f => 
    f.name === folderName && f.parentId === parentId
  )
  
  if (existingFolder) {
    return getOrCreateFolder(
      path.slice(1),
      folders,
      folderMap,
      existingFolder.id
    )
  }

  // 创建新文件夹
  const folderId = crypto.randomUUID()
  folders.push({
    id: folderId,
    name: folderName,
    parentId,
    description: `Path: ${fullPath}`,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  folderMap.set(fullPath, folderId)
  
  // 递归处理子文件夹
  return getOrCreateFolder(
    path.slice(1),
    folders,
    folderMap,
    folderId
  )
}

export function parseBookmarksFile(
  doc: Document,
  onProgress?: (current: number) => void
): ParseResult {
  const bookmarks: Bookmark[] = []
  const folders: Folder[] = []
  const folderMap = new Map<string, string>() // fullPath -> folder.id 映射

  // 遍历所有书签链接
  const links = Array.from(doc.querySelectorAll('a[href]'))
  links.forEach((link, index) => {
    const url = link.getAttribute('href')
    const title = link.textContent?.trim()
    const addDate = link.getAttribute('add_date')
    const existingTags = link.getAttribute('tags')?.split(',').filter(Boolean) || []
    
    if (url && title) {
      // 获取文件夹路径
      const folderPath = getFolderPath(link)
      
      // 创建或获取文件夹
      const folderId = folderPath.length > 0
        ? getOrCreateFolder(folderPath, folders, folderMap)
        : undefined

      // 将文件夹路径作为标签
      const folderTags = folderPath.flatMap((_, index, arr) => arr.join('/'));
      
      // 合并现有标签和文件夹标签
      const tags = [...new Set([...existingTags, ...folderTags])]

      bookmarks.push({
        id: crypto.randomUUID(),
        title,
        url,
        description: '',
        tags,
        folderId,
        visitCount: 0,
        createdAt: addDate ? new Date(parseInt(addDate) * 1000) : new Date(),
        updatedAt: new Date()
      })

      // 更新进度
      if (onProgress) {
        onProgress(index + 1)
      }
    }
  })

  return { bookmarks, folders }
}

export function generateBookmarkHtml(bookmarks: Bookmark[], folders: Folder[]): string {
  const folderMap = new Map(folders.map(f => [f.id, f]))
  const rootFolders = folders.filter(f => !f.parentId)
  const bookmarksByFolder = new Map<string | undefined, Bookmark[]>()

  // 按文件夹分组书签
  bookmarks.forEach(bookmark => {
    const folderBookmarks = bookmarksByFolder.get(bookmark.folderId) || []
    folderBookmarks.push(bookmark)
    bookmarksByFolder.set(bookmark.folderId, folderBookmarks)
  })

  // 生成文件夹 HTML
  function generateFolderHtml(folder: Folder): string {
    const subFolders = folders.filter(f => f.parentId === folder.id)
    const folderBookmarks = bookmarksByFolder.get(folder.id) || []
    
    return `
      <DT><H3>${escapeHtml(folder.name)}</H3>
      <DL><p>
        ${subFolders.map(generateFolderHtml).join('\n')}
        ${folderBookmarks.map(bookmark => `
          <DT><A HREF="${escapeHtml(bookmark.url)}" 
                ADD_DATE="${Math.floor(bookmark.createdAt / 1000)}"
                ${bookmark.tags.length ? `TAGS="${escapeHtml(bookmark.tags.join(','))}"` : ''}>
            ${escapeHtml(bookmark.title)}
          </A></DT>
        `).join('\n')}
      </DL></DT>
    `
  }

  // 生成未分类书签 HTML
  const unclassifiedBookmarks = bookmarksByFolder.get(undefined) || []
  const unclassifiedHtml = unclassifiedBookmarks.map(bookmark => `
    <DT><A HREF="${escapeHtml(bookmark.url)}" 
          ADD_DATE="${Math.floor(bookmark.createdAt / 1000)}"
          ${bookmark.tags.length ? `TAGS="${escapeHtml(bookmark.tags.join(','))}"` : ''}>
      ${escapeHtml(bookmark.title)}
    </A></DT>
  `).join('\n')

  // 生成完整的书签文件
  return `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  ${rootFolders.map(generateFolderHtml).join('\n')}
  ${unclassifiedHtml}
</DL></p>
  `.trim()
}

// HTML 转义
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 解析书签文件并显示进度
 * @param doc 解析后的 HTML 文档
 * @param onProgress 进度回调函数
 * @returns 解析结果，包含书签和文件夹
 */
export async function parseBookmarksWithProgress(
  doc: Document,
  onProgress: (current: number) => void
): Promise<ParseResult> {
  const bookmarks: Bookmark[] = []
  const folders: Folder[] = []
  const links = doc.querySelectorAll('a[href]')
  let processedCount = 0

  // 处理每个链接
  for (const link of Array.from(links)) {
    const url = link.getAttribute('href')
    const title = link.textContent?.trim() || ''
    
    if (url && isValidUrl(url)) {
      // 获取父文件夹信息
      const parentFolder = link.closest('DL')?.previousElementSibling as HTMLElement
      const folderName = parentFolder?.textContent?.trim() || ''
      
      // 创建或获取文件夹
      let folderId: string | undefined
      if (folderName) {
        const existingFolder = folders.find(f => f.name === folderName)
        if (existingFolder) {
          folderId = existingFolder.id
        } else {
          folderId = crypto.randomUUID()
          folders.push({
            id: folderId,
            name: folderName,
            parentId: undefined
          })
        }
      }
      
      // 创建书签对象
      const bookmark: Bookmark = {
        id: crypto.randomUUID(),
        title,
        url,
        tag: folderName,
        folderId,
        visitCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      bookmarks.push(bookmark)
    }
    
    // 更新进度
    processedCount++
    onProgress(processedCount)
    
    // 每处理 100 个书签暂停一下，避免阻塞主线程
    if (processedCount % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return { bookmarks, folders }
} 