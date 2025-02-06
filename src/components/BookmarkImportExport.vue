<template>
  <div>
    <!-- 导入导出按钮 -->
    <button
      @click="showDialog = true"
      class="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors duration-200"
    >
      <svg class="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      导入/导出
    </button>

    <!-- 导入导出对话框 -->
    <TransitionRoot appear :show="showDialog" as="template">
      <Dialog as="div" class="relative z-10" @close="showDialog = false">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4">
                  书签导入导出
                </DialogTitle>

                <!-- 导入区域 -->
                <div class="mb-8">
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">导入书签</h4>
                  <div
                    class="border-2 border-dashed rounded-lg p-6 text-center"
                    :class="[
                      isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    ]"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleDrop"
                  >
                    <input
                      ref="fileInput"
                      type="file"
                      accept=".html,.htm"
                      class="hidden"
                      @change="handleFileSelect"
                    />
                    
                    <div v-if="importing" class="text-center">
                      <LoadingSpinner size="small" class="mx-auto mb-2" />
                      <div class="space-y-2">
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {{ importStatus }}
                        </p>
                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 max-w-xs mx-auto">
                          <div
                            class="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                            :style="{ width: `${importProgress}%` }"
                          ></div>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          已处理 {{ processedCount }} 个书签
                        </p>
                      </div>
                    </div>
                    <template v-else>
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h24a4 4 0 004-4v-4m-8-20v-.01M28 8v4a4 4 0 004 4h4m-8-8l8 8"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <div class="mt-4 flex text-sm text-gray-600 dark:text-gray-400">
                        <button
                          type="button"
                          class="relative font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                          @click="fileInput?.click()"
                        >
                          <span>选择文件</span>
                        </button>
                        <p class="pl-1">或拖放文件到此处</p>
                      </div>
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        支持从浏览器导出的书签 HTML 文件
                      </p>
                    </template>
                  </div>
                </div>

                <!-- 导出区域 -->
                <div>
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">导出书签</h4>
                  <button
                    @click="exportBookmarks"
                    class="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    :disabled="exporting"
                  >
                    <LoadingSpinner v-if="exporting" size="small" color="white" class="mr-2" />
                    <span>{{ exporting ? '正在导出...' : '导出为 HTML' }}</span>
                  </button>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    导出的文件可以直接导入到主流浏览器
                  </p>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- 提示消息 -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { useBookmarkStore } from '@/stores/bookmark'
import LoadingSpinner from './common/LoadingSpinner.vue'
import Toast from './common/Toast.vue'
import { parseBookmarksFile, generateBookmarkHtml } from '@/utils/bookmarkParser'
import { BookmarkError, ErrorCodes } from '@/types/errors'

const bookmarkStore = useBookmarkStore()
const showDialog = ref(false)
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const importing = ref(false)
const exporting = ref(false)
const toast = ref()
const importStatus = ref('')
const importProgress = ref(0)
const processedCount = ref(0)

// 错误提示映射
const errorMessages = {
  [ErrorCodes.INVALID_FILE_TYPE]: '请选择 HTML 格式的书签文件',
  [ErrorCodes.FILE_TOO_LARGE]: '文件过大，请分批导入',
  [ErrorCodes.PARSE_ERROR]: '解析失败，请检查文件格式是否正确',
  [ErrorCodes.IMPORT_ERROR]: '导入失败，请重试',
  [ErrorCodes.EXPORT_ERROR]: '导出失败，请重试',
  [ErrorCodes.NETWORK_ERROR]: '网络错误，请检查网络连接'
}

// 获取错误提示
const getErrorMessage = (error: unknown) => {
  if (error instanceof BookmarkError) {
    const message = errorMessages[error.code] || error.message
    if (error.details) {
      return `${message}\n${error.details}`
    }
    return message
  }
  return '发生未知错误，请重试'
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files?.length) {
    await importFile(files[0])
  }
}

// 处理拖放
const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files?.length) {
    await importFile(files[0])
  }
}

