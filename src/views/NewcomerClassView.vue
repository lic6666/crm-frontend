<template>
  <div class="newcomer-class-container">
    <div class="page-header">
      <h2>新民班</h2>
      <el-button type="primary" @click="showCreateDialog">
        报名参加
      </el-button>
    </div>

    <!-- 课程列表 -->
    <div class="class-list">
      <el-table :data="classes" style="width: 100%">
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="teacher" label="授课法师" width="150" />
        <el-table-column prop="schedule" label="上课时间" width="180" />
        <el-table-column prop="location" label="上课地点" width="180" />
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
      :title="currentClass?.name"
      width="600px"
    >
      <div class="class-details">
        <div class="detail-item">
          <span class="label">授课法师：</span>
          <span class="value">{{ currentClass?.teacher }}</span>
        </div>
        <div class="detail-item">
          <span class="label">上课时间：</span>
          <span class="value">{{ currentClass?.schedule }}</span>
        </div>
        <div class="detail-item">
          <span class="label">上课地点：</span>
          <span class="value">{{ currentClass?.location }}</span>
        </div>
        <div class="detail-item">
          <span class="label">课程状态：</span>
          <span class="value">
            <el-tag :type="getStatusType(currentClass?.status)">
              {{ getStatusText(currentClass?.status) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">课程简介：</span>
          <div class="value description">{{ currentClass?.description }}</div>
        </div>
        <div class="detail-item">
          <span class="label">课程大纲：</span>
          <div class="value syllabus">
            <ol>
              <li v-for="(item, index) in currentClass?.syllabus" :key="index">
                {{ item }}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 状态定义
const classes = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const detailsVisible = ref(false)
const currentClass = ref(null)

// 获取课程列表
const fetchClasses = async () => {
  try {
    // TODO: 调用API获取课程列表
    classes.value = [
      {
        id: 1,
        name: '基础佛法课程',
        teacher: '明德法师',
        schedule: '每周日 09:00-11:00',
        location: '第一教室',
        status: 'open',
        description: '本课程主要介绍基础佛法知识，适合初学者参加。',
        syllabus: [
          '佛教简介与基本概念',
          '三皈依的意义与实践',
          '五戒十善的生活应用',
          '因果业力的深入理解',
          '禅修基础与生活实践'
        ]
      },
      {
        id: 2,
        name: '进阶修行课程',
        teacher: '觉悟法师',
        schedule: '每周六 14:00-16:00',
        location: '第二教室',
        status: 'joined',
        description: '本课程深入探讨修行方法与实践，适合有基础的学员参加。',
        syllabus: [
          '止观修行方法',
          '四念处的修习',
          '六波罗蜜的实践',
          '佛法与现代生活',
          '修行常见问题解答'
        ]
      }
    ]
    total.value = classes.value.length
  } catch (error) {
    console.error('获取课程列表失败:', error)
    ElMessage.error('获取课程列表失败')
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
const showDetails = (classItem) => {
  currentClass.value = classItem
  detailsVisible.value = true
}

// 处理报名
const handleJoin = async (classItem) => {
  try {
    // TODO: 调用API进行报名
    ElMessage.success('报名成功')
    await fetchClasses()
  } catch (error) {
    console.error('报名失败:', error)
    ElMessage.error('报名失败')
  }
}

// 处理取消报名
const handleCancel = async (classItem) => {
  try {
    // TODO: 调用API取消报名
    ElMessage.success('取消报名成功')
    await fetchClasses()
  } catch (error) {
    console.error('取消报名失败:', error)
    ElMessage.error('取消报名失败')
  }
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchClasses()
}

// 处理每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchClasses()
}

onMounted(() => {
  fetchClasses()
})
</script>

<style lang="scss" scoped>
.newcomer-class-container {
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

  .class-list {
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

  .class-details {
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

        &.syllabus {
          margin-top: 8px;

          ol {
            margin: 0;
            padding-left: 20px;

            li {
              margin-bottom: 8px;
              line-height: 1.6;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }
        }
      }
    }
  }
}
</style>
