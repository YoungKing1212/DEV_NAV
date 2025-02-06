<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <div class="flex gap-4">
        <button
          @click="createNote"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          新建便签
        </button>
        <button
          @click="saveNotes"
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          保存全部
        </button>
      </div>
      <div class="text-sm text-gray-500">
        共 {{ notes.length }} 个便签
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="note in notes"
        :key="note.id"
        class="group relative bg-yellow-50 p-4 rounded-lg shadow hover:shadow-md"
      >
        <textarea
          v-model="note.content"
          rows="6"
          class="w-full bg-transparent resize-none focus:outline-none"
          :placeholder="'在此输入内容...'"
          @input="updateNote(note)"
        ></textarea>
        
        <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
          <span>{{ formatDate(note.updatedAt) }}</span>
          <button
            @click="deleteNote(note.id)"
            class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { debounce } from 'lodash-es'

interface Note {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const notes = ref<Note[]>([])

// 从本地存储加载便签
onMounted(() => {
  const savedNotes = localStorage.getItem('notes')
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes, (key, value) => {
      if (key === 'createdAt' || key === 'updatedAt') {
        return new Date(value)
      }
      return value
    })
  }
})

// 创建新便签
const createNote = () => {
  const note: Note = {
    id: crypto.randomUUID(),
    content: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  notes.value.unshift(note)
  saveNotes()
}

// 更新便签
const updateNote = debounce((note: Note) => {
  note.updatedAt = new Date()
  saveNotes()
}, 500)

// 删除便签
const deleteNote = (id: string) => {
  if (confirm('确定要删除这个便签吗？')) {
    notes.value = notes.value.filter(note => note.id !== id)
    saveNotes()
  }
}

// 保存到本地存储
const saveNotes = () => {
  localStorage.setItem('notes', JSON.stringify(notes.value))
}

// 格式化日期
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script> 