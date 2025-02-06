<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative z-10" @close="handleClose">
      <!-- 背景遮罩 -->
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
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                {{ bookmark ? '编辑书签' : '添加书签' }}
              </DialogTitle>

              <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
                <!-- 标题 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    标题
                  </label>
                  <input
                    v-model="form.title"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <!-- URL -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL
                  </label>
                  <input
                    v-model="form.url"
                    type="url"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>

                <!-- 描述 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    描述
                  </label>
                  <textarea
                    v-model="form.description"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  ></textarea>
                </div>

                <!-- 标签 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    标签
                  </label>
                  <div class="mt-1 flex flex-wrap gap-2">
                    <span
                      v-for="tag in form.tags"
                      :key="tag"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {{ tag }}
                      <button
                        type="button"
                        class="ml-1 inline-flex items-center p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                        @click="removeTag(tag)"
                      >
                        <span class="sr-only">删除</span>
                        <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </span>
                    <input
                      v-model="newTag"
                      type="text"
                      class="flex-1 min-w-[100px] rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      placeholder="输入标签后按回车"
                      @keydown.enter.prevent="addTag"
                    />
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    @click="handleClose"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    保存
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import type { Bookmark } from '@/types'

const props = defineProps<{
  show: boolean
  bookmark?: Bookmark | null
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'save', bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt' | 'visitCount'>): void
}>()

const form = ref({
  title: '',
  url: '',
  description: '',
  tags: [] as string[]
})

const newTag = ref('')

// 监听 bookmark 变化，更新表单
watch(() => props.bookmark, (newVal) => {
  if (newVal) {
    form.value = {
      title: newVal.title,
      url: newVal.url,
      description: newVal.description || '',
      tags: [...newVal.tags]
    }
  } else {
    form.value = {
      title: '',
      url: '',
      description: '',
      tags: []
    }
  }
}, { immediate: true })

const handleClose = () => {
  emit('update:show', false)
}

const handleSubmit = () => {
  emit('save', {
    ...form.value,
    tags: form.value.tags
  })
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
  }
  newTag.value = ''
}

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}
</script> 