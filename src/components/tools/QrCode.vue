<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 输入区域 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            内容
          </label>
          <textarea
            v-model="content"
            rows="4"
            class="w-full px-3 py-2 border rounded-lg"
            placeholder="输入要生成二维码的内容..."
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              尺寸
            </label>
            <input
              v-model="size"
              type="number"
              min="100"
              max="1000"
              step="50"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              容错级别
            </label>
            <select
              v-model="errorLevel"
              class="w-full px-3 py-2 border rounded-lg"
            >
              <option value="L">低 (7%)</option>
              <option value="M">中 (15%)</option>
              <option value="Q">较高 (25%)</option>
              <option value="H">高 (30%)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            颜色
          </label>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">前景色</label>
              <input
                v-model="foreground"
                type="color"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-1">背景色</label>
              <input
                v-model="background"
                type="color"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button
            @click="generateQR"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            生成二维码
          </button>
          <button
            v-if="qrUrl"
            @click="downloadQR"
            class="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            下载
          </button>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="border rounded-lg p-4">
        <div class="text-sm font-medium text-gray-700 mb-4">预览</div>
        <div
          class="flex items-center justify-center min-h-[300px] bg-gray-50 rounded"
        >
          <img
            v-if="qrUrl"
            :src="qrUrl"
            :alt="content"
            class="max-w-full h-auto"
          />
          <div v-else class="text-gray-400">
            二维码预览区域
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QRCode from 'qrcode'

const content = ref('')
const size = ref(300)
const errorLevel = ref('M')
const foreground = ref('#000000')
const background = ref('#FFFFFF')
const qrUrl = ref('')

const generateQR = async () => {
  if (!content.value) return

  try {
    const url = await QRCode.toDataURL(content.value, {
      width: size.value,
      margin: 1,
      color: {
        dark: foreground.value,
        light: background.value
      },
      errorCorrectionLevel: errorLevel.value
    })
    qrUrl.value = url
  } catch (error) {
    console.error('生成二维码失败:', error)
    alert('生成失败，请检查输入内容')
  }
}

const downloadQR = () => {
  if (!qrUrl.value) return

  const link = document.createElement('a')
  link.href = qrUrl.value
  link.download = 'qrcode.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script> 