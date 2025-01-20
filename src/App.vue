<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

onMounted(() => {
  // 初始化主题
  const isDark = localStorage.getItem('crm-theme-dark') === 'true'
  document.documentElement.classList.toggle('dark', isDark)
})
</script>

<style>
@import '@/styles/index.scss';
</style>
