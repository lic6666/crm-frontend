<template>
  <div class="page-container">
    <div class="app-card leaderboard-container">
      <!-- 标题和时间范围选择 -->
      <div class="header">
        <h2 class="title">积分排行榜</h2>
        <div class="time-range">
          <el-radio-group v-model="timeRange" @change="fetchLeaderboard" size="large">
            <el-radio-button label="week">本周</el-radio-button>
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
            <el-radio-button label="all">全部</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 前八名展示区 -->
      <div class="top-ranks" v-if="!loading && topRanks.length">
        <!-- 前三名特殊展示 -->
        <div class="top-three">
          <!-- 第二名 -->
          <div class="rank-card second" v-if="topRanks[1]">
            <div class="crown silver">2</div>
            <el-avatar :size="80" class="avatar">
              {{ topRanks[1].name.charAt(0) }}
            </el-avatar>
            <div class="info">
              <div class="name">{{ topRanks[1].name }}</div>
              <div class="points">{{ topRanks[1].points }} 分</div>
            </div>
            <div class="details">
              {{ topRanks[1].major }} | {{ topRanks[1].grade }}年级
            </div>
          </div>

          <!-- 第一名 -->
          <div class="rank-card first" v-if="topRanks[0]">
            <div class="crown gold">1</div>
            <el-avatar :size="100" class="avatar">
              {{ topRanks[0].name.charAt(0) }}
            </el-avatar>
            <div class="info">
              <div class="name">{{ topRanks[0].name }}</div>
              <div class="points">{{ topRanks[0].points }} 分</div>
            </div>
            <div class="details">
              {{ topRanks[0].major }} | {{ topRanks[0].grade }}年级
            </div>
          </div>

          <!-- 第三名 -->
          <div class="rank-card third" v-if="topRanks[2]">
            <div class="crown bronze">3</div>
            <el-avatar :size="80" class="avatar">
              {{ topRanks[2].name.charAt(0) }}
            </el-avatar>
            <div class="info">
              <div class="name">{{ topRanks[2].name }}</div>
              <div class="points">{{ topRanks[2].points }} 分</div>
            </div>
            <div class="details">
              {{ topRanks[2].major }} | {{ topRanks[2].grade }}年级
            </div>
          </div>
        </div>

        <!-- 4-8名列表展示 -->
        <div class="rank-list" v-if="topRanks.length > 3">
          <div
            v-for="(item, index) in topRanks.slice(3, 8)"
            :key="item.id"
            class="rank-item"
            :class="{ 'highlight': item.id === currentUser?.id }"
          >
            <div class="rank">{{ index + 4 }}</div>
            <el-avatar :size="50" class="avatar">
              {{ item.name.charAt(0) }}
            </el-avatar>
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="details">{{ item.major }} | {{ item.grade }}年级</div>
            </div>
            <div class="points">{{ item.points }} 分</div>
          </div>
        </div>
      </div>

      <!-- 分页列表 -->
      <div class="pagination-list" v-if="!loading">
        <div class="rank-list" v-if="paginatedRanks.length">
          <div
            v-for="(item, index) in paginatedRanks"
            :key="item.id"
            class="rank-item"
            :class="{ 'highlight': item.id === currentUser?.id }"
          >
            <div class="rank">{{ 8 + (currentPage - 1) * 10 + index + 1 }}</div>
            <el-avatar :size="50" class="avatar">
              {{ item.name.charAt(0) }}
            </el-avatar>
            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="details">{{ item.major }} | {{ item.grade }}年级</div>
            </div>
            <div class="points">{{ item.points }} 分</div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :total="total"
            :page-size="10"
            layout="prev, pager, next"
            background
            @current-change="handleCurrentChange"
            :hide-on-single-page="false"
          />
        </div>
      </div>

      <!-- 我的排名 -->
      <div class="my-ranks" v-if="myRanks.length && !loading">
        <div class="section-title">我创建的联系人排名</div>
        <div class="ranks-container">
          <div
            v-for="rank in myRanks.slice((myRanksCurrentPage - 1) * 8, myRanksCurrentPage * 8)"
            :key="rank.name"
            class="my-rank-card"
          >
            <div class="rank-badge">
              <div class="rank-number"># {{ rank.rank }}</div>
              <div class="rank-label">当前排名</div>
            </div>
            <div class="user-info">
              <el-avatar :size="60" class="avatar">
                {{ rank.name.charAt(0) }}
              </el-avatar>
              <div class="info">
                <div class="name">{{ rank.name }}</div>
                <div class="details">{{ rank.major }} | {{ rank.grade }}年级</div>
              </div>
            </div>
            <div class="points-info">
              <div class="points-value">{{ rank.points }}</div>
              <div class="points-label">总积分</div>
            </div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="myRanksCurrentPage"
            :total="myRanks.length"
            :page-size="8"
            layout="prev, pager, next"
            background
            @current-change="handleMyRanksPageChange"
            :hide-on-single-page="false"
            small
          />
        </div>
      </div>

      <!-- 使用者积分排行 -->
      <div class="user-ranks" v-if="!loading">
        <div class="header">
          <div class="section-title">使用者积分排行</div>
          <div class="time-range">
            <el-radio-group v-model="userTimeRange" @change="fetchUserLeaderboard" size="large">
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
              <el-radio-button label="year">本年</el-radio-button>
              <el-radio-button label="all">全部</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="rank-list">
          <div
            v-for="(user, index) in userRanks"
            :key="user.id"
            class="rank-item"
            :class="{ 'highlight': user.id === currentUser?.id }"
          >
            <div class="rank">{{ (userRanksCurrentPage - 1) * 10 + index + 1 }}</div>
            <el-avatar :size="50" class="avatar">
              {{ user.username.charAt(0) }}
            </el-avatar>
            <div class="info">
              <div class="name">{{ user.username }}</div>
              <div class="details">{{ user.role || '普通用户' }}</div>
            </div>
            <div class="points">{{ user.points }} 分</div>
          </div>
        </div>

        <!-- 分页控件 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="userRanksCurrentPage"
            :total="userRanksTotal"
            :page-size="10"
            layout="prev, pager, next"
            background
            @current-change="handleUserRanksPageChange"
            :hide-on-single-page="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getLeaderboard } from '@/api/contacts'
