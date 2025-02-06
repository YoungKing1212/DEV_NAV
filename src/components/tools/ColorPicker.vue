<template>
  <div class="space-y-6">
    <div class="grid grid-cols-2 gap-6">
      <!-- 颜色选择器 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            选择颜色
          </label>
          <input
            type="color"
            v-model="color"
            class="w-full h-40"
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              RGB
            </label>
            <input
              type="text"
              :value="rgbColor"
              readonly
              class="w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              HEX
            </label>
            <input
              type="text"
              v-model="color"
              class="w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      <!-- 颜色预览 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          预览
        </label>
        <div class="space-y-4">
          <div
            class="h-40 rounded-lg border"
            :style="{ backgroundColor: color }"
          ></div>
          <div class="grid grid-cols-5 gap-2">
            <div
              v-for="(shade, index) in colorShades"
              :key="index"
              class="aspect-square rounded-lg border cursor-pointer"
              :style="{ backgroundColor: shade }"
              @click="color = shade"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 颜色历史 -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        最近使用
      </label>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(historyColor, index) in colorHistory"
          :key="index"
          class="w-8 h-8 rounded-lg border cursor-pointer"
          :style="{ backgroundColor: historyColor }"
          @click="color = historyColor"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const color = ref('#000000')
const colorHistory = ref<string[]>([])

// RGB 颜色计算
const rgbColor = computed(() => {
  const r = parseInt(color.value.slice(1, 3), 16)
  const g = parseInt(color.value.slice(3, 5), 16)
  const b = parseInt(color.value.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
})

// 生成颜色色阶
const colorShades = computed(() => {
  const shades: string[] = []
  const r = parseInt(color.value.slice(1, 3), 16)
  const g = parseInt(color.value.slice(3, 5), 16)
  const b = parseInt(color.value.slice(5, 7), 16)

  for (let i = 0; i < 5; i++) {
    const factor = 0.8 + (i * 0.1)
    const newR = Math.min(255, Math.round(r * factor))
    const newG = Math.min(255, Math.round(g * factor))
    const newB = Math.min(255, Math.round(b * factor))
    shades.push(`rgb(${newR}, ${newG}, ${newB})`)
  }

  return shades
})

// 监听颜色变化，更新历史记录
watch(color, (newColor) => {
  if (!colorHistory.value.includes(newColor)) {
    colorHistory.value.unshift(newColor)
    if (colorHistory.value.length > 10) {
      colorHistory.value.pop()
    }
  }
})
</script> 