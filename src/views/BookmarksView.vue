<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Chrome 扩展安装提示 -->
    <div 
      v-if="showExtensionGuide"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
    >
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          安装 Chrome 扩展
        </h3>
        <div class="space-y-4">
          <p class="text-gray-600 dark:text-gray-400">
            要使用自动同步功能，请先安装我们的 Chrome 扩展：
          </p>
          <ol class="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>下载扩展文件 
              <button 
                @click="downloadExtension"
                class="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                点击下载
              </button>
            </li>
            <li>打开 Chrome 扩展页面：
              <div class="mt-1 text-sm text-gray-500">
                1. 在浏览器地址栏输入: chrome://extensions
                2. 或者点击浏览器右上角菜单 → 更多工具 → 扩展程序
              </div>
            </li>
            <li>开启开发者模式</li>
            <li>将下载的文件拖放到扩展页面完成安装</li>
          </ol>
          <div class="flex justify-end gap-4 mt-6">
            <button
              @click="showExtensionGuide = false"
              class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              稍后安装
            </button>
            <button
              @click="copyExtensionsUrl"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              复制扩展页面地址
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 头部区域 -->
    <div
      v-slide-in:top
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
    >
      <div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <svg 
            class="w-8 h-8 text-blue-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2"
              d="M9 9h6M9 13h6" 
              class="text-purple-400"
            />
          </svg>
          书签管理
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          共 {{ bookmarkStore.bookmarks.length }} 个书签，{{ bookmarkStore.tags.length }} 个标签
        </p>
      </div>
      <div class="flex gap-4">
        <button
          @click="handleSync"
          class="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
          :disabled="bookmarkStore.syncing"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ bookmarkStore.syncing ? '同步中...' : '从 Chrome 同步' }}
        </button>
        <button
          @click="showDialog = true"
          class="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          添加书签
        </button>
        <BookmarkImportExport />
      </div>
    </div>

    <!-- 视图切换 -->
    <div
      v-slide-in:left="{ delay: 200 }"
      class="flex gap-4 mb-8"
    >
      <button
        v-for="view in views"
        :key="view.id"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center"
        :class="[
          currentView === view.id
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
        ]"
        @click="currentView = view.id"
      >
        <component 
          :is="view.icon" 
          class="w-5 h-5 mr-2 transition-transform duration-200" 
          :class="currentView === view.id ? 'transform scale-110' : ''"
        />
        {{ view.name }}
      </button>
    </div>

    <!-- 标签筛选区域 -->
    <div
      v-if="currentView === 'tags'"
      v-slide-in:right="{ delay: 400 }"
      class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-8"
    >
      <!-- 标签搜索输入框 -->
      <div class="mb-4">
        <div class="relative">
          <input
            type="text"
            v-model="tagSearchQuery"
            placeholder="搜索标签..."
            class="w-full px-4 py-2.5 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <svg 
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
      </div>

      <!-- 标签列表 -->
      <div class="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
        <button
          v-for="tag in filteredTags"
          :key="tag"
          @click="toggleTag(tag)"
          :class="[
            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 tag flex items-center gap-1.5',
            selectedTags.includes(tag)
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 hover:shadow-sm'
          ]"
        >
          <svg 
            class="w-4 h-4 opacity-60" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" 
            />
          </svg>
          {{ tag }}
          <span class="text-xs px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
            {{ getTagCount(tag) }}
          </span>
        </button>
       
        <!-- 无匹配结果时的提示 -->
        <div 
          v-if="filteredTags.length === 0" 
          class="w-full text-center py-4 text-gray-500 dark:text-gray-400"
        >
          没有找到匹配的标签
        </div>
      </div>
    </div>

    <!-- 文件夹视图 -->
    <template v-if="currentView === 'folders'">
      <div class="space-y-8">
        <!-- 根文件夹 -->
        <div
          v-for="(folder, index) in rootFolders"
          :key="folder.id"
          v-stagger="{ index, baseDelay: 400 }"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <svg class="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
              </svg>
              {{ folder.name }}
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({{ getFolderBookmarks(folder.id).length }})
              </span>
            </h3>
            <button
              @click="deleteByTag(folder.name)"
              class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              title="删除此文件夹下的所有书签"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- 文件夹内的书签 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-6">
            <div
              v-for="bookmark in filteredBookmarks.filter(b => b.folderId === folder.id)"
              :key="bookmark.id"
              class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                  <a
                    :href="bookmark.url"
                    target="_blank"
                    class="block text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 truncate"
                    @click="handleVisit(bookmark)"
                  >
                    {{ bookmark.title }}
                  </a>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {{ bookmark.description }}
                  </p>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    @click="editBookmark(bookmark)"
                    class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title="编辑"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteBookmark(bookmark)"
                    class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title="删除"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mt-3">
                <span
                  v-if="bookmark.tag"
                  :key="bookmark.tag"
                  class="group relative px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"
                >
                  {{ bookmark.tag }}
                  <button
                    @click.stop="deleteByTag(bookmark.tag)"
                    class="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity duration-200"
                    title="删除此标签下的所有书签"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- 子文件夹 -->
          <div v-if="getSubFolders(folder.id).length > 0" class="pl-6 space-y-6">
            <div v-for="subFolder in getSubFolders(folder.id)" :key="subFolder.id">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-base font-medium text-gray-900 dark:text-gray-100">
                  <svg class="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z M9 13h6 M9 17h6" />
                  </svg>
                  {{ subFolder.name }}
                </h4>
                <button
                  @click="deleteByTag(subFolder.name)"
                  class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="删除此文件夹下的所有书签"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="bookmark in getFolderBookmarks(subFolder.id)"
                  :key="bookmark.id"
                  class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <div class="p-4">
                    <div class="flex justify-between items-start">
                      <div class="flex-1 min-w-0">
                        <a
                          :href="bookmark.url"
                          target="_blank"
                          class="block text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 truncate"
                          @click="handleVisit(bookmark)"
                        >
                          {{ bookmark.title }}
                        </a>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {{ bookmark.description }}
                        </p>
                      </div>
                      <div class="flex gap-2 ml-4">
                        <button
                          @click="editBookmark(bookmark)"
                          class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="编辑"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          @click="deleteBookmark(bookmark)"
                          class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          title="删除"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2 mt-3">
                      <span
                        v-if="bookmark.tag"
                        :key="bookmark.tag"
                        class="group relative px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"
                      >
                        {{ bookmark.tag }}
                        <button
                          @click.stop="deleteByTag(bookmark.tag)"
                          class="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity duration-200"
                          title="删除此标签下的所有书签"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    </div>
                  </div>
                  <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>访问次数: {{ bookmark.visitCount }}</span>
                    <span>{{ formatDate(bookmark.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 未分类书签 -->
        <div
          v-if="unclassifiedBookmarks.length > 0"
          v-slide-in:bottom="{ delay: 600 }"
          class="space-y-4"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <svg class="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            未分类
            <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({{ unclassifiedBookmarks.length }})
            </span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="bookmark in filteredBookmarks.filter(b => !b.folderId)"
              :key="bookmark.id"
              class="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                  <a
                    :href="bookmark.url"
                    target="_blank"
                    class="block text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 truncate"
                    @click="handleVisit(bookmark)"
                  >
                    {{ bookmark.title }}
                  </a>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {{ bookmark.description }}
                  </p>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    @click="editBookmark(bookmark)"
                    class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title="编辑"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteBookmark(bookmark)"
                    class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    title="删除"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mt-3">
                <span
                  v-if="bookmark.tag"
                  :key="bookmark.tag"
                  class="group relative px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"
                >
                  {{ bookmark.tag }}
                  <button
                    @click.stop="deleteByTag(bookmark.tag)"
                    class="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity duration-200"
                    title="删除此标签下的所有书签"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 标签视图 -->
    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(bookmark, index) in filteredBookmarks"
          :key="bookmark.id"
          v-stagger="{ index, baseDelay: 400 }"
          class="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div class="p-4">
            <div class="flex justify-between items-start">
              <div class="flex-1 min-w-0">
                <a
                  :href="bookmark.url"
                  target="_blank"
                  class="block text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300 truncate"
                  @click="handleVisit(bookmark)"
                >
                  {{ bookmark.title }}
                </a>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                  {{ bookmark.description }}
                </p>
              </div>
              <div class="flex gap-2 ml-4">
                <button
                  @click="editBookmark(bookmark)"
                  class="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="编辑"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteBookmark(bookmark)"
                  class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  title="删除"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-if="bookmark.tag"
                :key="bookmark.tag"
                class="group relative px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full"
              >
                {{ bookmark.tag }}
                <button
                  @click.stop="deleteByTag(bookmark.tag)"
                  class="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity duration-200"
                  title="删除此标签下的所有书签"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          </div>
          <div class="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span>访问次数: {{ bookmark.visitCount }}</span>
            <span>{{ formatDate(bookmark.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 空状态 -->
    <div
      v-if="filteredBookmarks.length === 0"
      v-scale="{ delay: 200 }"
      class="text-center py-12"
    >
      <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
        {{ selectedTags.length > 0 ? '没有找到匹配的书签' : '还没有添加任何书签' }}
      </h3>
      <p class="mt-2 text-gray-500 dark:text-gray-400">
        {{ selectedTags.length > 0 ? '请尝试其他标签组合' : '点击上方的添加按钮开始收藏' }}
      </p>
    </div>

    <!-- 添加/编辑书签对话框 -->
    <BookmarkDialog
      v-model:show="showDialog"
      :bookmark="editingBookmark"
      @save="handleSave"
    />

    <!-- 添加 Toast 组件 -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, defineComponent } from 'vue'
import { useBookmarkStore } from '@/stores/bookmark'
import BookmarkDialog from '@/components/BookmarkDialog.vue'
import BookmarkImportExport from '@/components/BookmarkImportExport.vue'
import Toast from '@/components/common/Toast.vue'
import type { Bookmark, TagSearchResult } from '@/types'
import dayjs from 'dayjs'
import { fadeIn, slideIn, scale, stagger } from '@/utils/animations'
import { getSearchScore } from '@/utils/search'

const bookmarkStore = useBookmarkStore()
const showDialog = ref(false)
const editingBookmark = ref<Bookmark | null>(null)
const selectedTags = ref<string[]>([])
const searchText = ref('')
const toast = ref()

// 过滤后的书签列表
const filteredBookmarks = computed(() => {
  if (selectedTags.value.length === 0) {
    return bookmarkStore.bookmarks
  }
  return bookmarkStore.bookmarks.filter(bookmark => 
    selectedTags.value.includes(bookmark.tag)
  )
})

// 标签是否展开
const expandedTags = ref<Set<string>>(new Set())

// 切换标签展开状态
const toggleTagExpand = (tag: string) => {
  if (expandedTags.value.has(tag)) {
    expandedTags.value.delete(tag)
  } else {
    expandedTags.value.add(tag)
  }
}

// 标签选择状态
interface TagState {
  selected: boolean
  indeterminate: boolean
  childrenSelected: number
  totalChildren: number
}

const tagStates = ref(new Map<string, TagState>())

// 初始化标签状态
const initTagStates = () => {
  tagStates.value.clear()
  bookmarkStore.tags.forEach(tag => {
    const children = getChildTags(tag)
    tagStates.value.set(tag, {
      selected: selectedTags.value.includes(tag),
      indeterminate: false,
      childrenSelected: 0,
      totalChildren: children.length
    })
  })
}

// 监听选中标签变化
watch(selectedTags, () => {
  updateTagStates()
}, { deep: true })

// 更新标签状态
const updateTagStates = () => {
  bookmarkStore.tags.forEach(tag => {
    const state = tagStates.value.get(tag)
    if (state) {
      const children = getChildTags(tag)
      const selectedChildren = children.filter(child => selectedTags.value.includes(child))
      
      state.childrenSelected = selectedChildren.length
      state.selected = selectedTags.value.includes(tag)
      state.indeterminate = selectedChildren.length > 0 && selectedChildren.length < children.length
    }
  })
}

// 切换标签选择
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

// 获取父标签
const getParentTag = (tag: string): string | null => {
  for (const [parent, children] of tagHierarchy.value.entries()) {
    if (children.has(tag)) {
      return parent
    }
  }
  return null
}

// 初始化标签状态
onMounted(() => {
  initTagStates()
})

// 编辑书签
const editBookmark = (bookmark: Bookmark) => {
  editingBookmark.value = bookmark
  showDialog.value = true
}

// 删除书签
const deleteBookmark = async (bookmark: Bookmark) => {
  if (confirm('确定要删除这个书签吗？')) {
    bookmarkStore.removeBookmark(bookmark.id)
  }
}

// 处理书签保存
const handleSave = (bookmark: Bookmark) => {
  if (editingBookmark.value) {
    bookmarkStore.updateBookmark(bookmark.id, bookmark)
  } else {
    bookmarkStore.addBookmark(bookmark)
  }
  showDialog.value = false
  editingBookmark.value = null
}

// 处理书签访问
const handleVisit = (bookmark: Bookmark) => {
  bookmarkStore.incrementVisitCount(bookmark.id)
}

// 格式化日期
const formatDate = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 定义视图选项
const views = [
  {
    id: 'folders',
    name: '文件夹',
    icon: defineComponent({
      template: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      `
    })
  },
  {
    id: 'tags',
    name: '标签',
    icon: defineComponent({
      template: `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      `
    })
  }
]
const currentView = ref('folders')

// 使用 store 中的 getters
const rootFolders = computed(() => bookmarkStore.rootFolders)
const getSubFolders = (parentId: string) => bookmarkStore.getSubFolders(parentId)
const getFolderBookmarks = (folderId: string) => bookmarkStore.getFolderBookmarks(folderId)
const unclassifiedBookmarks = computed(() => bookmarkStore.unclassifiedBookmarks)

// 注册自定义指令
const vFadeIn = fadeIn
const vSlideIn = slideIn
const vScale = scale
const vStagger = stagger

// 标签搜索
const tagSearchQuery = ref('')
const tagSearchDebounce = ref<number>()

// 获取子标签
const getChildTags = (parentTag: string) => {
  return Array.from(tagHierarchy.value.get(parentTag) || [])
}

// 在 script setup 中添加删除方法
const deleteByTag = async (tag: string) => {
  if (confirm(`确定要删除标签 "${tag}" 下的所有书签吗？`)) {
    bookmarkStore.removeBookmarksByFolder(tag)
  }
}

// 获取过滤后的标签列表
const filteredTags = computed(() => {
  if (!tagSearchQuery.value) {
    return rootTags.value
  }
  return rootTags.value.filter(tag => 
    tag.toLowerCase().includes(tagSearchQuery.value.toLowerCase())
  )
})

// 获取标签数量
const getTagCount = (tag: string) => {
  return bookmarkStore.bookmarks.filter(b => b.tag === tag).length
}

// 扩展安装相关
const showExtensionGuide = ref(false)

// 处理同步
async function handleSync() {
  try {
    // 检查扩展是否可用
    if (!window.chrome || !window.chrome.runtime) {
      showExtensionGuide.value = true
      toast.value?.show({
        type: 'error',
        message: '请先安装 Chrome 扩展',
        duration: 3000
      })
      return
    }

    // 尝试与扩展建立连接
    chrome.runtime.sendMessage(
      'chnkkjkkjhpocggimaakdkomgejjdajf',
      { type: 'PING' },
      (response) => {
        if (chrome.runtime.lastError) {
          const error = chrome.runtime.lastError;
          console.error('Extension connection error:', error.message)
          showExtensionGuide.value = true
          toast.value?.show({
            type: 'error',
            message: '连接扩展失败，请确保已安装并启用扩展',
            duration: 3000
          })
        } else if (response?.success) {
          showExtensionGuide.value = false
          // 扩展连接成功后，执行同步
          bookmarkStore.syncFromChrome().then(() => {
            toast.value?.show({
              type: 'success',
              message: '同步成功',
              duration: 2000
            })
          }).catch(error => {
            toast.value?.show({
              type: 'error',
              message: error instanceof Error ? error.message : '同步失败',
              duration: 3000
            })
          })
        }
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Extension check error:', errorMessage)
    showExtensionGuide.value = true
    toast.value?.show({
      type: 'error',
      message: '扩展检测失败，请确保已安装扩展',
      duration: 3000
    })
  }
}

// 下载扩展文件
function downloadExtension() {
  // 创建一个包含扩展文件的 zip 文件下载链接
  const link = document.createElement('a')
  link.href = '/bookmark-sync-extension.zip' // 需要将扩展文件打包并放在 public 目录
  link.download = 'bookmark-sync-extension.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 复制扩展页面地址到剪贴板
function copyExtensionsUrl() {
  navigator.clipboard.writeText('chrome://extensions')
    .then(() => {
      toast.value?.show({
        type: 'success',
        message: '地址已复制到剪贴板',
        duration: 2000
      })
    })
    .catch(() => {
      toast.value?.show({
        type: 'error',
        message: '复制失败，请手动输入地址',
        duration: 3000
      })
    })
}

// 标签层级结构
const tagHierarchy = computed(() => {
  const hierarchy = new Map<string, Set<string>>()
  
  bookmarkStore.bookmarks.forEach(bookmark => {
    if (!bookmark.tag) return
    
    // 分割标签路径
    const parts = bookmark.tag.split('/')
    
    // 处理每一级标签
    for (let i = 0; i < parts.length; i++) {
      const parentTag = parts.slice(0, i).join('/')
      const currentTag = parts.slice(0, i + 1).join('/')
      
      if (i === 0) {
        // 根标签
        if (!hierarchy.has(currentTag)) {
          hierarchy.set(currentTag, new Set())
        }
      } else {
        // 子标签
        const parentSet = hierarchy.get(parentTag)
        if (parentSet) {
          parentSet.add(currentTag)
        }
        if (!hierarchy.has(currentTag)) {
          hierarchy.set(currentTag, new Set())
        }
      }
    }
  })
  
  return hierarchy
})

// 根标签列表
const rootTags = computed(() => {
  return Array.from(tagHierarchy.value.keys()).filter(tag => {
    // 找出没有父标签的标签
    return !Array.from(tagHierarchy.value.values()).some(children => children.has(tag))
  }).sort()
})
</script>

<style>
/* 添加悬停动画 */
.group:hover {
  transform: translateY(-2px);
}

/* 标签悬停效果 */
.group:hover .tag {
  transform: scale(1.05);
}

/* 平滑过渡 */
.group,
.tag {
  transition: all 0.3s ease-out;
}

/* 保持原有样式 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

/* 标签动画效果 */
.tag {
  transition: all 0.2s ease;
}

.tag:hover {
  transform: translateY(-1px);
}
</style> 