<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" class="relative z-10" @close="$emit('update:show', false)">
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
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all"
              :class="[maxWidth]"
            >
              <slot name="header">
                <DialogTitle
                  v-if="title"
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  {{ title }}
                </DialogTitle>
              </slot>

              <div :class="{ 'mt-4': title }">
                <slot />
              </div>

              <div v-if="$slots.footer" class="mt-6">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'

defineProps<{
  show: boolean
  title?: string
  maxWidth?: string
}>()

defineEmits<{
  'update:show': [value: boolean]
}>()
</script> 