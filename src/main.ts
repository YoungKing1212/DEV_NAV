import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useBookmarkStore } from './stores/bookmark'
import { useSearchStore } from './stores/search'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化数据
const bookmarkStore = useBookmarkStore()
const searchStore = useSearchStore()
bookmarkStore.loadFromLocalStorage()
searchStore.loadFromLocalStorage()

app.mount('#app') 