import request from '@/utils/request'

// 登录
export function login(data) {
  console.log('登录请求数据:', data)
  return request({
    url: '/api/token/',
    method: 'post',
    data
  }).then(response => {
    console.log('原始登录响应:', response)
    // 确保所有字段都有正确的值
    const result = {
      access: response.access,
      refresh: response.refresh,
      username: response.username,
      is_staff: response.is_staff === true,
      role: response.role,
      id: response.id,
      email: response.email,
      // 积分和等级信息
      points: response.points,
      level: response.level,
      level_name: response.level_name,
      level_description: response.level_description,
      // 时间信息
      created_at: response.created_at,
      updated_at: response.updated_at
    }
    console.log('处理后的登录数据:', result)
    return result
  })
}

// 刷新token
export function refreshToken(data) {
  return request({
    url: '/api/token/refresh/',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/api/users/me/',
    method: 'get'
  })
}
