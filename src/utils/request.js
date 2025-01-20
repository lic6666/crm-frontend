import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '/',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('发送请求详情:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data,
      timestamp: new Date().toISOString()
    })
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('收到响应详情:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    })

    // 检查响应状态
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`请求失败，状态码: ${response.status}`)
    }

    // 检查响应数据
    if (!response.data) {
      throw new Error('响应数据为空')
    }

    return response.data
  },
  error => {
    console.error('响应错误详情:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    })

    const { status } = error.response || {}

    let errorMessage = '未知错误'

    switch (status) {
      case 401:
        errorMessage = '登录已过期，请重新登录'
        localStorage.removeItem('token')
        router.push('/login')
        break
      case 403:
        errorMessage = '没有权限访问'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        break
      case 429:
        errorMessage = '请求过于频繁，请稍后再试'
        break
      case 500:
        errorMessage = '服务器内部错误'
        break
      default:
        errorMessage = error.response?.data?.detail || error.message || '服务器错误'
    }

    ElMessage.error(errorMessage)
    return Promise.reject(new Error(errorMessage))
  }
)

export default service
