import request from '@/utils/request'

// 获取统计数据
export function getStats() {
  return request({
    url: '/api/contacts/statistics/',
    method: 'get'
  })
}

// 获取联系人列表
export function getContacts(params) {
  return request({
    url: '/api/contacts/',
    method: 'get',
    params
  })
}

// 创建联系人
export function createContact(data) {
  return request({
    url: '/api/contacts/',
    method: 'post',
    data
  })
}

// 更新联系人
export function updateContact(id, data) {
  return request({
    url: `/api/contacts/${id}/`,
    method: 'put',
    data
  })
}

// 删除联系人
export function deleteContact(id) {
  return request({
    url: `/api/contacts/${id}/`,
    method: 'delete'
  })
}

// 获取排行榜
export function getLeaderboard(params) {
  return request({
    url: '/api/contacts/leaderboard/',
    method: 'get',
    params
  })
}

// 获取所有标签
export function getTags() {
  return request({
    url: '/api/contacts/tags/',
    method: 'get'
  })
}
