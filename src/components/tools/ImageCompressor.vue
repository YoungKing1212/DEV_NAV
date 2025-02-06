<template>
  <div class="space-y-6">
    <!-- 图片上传区域 -->
    <div
      class="border-2 border-dashed rounded-lg p-8"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
      
      <div class="text-center">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="text-sm text-gray-600">
            <button
              type="button"
              class="text-blue-600 hover:text-blue-500"
              @click="fileInput?.click()"
            >
              选择图片
            </button>
            或拖放图片到此处
          </div>
          <p class="text-xs text-gray-500 mt-1">
            支持 PNG、JPG、JPEG、WebP 格式
          </p>
        </div>
      </div>
    </div>

    <!-- 压缩设置 -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          质量 ({{ quality }}%)
        </label>
        <input
          v-model="quality"
          type="range"
          min="1"
          max="100"
          class="w-full"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          最大宽度
        </label>
        <input
          v-model="maxWidth"
          type="number"
          min="100"
          step="100"
          class="w-full px-3 py-2 border rounded-lg"
        />
      </div>
    </div>

    <!-- 图片列表 -->
    <div class="space-y-4">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="border rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="font-medium">{{ image.file.name }}</div>
            <div class="text-sm text-gray-500">
              原始大小: {{ formatSize(image.originalSize) }}
              {{ image.compressedSize ? `→ 压缩后: ${formatSize(image.compressedSize)}` : '' }}
            </div>
          </div>
          <button
            v-if="image.compressedUrl"
            @click="downloadImage(image)"
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            下载
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm font-medium mb-2">原图</div>
            <img
              :src="image.originalUrl"
              class="max-w-full h-auto border rounded"
              :alt="image.file.name"
            />
          </div>
          <div>
            <div class="text-sm font-medium mb-2">压缩后</div>
            <img
              v-if="image.compressedUrl"
              :src="image.compressedUrl"
              class="max-w-full h-auto border rounded"
              :alt="image.file.name"
            />
            <div
              v-else
              class="flex items-center justify-center h-full border rounded bg-gray-50"
            >
              <button
                @click="compressImage(image)"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                开始压缩
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ImageItem {
  file: File
  originalUrl: string
  originalSize: number
  compressedUrl?: string
  compressedSize?: number
}

const fileInput = ref<HTMLInputElement | null>(null)
const quality = ref(80)
const maxWidth = ref(1920)
const images = ref<ImageItem[]>([])

const handleFileSelect = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    addFiles(Array.from(files))
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files))
  }
}

const addFiles = (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  imageFiles.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      images.value.push({
        file,
        originalUrl: e.target?.result as string,
        originalSize: file.size
      })
    }
    reader.readAsDataURL(file)
  })
}

const compressImage = async (image: ImageItem) => {
  try {
    // 创建图片元素
    const img = new Image()
    img.src = image.originalUrl
    
    await new Promise((resolve) => {
      img.onload = resolve
    })

    // 计算新尺寸
    let newWidth = img.width
    let newHeight = img.height
    
    if (maxWidth.value && img.width > maxWidth.value) {
      const ratio = maxWidth.value / img.width
      newWidth = maxWidth.value
      newHeight = img.height * ratio
    }

    // 创建canvas
    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight

    // 绘制图片
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建canvas上下文')
    
    ctx.drawImage(img, 0, 0, newWidth, newHeight)

    // 转换为blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        image.file.type,
        quality.value / 100
      )
    })

    // 更新图片信息
    image.compressedUrl = URL.createObjectURL(blob)
    image.compressedSize = blob.size
  } catch (error) {
    console.error('压缩失败:', error)
  }
}

const downloadImage = (image: ImageItem) => {
  if (!image.compressedUrl) return
  
  const link = document.createElement('a')
  link.href = image.compressedUrl
  link.download = `compressed_${image.file.name}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script> 