<template>
  <div class="container mx-auto px-4 pt-20 pb-8">
    <h1 class="text-2xl font-bold mb-6">工具箱</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <router-link
        v-for="tool in tools"
        :key="tool.id"
        :to="{ name: 'tool-detail', params: { toolId: tool.id }}"
        class="block p-4 border rounded-lg hover:shadow-lg transition-shadow"
      >
        <div class="text-center">
          <div class="text-xl mb-2">{{ tool.name }}</div>
          <p class="text-gray-600 text-sm">{{ tool.description }}</p>
        </div>
      </router-link>
    </div>

    <!-- 工具详情路由出口 -->
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import type { Tool } from '@/types'
import CodeFormatter from '@/components/tools/CodeFormatter.vue'

const tools: Tool[] = [
  {
    id: 'code-formatter',
    name: '代码格式化',
    description: '支持多种语言的代码格式化工具'
  },
  {
    id: 'image-compressor',
    name: '图片压缩',
    description: '在线图片压缩工具'
  },
  {
    id: 'pdf-tools',
    name: 'PDF工具',
    description: 'PDF转换、合并、分割等功能'
  },
  {
    id: 'color-picker',
    name: '取色器',
    description: '颜色选择和转换工具'
  },
  {
    id: 'json-formatter',
    name: 'JSON格式化',
    description: '支持多种语言的代码格式化工具'
  },
  {
    id: 'notepad',
    name: '便签',
    description: '简单的在线记事本'
  },
  {
    id: 'qrcode',
    name: '二维码工具',
    description: '生成自定义二维码'
  },
  {
    id: 'time-tools',
    name: '时间工具',
    description: '时间戳转换、时区转换等'
  }
]
</script>

<style scoped>
/* 确保内容不会被导航栏遮挡 */
.container {
  min-height: calc(100vh - 4rem); /* 减去导航栏高度 */
}
</style> 