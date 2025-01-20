import request from '@/utils/request'

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/api/users/me/',
    method: 'get'
  })
}

// 修改用户名
export function changeUsername(username) {
  return request({
    url: '/api/users/change_username/',
    method: 'post',
    data: { username }
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/api/users/change_password/',
    method: 'post',
    data: {
      old_password: data.oldPassword,
      new_password: data.newPassword,
      confirm_password: data.confirmPassword
    }
  })
}

// 获取用户积分排行榜
export function getUserLeaderboard(params) {
  return request({
    url: '/api/users/leaderboard/',
    method: 'get',
    params
  })
}
