<template>
  <div class="space-y-6">
    <!-- PDF 上传 -->
    <div
      class="border-2 border-dashed rounded-lg p-8"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept=".pdf"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
      
      <div class="text-center">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div class="text-sm text-gray-600">
            <button
              type="button"
              class="text-blue-600 hover:text-blue-500"
              @click="fileInput?.click()"
            >
              选择PDF文件
            </button>
            或拖放文件到此处
          </div>
        </div>
      </div>
    </div>

    <!-- 工具选项 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        v-for="tool in tools"
        :key="tool.id"
        class="p-4 border rounded-lg hover:bg-gray-50 text-center"
        :disabled="!selectedFiles.length"
        @click="handleToolClick(tool.id)"
      >
        <div class="font-medium mb-1">{{ tool.name }}</div>
        <div class="text-sm text-gray-500">{{ tool.description }}</div>
      </button>
    </div>

    <!-- 文件列表 -->
    <div class="space-y-4">
      <div
        v-for="file in selectedFiles"
        :key="file.name"
        class="flex items-center justify-between p-4 border rounded-lg"
      >
        <div>
          <div class="font-medium">{{ file.name }}</div>
          <div class="text-sm text-gray-500">
            {{ formatSize(file.size) }}
          </div>
        </div>
        <button
          @click="removeFile(file)"
          class="text-red-500 hover:text-red-700"
        >
          删除
        </button>
      </div>
    </div>

    <!-- 处理中提示 -->
    <div
      v-if="processing"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded-lg">
        <div class="text-center">处理中...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const processing = ref(false)

const tools = [
  {
    id: 'merge',
    name: '合并PDF',
    description: '将多个PDF合并为一个文件'
  },
  {
    id: 'split',
    name: '拆分PDF',
    description: '将PDF拆分为多个文件'
  },
  {
    id: 'compress',
    name: '压缩PDF',
    description: '减小PDF文件大小'
  },
  {
    id: 'extract',
    name: '提取页面',
    description: '提取指定页面'
  }
]

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
  const pdfFiles = files.filter(file => file.type === 'application/pdf')
  selectedFiles.value.push(...pdfFiles)
}

const removeFile = (file: File) => {
  selectedFiles.value = selectedFiles.value.filter(f => f !== file)
}

const handleToolClick = async (toolId: string) => {
  if (selectedFiles.value.length === 0) return

  processing.value = true
  try {
    switch (toolId) {
      case 'merge':
        await mergePDFs()
        break
      case 'split':
        await splitPDF()
        break
      // 其他工具功能待实现
    }
  } catch (error) {
    console.error('PDF处理失败:', error)
    alert('处理失败，请重试')
  } finally {
    processing.value = false
  }
}

const mergePDFs = async () => {
  const mergedPdf = await PDFDocument.create()
  
  for (const file of selectedFiles.value) {
    const fileBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(fileBuffer)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach(page => mergedPdf.addPage(page))
  }
  
  const mergedBytes = await mergedPdf.save()
  downloadPDF(mergedBytes, 'merged.pdf')
}

const splitPDF = async () => {
  if (selectedFiles.value.length !== 1) {
    alert('请选择一个PDF文件进行拆分')
    return
  }

  const fileBuffer = await selectedFiles.value[0].arrayBuffer()
  const pdf = await PDFDocument.load(fileBuffer)
  
  for (let i = 0; i < pdf.getPageCount(); i++) {
    const newPdf = await PDFDocument.create()
    const [page] = await newPdf.copyPages(pdf, [i])
    newPdf.addPage(page)
    
    const bytes = await newPdf.save()
    downloadPDF(bytes, `page_${i + 1}.pdf`)
  }
}

const downloadPDF = (bytes: Uint8Array, filename: string) => {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script> 