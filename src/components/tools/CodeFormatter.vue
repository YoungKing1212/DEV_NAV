<template>
  <div class="space-y-4">
    <div class="flex gap-4 mb-4">
      <select
        v-model="language"
        class="px-3 py-2 border rounded-lg"
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="json">JSON</option>
        <option value="sql">SQL</option>
      </select>

      <button
        @click="formatCode"
        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        格式化
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
          输入代码
        </label>
        <textarea
          v-model="inputCode"
          rows="20"
          class="w-full px-3 py-2 border rounded-lg font-mono text-sm"
          placeholder="在此输入代码..."
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          格式化结果
        </label>
        <pre
          class="w-full h-[calc(20*1.5rem+1rem)] px-3 py-2 border rounded-lg overflow-auto bg-gray-50 font-mono text-sm"
        ><code>{{ outputCode }}</code></pre>
      </div>
    </div>

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import prettier from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import parserHtml from 'prettier/parser-html'
import parserPostcss from 'prettier/parser-postcss'
import parserTypescript from 'prettier/parser-typescript'

const language = ref('javascript')
const inputCode = ref('')
const outputCode = ref('')
const error = ref('')

const formatCode = async () => {
  try {
    const parser = getParser(language.value)
    const plugins = getPlugins(language.value)

    const formatted = await prettier.format(inputCode.value, {
      parser,
      plugins,
      semi: true,
      singleQuote: true,
      trailingComma: 'es5',
      printWidth: 80,
      tabWidth: 2,
    })

    outputCode.value = formatted
    error.value = ''
  } catch (e) {
    error.value = e instanceof Error ? e.message : '格式化失败'
  }
}

const getParser = (lang: string): string => {
  switch (lang) {
    case 'javascript':
      return 'babel'
    case 'typescript':
      return 'typescript'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'json':
      return 'json'
    case 'sql':
      return 'sql'
    default:
      return 'babel'
  }
}

const getPlugins = (lang: string) => {
  switch (lang) {
    case 'javascript':
    case 'json':
      return [parserBabel]
    case 'typescript':
      return [parserTypescript]
    case 'html':
      return [parserHtml]
    case 'css':
      return [parserPostcss]
    default:
      return [parserBabel]
  }
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputCode.value)
  } catch (e) {
    error.value = '复制失败'
  }
}
</script> 