import { getUserLeaderboard } from '@/api/user'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const currentUser = userStore.user

const timeRange = ref('week')
const loading = ref(false)
const topRanks = ref([])
const paginatedRanks = ref([])
const myRanks = ref([])

// 分页相关
const currentPage = ref(1)
const total = ref(0)

// 我的排名分页相关
const myRanksCurrentPage = ref(1)

// 使用者排行榜相关
const userRanks = ref([])
const userRanksCurrentPage = ref(1)
const userRanksTotal = ref(0)
const userTimeRange = ref('week')

const fetchLeaderboard = async () => {
  loading.value = true
  try {
    // 获取前8名数据
    const topResponse = await getLeaderboard({
      time_range: timeRange.value,
      limit: 8,
      offset: 0
    })

    // 获取分页数据
    const pageResponse = await getLeaderboard({
      time_range: timeRange.value,
      limit: 10,
      offset: 8 + (currentPage.value - 1) * 10
    })

    // 获取我的排名数据
    const myRanksResponse = await getLeaderboard({
      time_range: timeRange.value,
      my_ranks_only: true
    })

    // 获取使用者排行榜数据
    await fetchUserLeaderboard()

    if (!topResponse || typeof topResponse !== 'object') {
      throw new Error('返回数据格式不正确：不是一个对象')
    }

    // 处理前8名数据
    topRanks.value = (topResponse.results || []).map(item => ({
      id: item.id || 0,
      name: item.name || '未知',
      points: Number(item.points || 0),
      major: item.major || '未知',
      grade: Number(item.grade || 1)
    }))

    // 处理分页数据
    paginatedRanks.value = (pageResponse.results || []).map(item => ({
      id: item.id || 0,
      name: item.name || '未知',
      points: Number(item.points || 0),
      major: item.major || '未知',
      grade: Number(item.grade || 1)
    }))

    // 设置总数量（减去前8名）
    total.value = Math.max(0, pageResponse.count - 8)

    // 处理我的排名数据
    if (myRanksResponse.my_ranks && Array.isArray(myRanksResponse.my_ranks)) {
      // 获取所有联系人的排名数据
      const allRanksResponse = await getLeaderboard({
        time_range: timeRange.value,
        limit: 1000,  // 获取足够多的数据以确保能找到所有需要的联系人
        offset: 0
      })

      // 创建一个映射来存储所有联系人的排名
      const rankMap = new Map()
      if (allRanksResponse.results && Array.isArray(allRanksResponse.results)) {
        allRanksResponse.results.forEach((item, index) => {
          rankMap.set(item.name, index + 1)
        })
      }

      // 处理我的联系人排名数据
      myRanks.value = myRanksResponse.my_ranks.map(rank => ({
        rank: rankMap.get(rank.name) || 0,  // 从所有联系人排名中获取实际排名
        name: rank.name || '未知',
        points: Number(rank.points || 0),
        major: rank.major || '未知',
        grade: Number(rank.grade || 1)
      }))
      console.log('处理后的排名数据:', myRanks.value)
    } else {
      myRanks.value = []
    }

    // 添加调试日志
    console.log('原始排名数据:', myRanksResponse)
    console.log('处理后的排名数据:', myRanks.value)

  } catch (error) {
    console.error('获取排行榜失败:', error)
    ElMessage.error(error.message || '获取排行榜失败')
    topRanks.value = []
    paginatedRanks.value = []
    myRanks.value = []
    userRanks.value = []
    total.value = 0
    userRanksTotal.value = 0
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchLeaderboard()
}

// 重置分页
const resetPagination = () => {
  currentPage.value = 1
  myRanksCurrentPage.value = 1
  userRanksCurrentPage.value = 1
  total.value = 0
  userRanksTotal.value = 0
}

// 监听时间范围变化时重置分页
watch(timeRange, () => {
  resetPagination()
  fetchLeaderboard()
})

// 处理我的排名页码变化
const handleMyRanksPageChange = (val) => {
  myRanksCurrentPage.value = val
  fetchLeaderboard()
}

// 获取使用者排行榜数据
const fetchUserLeaderboard = async () => {
  try {
    const response = await getUserLeaderboard({
      time_range: userTimeRange.value,
      limit: 10,
      offset: (userRanksCurrentPage.value - 1) * 10
    })

    if (response && response.results) {
      userRanks.value = response.results.map(user => ({
        id: user.id,
        username: user.username || '未知用户',
        points: Number(user.points || 0),
        role: user.role || '普通用户'
      }))
      userRanksTotal.value = response.count || 0
    }
  } catch (error) {
    console.error('获取使用者排行榜失败:', error)
    ElMessage.error('获取使用者排行榜失败')
    userRanks.value = []
    userRanksTotal.value = 0
  }
}

// 处理使用者排行榜页码变化
const handleUserRanksPageChange = (val) => {
  userRanksCurrentPage.value = val
  fetchUserLeaderboard()
}

onMounted(fetchLeaderboard)
</script>

<style lang="scss" scoped>
.leaderboard-container {
  padding: 24px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;

    .title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }
  }

  .top-three {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 40px;
    min-height: 300px;

    .rank-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border-radius: 12px;
      position: relative;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .crown {
        position: absolute;
        top: -20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 20px;

        &.gold {
          background: linear-gradient(45deg, #FFD700, #FFA500);
        }

        &.silver {
          background: linear-gradient(45deg, #C0C0C0, #A9A9A9);
        }

        &.bronze {
          background: linear-gradient(45deg, #CD7F32, #8B4513);
        }
      }

      &.first {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: white;
        padding: 30px;
        z-index: 3;
      }

      &.second {
        background: linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%);
        color: white;
        z-index: 2;
      }

      &.third {
        background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
        color: white;
        z-index: 1;
      }

      .avatar {
        margin: 10px 0;
        border: 4px solid rgba(255, 255, 255, 0.3);
      }

      .info {
        text-align: center;
        margin: 10px 0;

        .name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .points {
          font-size: 24px;
          font-weight: bold;
        }
      }

      .details {
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }

  .rank-list {
    .rank-item {
      display: flex;
      align-items: center;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 10px;
      transition: all 0.3s ease;
      background: var(--el-bg-color);

      &:hover {
        transform: translateX(5px);
        background: var(--el-color-primary-light-9);
      }

      &.highlight {
        background: var(--el-color-primary-light-8);
      }

      .rank {
        width: 40px;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
      }

      .avatar {
        margin-right: 20px;
      }

      .info {
        flex: 1;

        .name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .details {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      .points {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }

  .my-ranks {
    margin-top: 40px;
    padding: 20px;

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--el-text-color-primary);
    }

    .ranks-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .my-rank-card {
      background: linear-gradient(135deg, var(--el-color-primary-light-3) 0%, var(--el-color-primary-light-5) 100%);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-4px);
      }

      .rank-badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 12px 20px;
        border-radius: 12px;
        text-align: center;
        backdrop-filter: blur(4px);

        .rank-number {
          font-size: 32px;
          font-weight: bold;
          line-height: 1;
          margin-bottom: 4px;
        }

        .rank-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }

      .user-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 20px;
        margin: 0 40px;

        .avatar {
          border: 4px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.2);
        }

        .info {
          .name {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .details {
            font-size: 14px;
            opacity: 0.9;
          }
        }
      }

      .points-info {
        text-align: center;
        background: rgba(255, 255, 255, 0.2);
        padding: 12px 24px;
        border-radius: 12px;
        backdrop-filter: blur(4px);

        .points-value {
          font-size: 32px;
          font-weight: bold;
          line-height: 1;
          margin-bottom: 4px;
        }

        .points-label {
          font-size: 14px;
          opacity: 0.9;
        }
      }
    }
  }
}

