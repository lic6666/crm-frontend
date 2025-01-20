<template>
  <div class="app-wrapper">
    <header class="app-header">
      <div class="header-left">
        <el-button
          @click="handleCollapse"
          type="primary"
          text
        >
          <el-icon>
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </el-button>
        <h1 class="app-title">蔬食厨房-履德</h1>
      </div>
      <div class="header-right">
        <el-button
          @click="handleTheme"
          text
          circle
        >
          <el-icon>
            <Moon v-if="!isDark" />
            <Sunny v-else />
          </el-icon>
        </el-button>
        <el-dropdown trigger="click" @command="handleCommand">
          <el-avatar :size="32" :icon="UserFilled" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <div class="main-container">
      <el-aside
        class="sidebar-container"
        :width="isCollapse ? '64px' : '240px'"
      >
        <el-menu
          :collapse="isCollapse"
          :router="true"
          :default-active="route.path"
          class="sidebar-menu"
          background-color="var(--bg-color)"
          text-color="var(--text-color)"
          active-text-color="var(--el-color-primary)"
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
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
      </el-aside>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  UserFilled,
  Calendar,
  Trophy,
  Bell,
  Reading,
  Expand,
  Fold,
  Moon,
  Sunny
} from '@element-plus/icons-vue'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

const isDark = computed(() => appStore.isDark)
const isCollapse = computed(() => appStore.isCollapse)

const handleCollapse = () => {
  appStore.toggleSidebar()
  console.log('侧边栏状态已切换:', isCollapse.value)
}

const handleTheme = () => {
  appStore.toggleTheme()
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
  }
}
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar-container {
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
  transition: width var(--transition-duration);
  overflow: hidden;

  .el-menu {
    border-right: none;
  }
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: var(--bg-color);
}

.sidebar-menu {
  height: 100%;
  border-right: none;

  :deep(.el-menu-item) {
    &.is-active {
      background: linear-gradient(90deg, var(--el-color-primary) 0%, transparent 100%);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        background-color: var(--el-color-primary);
      }
    }
  }
}

.app-header {
  height: var(--header-height);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
  position: relative;
  z-index: 1000;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .el-button {
      font-size: 20px;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.3s;

      .el-icon {
        margin-right: 0;
        font-size: 20px;
      }

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }
    }

    .app-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.fold-icon {
  font-size: 20px;
  transition: transform 0.3s;
  will-change: transform;
}

.is-collapse .fold-icon {
  transform: rotate(180deg);
}
</style>
