import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'contacts',
          name: 'contacts',
          component: () => import('@/views/contacts/ContactList.vue'),
          meta: { title: '联系人管理' }
        },
        {
          path: 'events',
          name: 'events',
          component: () => import('@/views/events/EventList.vue'),
          meta: { title: '活动管理' }
        },
        {
          path: 'leaderboard',
          name: 'leaderboard',
          component: () => import('@/views/LeaderboardView.vue'),
          meta: { title: '排行榜' }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/dharma-events',
      name: 'dharmaEvents',
      component: () => import('@/views/DharmaEventsView.vue'),
      meta: {
        requiresAuth: true,
        title: '法会参与'
      }
    },
    {
      path: '/newcomer-class',
      name: 'newcomerClass',
      component: () => import('@/views/NewcomerClassView.vue'),
      meta: {
        requiresAuth: true,
        title: '新民班'
      }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = `${to.meta.title} - CRM系统`

  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

router.afterEach(() => {
  NProgress.done()
})

export default router