.pagination-list {
  margin-top: 20px;

  .rank-list {
    margin-bottom: 30px;

    .rank-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
        margin-bottom: 20px;
      }

      &.highlight {
        background-color: var(--el-color-primary-light-9);
      }

      .rank {
        width: 40px;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
      }

      .avatar {
        margin-right: 20px;
      }

      .info {
        flex: 1;

        .name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .details {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      .points {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    margin-bottom: 20px;

    :deep(.el-pagination) {
      justify-content: center;
      padding: 0;
      margin: 0;

      .btn-prev,
      .btn-next {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .el-pager li {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);

        &:hover {
          color: var(--el-color-primary);
        }

        &.active {
          background-color: var(--el-color-primary);
          color: white;
        }
      }
    }
  }
}

.my-ranks {
  margin-top: 40px;

  .ranks-container {
    margin-bottom: 30px;
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
    margin-bottom: 20px;
  }
}

.user-ranks {
  margin-top: 40px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0;
    }

    .time-range {
      :deep(.el-radio-group) {
        .el-radio-button__inner {
          padding: 8px 20px;
        }
      }
    }
  }

  .rank-list {
    margin-bottom: 30px;

    .rank-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      &.highlight {
        background-color: var(--el-color-primary-light-9);
      }

      .rank {
        width: 40px;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
      }

      .avatar {
        margin-right: 20px;
      }

      .info {
        flex: 1;

        .name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .details {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }

      .points {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
