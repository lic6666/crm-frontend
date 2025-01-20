<template>
  <div class="dharma-events-container">
    <div class="page-header">
      <h2>法会参与</h2>
      <el-button type="primary" @click="showCreateDialog">
        报名参加
      </el-button>
    </div>

    <!-- 法会列表 -->
    <div class="events-list">
      <el-table :data="events" style="width: 100%">
        <el-table-column prop="name" label="法会名称" />
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="location" label="地点" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'open'"
              type="primary"
              link
              @click="handleJoin(row)"
            >
              报名
            </el-button>
            <el-button
              v-if="row.status === 'joined'"
              type="danger"
              link
              @click="handleCancel(row)"
            >
              取消报名
            </el-button>
            <el-button type="primary" link @click="showDetails(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailsVisible"
      :title="currentEvent?.name"
      width="600px"
    >
      <div class="event-details">
        <div class="detail-item">
          <span class="label">日期：</span>
          <span class="value">{{ currentEvent?.date }}</span>
        </div>
        <div class="detail-item">
          <span class="label">地点：</span>
          <span class="value">{{ currentEvent?.location }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span class="value">
            <el-tag :type="getStatusType(currentEvent?.status)">
              {{ getStatusText(currentEvent?.status) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">描述：</span>
          <div class="value description">{{ currentEvent?.description }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 状态定义
const events = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailsVisible = ref(false)
const currentEvent = ref(null)

// 获取法会列表
const fetchEvents = async () => {
  try {
    // TODO: 调用API获取法会列表
    events.value = [
      {
        id: 1,
        name: '早课',
        date: '2025-01-20',
        location: '大雄宝殿',
        status: 'open',
        description: '每日早课，共修念佛。'
      },
      {
        id: 2,
        name: '晚课',
        date: '2025-01-20',
        location: '大雄宝殿',
        status: 'joined',
        description: '每日晚课，共修念佛。'
      }
    ]
    total.value = events.value.length
  } catch (error) {
    console.error('获取法会列表失败:', error)
    ElMessage.error('获取法会列表失败')
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    open: 'primary',
    joined: 'success',
    closed: 'info',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    open: '可报名',
    joined: '已报名',
    closed: '已结束',
    cancelled: '已取消'
  }
  return texts[status] || status
}

// 显示详情
const showDetails = (event) => {
  currentEvent.value = event
  detailsVisible.value = true
}

// 处理报名
const handleJoin = async (event) => {
  try {
    // TODO: 调用API进行报名
    ElMessage.success('报名成功')
    await fetchEvents()
  } catch (error) {
    console.error('报名失败:', error)
    ElMessage.error('报名失败')
  }
}

// 处理取消报名
const handleCancel = async (event) => {
  try {
    // TODO: 调用API取消报名
    ElMessage.success('取消报名成功')
    await fetchEvents()
  } catch (error) {
    console.error('取消报名失败:', error)
    ElMessage.error('取消报名失败')
  }
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchEvents()
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchEvents()
}

onMounted(() => {
  fetchEvents()
})
</script>

<style lang="scss" scoped>
.dharma-events-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  .events-list {
    background: var(--el-bg-color);
    border-radius: 8px;
    padding: 20px;
    box-shadow: var(--el-box-shadow-light);

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  .event-details {
    .detail-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-weight: 500;
        color: var(--el-text-color-regular);
        margin-right: 8px;
      }

      .value {
        color: var(--el-text-color-primary);

        &.description {
          margin-top: 8px;
          white-space: pre-line;
          line-height: 1.6;
        }
      }
    }
  }
}
</style>
