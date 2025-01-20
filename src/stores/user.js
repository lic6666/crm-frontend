import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi } from '@/api/auth'
import router from '@/router'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)  // 初始化为 null

  // 从 localStorage 恢复用户信息
  try {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
      console.log('从localStorage恢复的用户信息:', user.value)
    }
  } catch (error) {
    console.error('恢复用户信息失败:', error)
  }

  async function login(username, password) {
    try {
      const data = await loginApi({ username, password })
      console.log('登录返回数据:', data)

      // 保存token
      token.value = data.access

      // 保存用户信息
      const userInfo = {
        username: data.username,
        is_staff: data.is_staff === true,  // 确保是布尔值
        role: data.role || 'user',  // 设置默认角色
        id: data.id,
        email: data.email,
        points: data.points || 0,
        level: data.level || 'beginner',
        level_name: data.level_name || '初心者',
        level_description: data.level_description || ''
      }
      console.log('准备保存的用户信息:', userInfo)

      user.value = userInfo

      // 保存到localStorage
      localStorage.setItem('token', data.access)
      localStorage.setItem('user', JSON.stringify(userInfo))
      console.log('用户信息已保存到localStorage')

      router.push('/')
      ElMessage.success('登录成功')
    } catch (error) {
      console.error('登录错误:', error)
      ElMessage.error('登录失败：' + (error.response?.data?.detail || '未知错误'))
      throw error
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  // 更新用戶信息
  function updateUserInfo(userInfo) {
    user.value = userInfo
    // 保存到 localStorage
    localStorage.setItem('user', JSON.stringify(userInfo))
    console.log('用戶信息已更新:', userInfo)
  }

  return {
    token,
    user,
    login,
    logout,
    updateUserInfo  // 導出新方法
  }
})
