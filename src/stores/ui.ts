import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
  state: () => ({
    loading: false,
    loadingMessage: '',
    darkMode: false
  }),

  actions: {
    startLoading(message = '') {
      this.loading = true
      this.loadingMessage = message
    },

    stopLoading() {
      this.loading = false
      this.loadingMessage = ''
    },

    toggleDarkMode() {
      this.darkMode = !this.darkMode
      if (this.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('darkMode', this.darkMode.toString())
    },

    initDarkMode() {
      const savedMode = localStorage.getItem('darkMode')
      if (savedMode === 'true') {
        this.darkMode = true
        document.documentElement.classList.add('dark')
      }
    }
  }
}) 