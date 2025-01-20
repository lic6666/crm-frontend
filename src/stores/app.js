import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 使用 ref 来管理状态
  const isDark = ref(localStorage.getItem('crm-theme-dark') === 'true')
  const isCollapse = ref(false)

  // 切换主题
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('crm-theme-dark', isDark.value)
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  // 切换侧边栏
  function toggleSidebar() {
    isCollapse.value = !isCollapse.value
    console.log('切换侧边栏状态:', isCollapse.value)
  }

  return {
    isDark,
    isCollapse,
    toggleTheme,
    toggleSidebar
  }
})
