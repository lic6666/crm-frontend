import request from '@/utils/request'

// 获取活动列表
export function getEvents(params) {
  return request({
    url: '/api/events/',
    method: 'get',
    params: {
      ...params,
      with_creator: true  // 请求包含创建人信息
    }
  })
}

// 创建活动
export function createEvent(data) {
  return request({
    url: '/api/events/',
    method: 'post',
    data
  })
}

// 更新活动
export function updateEvent(id, data) {
  return request({
    url: `/api/events/${id}/`,
    method: 'put',
    data
  })
}

// 删除活动
export function deleteEvent(id) {
  return request({
    url: `/api/events/${id}/`,
    method: 'delete'
  })
}

// 添加参与者
export function addParticipant(eventId, data) {
  console.log('API调用数据:', {
    eventId,
    originalData: data,
    processedData: {
      contact_id: data.contact_id,
      points: parseInt(data.points) || null
    }
  })
  return request({
    url: `/api/events/${eventId}/add_participant/`,
    method: 'post',
    data: {
      contact_id: data.contact_id,
      points: parseInt(data.points) || null  // 确保积分是整数
    }
  })
}

// 移除参与者
export function removeParticipant(eventId, data) {
  return request({
    url: `/api/events/${eventId}/remove_participant/`,
    method: 'post',
    data
  })
}
