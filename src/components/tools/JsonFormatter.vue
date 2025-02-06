<template>
  <div class="space-y-4">
    <div class="flex gap-4 mb-4">
      <button
        @click="formatJson"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        格式化
      </button>
      <button
        @click="minifyJson"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
      >
        压缩
      </button>
      <button
        @click="copyResult"
        class="px-4 py-2 border rounded-lg hover:bg-gray-50"
      >
        复制结果
      </button>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          输入 JSON
        </label>
        <textarea
          v-model="inputJson"
          rows="20"
          class="w-full px-3 py-2 border rounded-lg font-mono text-sm"
          placeholder="在此输入 JSON..."
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          格式化结果
        </label>
        <pre
          class="w-full h-[calc(20*1.5rem+1rem)] px-3 py-2 border rounded-lg overflow-auto bg-gray-50 font-mono text-sm"
        ><code>{{ outputJson }}</code></pre>
      </div>
    </div>

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const inputJson = ref('')
const outputJson = ref('')
const error = ref('')

const formatJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, 2)
    error.value = ''
  } catch (e) {
    error.value = '无效的 JSON 格式'
  }
}

const minifyJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    error.value = ''
  } catch (e) {
    error.value = '无效的 JSON 格式'
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputJson.value)
  } catch (e) {
    error.value = '复制失败'
  }
}
</script> 