// 导入文件
const importFile = async (file: File) => {
  // 文件类型检查
  if (!file.name.toLowerCase().endsWith('.html')) {
    throw new BookmarkError(
      '文件类型错误',
      ErrorCodes.INVALID_FILE_TYPE,
      '仅支持 .html 格式的书签文件'
    )
  }

  // 文件大小检查（例如限制为 10MB）
  const MAX_FILE_SIZE = 10 * 1024 * 1024
  if (file.size > MAX_FILE_SIZE) {
    throw new BookmarkError(
      '文件过大',
      ErrorCodes.FILE_TOO_LARGE,
      `文件大小超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
  }

  importing.value = true
  importStatus.value = '正在读取文件...'
  importProgress.value = 0
  processedCount.value = 0

  try {
    const text = await file.text()
    importStatus.value = '正在解析书签...'
    importProgress.value = 20

    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    
    // 检查解析结果
    if (doc.querySelector('parsererror')) {
      throw new BookmarkError(
        '文件解析失败',
        ErrorCodes.PARSE_ERROR,
        '文件格式不正确或已损坏'
      )
    }
    
    // 获取总书签数量
    const totalLinks = doc.querySelectorAll('a[href]').length
    if (totalLinks === 0) {
      throw new BookmarkError(
        '未找到书签',
        ErrorCodes.PARSE_ERROR,
        '文件中没有找到有效的书签'
      )
    }
    
    // 解析书签数据
    const { bookmarks, folders } = await parseBookmarksWithProgress(doc, (current) => {
      processedCount.value = current
      importProgress.value = 20 + Math.floor((current / totalLinks) * 60)
    })
    
    if (bookmarks.length === 0) {
      throw new BookmarkError(
        '解析结果为空',
        ErrorCodes.PARSE_ERROR,
        '未能解析出有效的书签数据'
      )
    }
    
    importStatus.value = '正在保存书签...'
    importProgress.value = 80
    
    // 导入书签
    const count = await bookmarkStore.importBookmarks({ bookmarks, folders })
    
    importProgress.value = 100
    importStatus.value = '导入完成'
    
    // 短暂延迟后关闭对话框
    setTimeout(() => {
      toast.value?.show(`成功导入 ${count} 个书签`)
      showDialog.value = false
    }, 500)
  } catch (error) {
    console.error('导入失败:', error)
    const errorMessage = getErrorMessage(error)
    
    // 显示错误提示
    toast.value?.show({
      type: 'error',
      title: '导入失败',
      message: errorMessage,
      duration: 5000 // 错误提示显示时间更长
    })
  } finally {
    importing.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    // 重置进度
    setTimeout(() => {
      importProgress.value = 0
      processedCount.value = 0
    }, 500)
  }
}

// 带进度的书签解析
const parseBookmarksWithProgress = async (doc: Document, onProgress: (current: number) => void) => {
  const { bookmarks, folders } = parseBookmarksFile(doc, onProgress)
  return { bookmarks, folders }
}

// 导出书签
const exportBookmarks = async () => {
  exporting.value = true
  try {
    if (bookmarkStore.bookmarks.length === 0) {
      throw new BookmarkError(
        '没有可导出的书签',
        ErrorCodes.EXPORT_ERROR,
        '请先添加书签再导出'
      )
    }

    const html = generateBookmarkHtml(bookmarkStore.bookmarks, bookmarkStore.folders)
    
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bookmarks_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.value?.show('导出成功')
    showDialog.value = false
  } catch (error) {
    console.error('导出失败:', error)
    const errorMessage = getErrorMessage(error)
    toast.value?.show({
      type: 'error',
      title: '导出失败',
      message: errorMessage,
      duration: 5000
    })
  } finally {
    exporting.value = false
  }
}

function processBookmarkNode(node: chrome.bookmarks.BookmarkTreeNode, parentPath: string[] = []): void {
  // 跳过书签栏节点
  if (node.title === "书签栏" || node.title === "Bookmarks Bar") {
    if (node.children) {
      // 处理书签栏下的直接子节点
      node.children.forEach(child => processBookmarkNode(child, []))
    }
    return
  }

  // 如果是 H3 标签（文件夹标题）
  if (node.children && !node.url) {
    // 构建新的路径
    const newPath = [...parentPath]
    if (node.title) {
      newPath.push(node.title)
    }
    
    // 处理文件夹下的子节点
    node.children.forEach(child => {
      // 对于 DL/p 这样的结构节点，直接传递当前路径
      if (child.children && !child.title) {
        child.children.forEach(subChild => processBookmarkNode(subChild, newPath))
      } else {
        processBookmarkNode(child, newPath)
      }
    })
  } else if (node.url) {
    // 如果是书签节点
    let tag = ''
    if (parentPath.length > 0) {
      // 使用完整的路径作为标签
      tag = parentPath.join('/')
    }

    // 添加书签
    bookmarkStore.addBookmark({
      title: node.title,
      url: node.url,
      tag: tag
    })
  }
}
</script> 