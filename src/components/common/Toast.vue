<template>
  <TransitionGroup
    tag="div"
    class="fixed bottom-4 right-4 z-50 space-y-2"
    enter="transform ease-out duration-300"
    enter-from="translate-y-2 opacity-0"
    enter-to="translate-y-0 opacity-100"
    leave="transform ease-in duration-200"
    leave-from="translate-y-0 opacity-100"
    leave-to="translate-y-2 opacity-0"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="flex items-center p-4 rounded-lg shadow-lg max-w-md"
      :class="[
        toast.type === 'error'
          ? 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300'
          : 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      ]"
    >
      <div class="flex-shrink-0 mr-3">
        <svg
          v-if="toast.type === 'error'"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <svg
          v-else
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <div v-if="toast.title" class="font-medium">
          {{ toast.title }}
        </div>
        <div :class="{ 'mt-1': toast.title }">
          {{ toast.message }}
        </div>
      </div>
      <button
        class="ml-4 flex-shrink-0 text-current opacity-50 hover:opacity-100 focus:outline-none"
        @click="removeToast(toast.id)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TransitionGroup } from 'vue'

interface Toast {
  id: number
  type: 'success' | 'error'
  title?: string
  message: string
  duration: number
}

const toasts = ref<Toast[]>([])
let nextId = 1

const show = (messageOrOptions: string | Partial<Toast>, type: Toast['type'] = 'success') => {
  const id = nextId++
  const toast: Toast = typeof messageOrOptions === 'string'
    ? {
        id,
        type,
        message: messageOrOptions,
        duration: 3000
      }
    : {
        id,
        type: messageOrOptions.type || type,
        title: messageOrOptions.title,
        message: messageOrOptions.message || '',
        duration: messageOrOptions.duration || 3000
      }

  toasts.value.push(toast)
  setTimeout(() => {
    removeToast(id)
  }, toast.duration)
}

const removeToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

defineExpose({
  show
})
</script> 