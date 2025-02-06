<template>
  <div class="space-y-6">
    <!-- 时间戳转换 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium mb-4">时间戳转换</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            时间戳 (毫秒)
          </label>
          <input
            v-model="timestamp"
            type="number"
            class="w-full px-3 py-2 border rounded-lg"
            @input="updateFromTimestamp"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            时间字符串
          </label>
          <input
            v-model="dateString"
            type="datetime-local"
            step="1"
            class="w-full px-3 py-2 border rounded-lg"
            @input="updateFromDateString"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            相对时间
          </label>
          <div class="text-gray-600 mt-2">
            {{ relativeTime }}
          </div>
        </div>
      </div>
    </div>

    <!-- 时区转换 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium mb-4">时区转换</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            源时区
          </label>
          <select
            v-model="sourceTimezone"
            class="w-full px-3 py-2 border rounded-lg"
          >
            <option
              v-for="tz in timezones"
              :key="tz.value"
              :value="tz.value"
            >
              {{ tz.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            目标时区
          </label>
          <select
            v-model="targetTimezone"
            class="w-full px-3 py-2 border rounded-lg"
          >
            <option
              v-for="tz in timezones"
              :key="tz.value"
              :value="tz.value"
            >
              {{ tz.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            源时间
          </label>
          <input
            v-model="sourceTime"
            type="datetime-local"
            step="1"
            class="w-full px-3 py-2 border rounded-lg"
            @input="convertTimezone"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            转换结果
          </label>
          <input
            :value="convertedTime"
            type="text"
            readonly
            class="w-full px-3 py-2 border rounded-lg bg-gray-50"
          />
        </div>
      </div>
    </div>

    <!-- 倒计时/计时器 -->
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium mb-4">倒计时/计时器</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 倒计时 -->
        <div>
          <div class="flex gap-4 mb-4">
            <input
              v-model="countdown"
              type="number"
              min="1"
              class="w-24 px-3 py-2 border rounded-lg"
              placeholder="分钟"
              :disabled="countdownRunning"
            />
            <button
              v-if="!countdownRunning"
              @click="startCountdown"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              开始倒计时
            </button>
            <button
              v-else
              @click="stopCountdown"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              停止
            </button>
          </div>
          <div class="text-3xl font-mono">
            {{ formatTime(countdownRemaining) }}
          </div>
        </div>

        <!-- 计时器 -->
        <div>
          <div class="flex gap-4 mb-4">
            <button
              v-if="!timerRunning"
              @click="startTimer"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              开始计时
            </button>
            <template v-else>
              <button
                @click="pauseTimer"
                class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                暂停
              </button>
              <button
                @click="stopTimer"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                停止
              </button>
            </template>
          </div>
          <div class="text-3xl font-mono">
            {{ formatTime(timerElapsed) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('zh-cn')

// 时间戳转换
const timestamp = ref(Date.now())
const dateString = ref(dayjs().format('YYYY-MM-DDTHH:mm:ss'))

const relativeTime = computed(() => {
  return dayjs(Number(timestamp.value)).fromNow()
})

const updateFromTimestamp = () => {
  dateString.value = dayjs(Number(timestamp.value)).format('YYYY-MM-DDTHH:mm:ss')
}

const updateFromDateString = () => {
  timestamp.value = dayjs(dateString.value).valueOf()
}

// 时区转换
const timezones = [
  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)' },
  { value: 'America/New_York', label: '纽约 (UTC-4/5)' },
  { value: 'Europe/London', label: '伦敦 (UTC+0/1)' },
  { value: 'Asia/Tokyo', label: '东京 (UTC+9)' },
  { value: 'UTC', label: '协调世界时 (UTC)' }
]

const sourceTimezone = ref('Asia/Shanghai')
const targetTimezone = ref('UTC')
const sourceTime = ref(dayjs().format('YYYY-MM-DDTHH:mm:ss'))
const convertedTime = ref('')

const convertTimezone = () => {
  const time = dayjs.tz(sourceTime.value, sourceTimezone.value)
  convertedTime.value = time.tz(targetTimezone.value).format('YYYY-MM-DD HH:mm:ss')
}

// 倒计时
const countdown = ref(5)
const countdownRunning = ref(false)
const countdownRemaining = ref(0)
let countdownInterval: number | null = null

const startCountdown = () => {
  if (!countdown.value) return
  countdownRunning.value = true
  countdownRemaining.value = countdown.value * 60
  countdownInterval = window.setInterval(() => {
    if (countdownRemaining.value > 0) {
      countdownRemaining.value--
    } else {
      stopCountdown()
      alert('倒计时结束！')
    }
  }, 1000)
}

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  countdownRunning.value = false
  countdownRemaining.value = 0
}

// 计时器
const timerRunning = ref(false)
const timerElapsed = ref(0)
let timerInterval: number | null = null

const startTimer = () => {
  timerRunning.value = true
  timerInterval = window.setInterval(() => {
    timerElapsed.value++
  }, 1000)
}

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  timerRunning.value = false
}

const stopTimer = () => {
  pauseTimer()
  timerElapsed.value = 0
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s]
    .map(v => v.toString().padStart(2, '0'))
    .join(':')
}
</script> 