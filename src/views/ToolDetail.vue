<template>
  <div v-if="tool" class="fixed inset-0 bg-white z-10">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">{{ tool.name }}</h1>
        <router-link
          to="/tools"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          返回
        </router-link>
      </div>

      <component :is="toolComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Tool } from '@/types'

// 导入工具组件
import JsonFormatter from '@/components/tools/JsonFormatter.vue'
import CodeFormatter from '@/components/tools/CodeFormatter.vue'
import ImageCompressor from '@/components/tools/ImageCompressor.vue'
import ColorPicker from '@/components/tools/ColorPicker.vue'
import PdfTools from '@/components/tools/PdfTools.vue'
import Notepad from '@/components/tools/Notepad.vue'

const route = useRoute()

const tools: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON格式化',
    component: JsonFormatter
  },
  {
    id: 'code-formatter',
    name: '代码格式化',
    component: CodeFormatter
  },
  {
    id: 'image-compressor',
    name: '图片压缩',
    component: ImageCompressor
  },
  {
    id: 'color-picker',
    name: '取色器',
    component: ColorPicker
  },
  {
    id: 'pdf-tools',
    name: 'PDF工具',
    component: PdfTools
  },
  {
    id: 'notepad',
    name: '便签',
    component: Notepad
  }
]

const tool = computed(() => 
  tools.find(t => t.id === route.params.toolId)
)

const toolComponent = computed(() => 
  tool.value?.component || null
)
</script> 