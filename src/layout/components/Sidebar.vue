<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="false"
    :collapse-transition="false"
    class="sidebar-menu"
    @select="handleSelect"
  >
    <el-menu-item index="/">
      <el-icon><House /></el-icon>
      <template #title>首页</template>
    </el-menu-item>

    <el-menu-item index="/contacts">
      <el-icon><UserFilled /></el-icon>
      <template #title>联系人管理</template>
    </el-menu-item>

    <el-menu-item index="/events">
      <el-icon><Calendar /></el-icon>
      <template #title>活动管理</template>
    </el-menu-item>

    <el-menu-item index="/leaderboard">
      <el-icon><Trophy /></el-icon>
      <template #title>排行榜</template>
    </el-menu-item>

    <el-menu-item index="/dharma-events">
      <el-icon><Bell /></el-icon>
      <template #title>法会参与</template>
    </el-menu-item>

    <el-menu-item index="/newcomer-class">
      <el-icon><Reading /></el-icon>
      <template #title>新民班</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  House,
  UserFilled,
  Calendar,
  Trophy,
  Bell,
  Reading
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 控制菜单折叠状态
const isCollapse = ref(false)

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

// 处理菜单选择
const handleSelect = (index) => {
  router.push(index)
}
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style>
