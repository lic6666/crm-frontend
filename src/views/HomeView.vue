<template>
  <div class="home-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="8">
        <div class="stat-card" @click="handleCardClick('contacts')">
          <el-icon class="icon"><UserFilled /></el-icon>
          <div class="content">
            <div class="value">{{ stats.total_contacts }}</div>
            <div class="label">联系人总数</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8">
        <div class="stat-card" @click="handleCardClick('events')">
          <el-icon class="icon"><Calendar /></el-icon>
          <div class="content">
            <div class="value">{{ stats.monthly_activities }}</div>
            <div class="label">本月活动</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="8">
        <div class="stat-card" @click="handleCardClick('today')">
          <el-icon class="icon"><Timer /></el-icon>
          <div class="content">
            <div class="value">{{ stats.today_activities }}</div>
            <div class="label">今日活动</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 个人信息卡片 -->
    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :lg="8">
        <div class="app-card">
          <div class="card-header">
            <h3>个人信息</h3>
            <el-button type="primary" text @click="showEditDialog">
              编辑
            </el-button>
          </div>

          <div class="user-profile">
            <div class="avatar-section">
              <el-avatar :size="80" class="avatar">
                {{ userStore.user?.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="user-role">
                <el-tag :type="userStore.user?.is_staff ? 'danger' : 'info'" class="role-tag">
                  {{ userStore.user?.is_staff ? '管理员' : '普通用户' }}
                </el-tag>
              </div>
            </div>

            <!-- 修行等级信息 -->
            <div class="level-info" @click="showLevelDetails" :class="{ 'hover-effect': true }">
              <div class="level-title">{{ getCurrentLevelName(userStore.user?.points || 0) }}</div>
              <div class="level-points">{{ userStore.user?.points || 0 }} 积分</div>
              <el-progress
                :percentage="calculateLevelProgress(userStore.user?.points || 0)"
                :format="(percentage) => `${Math.floor(percentage)}%`"
                :stroke-width="8"
                color="#409EFF"
              />
              <div class="level-description">
                {{ getCurrentLevelDescription(userStore.user?.points || 0) }}
              </div>
            </div>

            <!-- 等级说明弹窗 -->
            <el-dialog
              v-model="levelDialogVisible"
              title="修行者等级说明"
              width="500px"
              class="level-dialog"
              :modal-class="'level-dialog-modal'"
            >
              <div class="level-details">
                <!-- 当前等级信息 -->
                <div class="current-level">
                  <div class="level-header">
                    <span class="level-name">当前等级：{{ getCurrentLevelName(userStore.user?.points || 0) }}</span>
                    <span class="level-points">{{ userStore.user?.points || 0 }} 积分</span>
                  </div>
                  <div class="progress-section">
                    <el-progress
                      :percentage="calculateLevelProgress(userStore.user?.points || 0)"
                      :format="(percentage) => `${Math.floor(percentage)}%`"
                      :stroke-width="12"
                      color="#409EFF"
                    />
                  </div>
                </div>

                <!-- 所有等级说明 -->
                <div class="level-list">
                  <div class="level-item" v-for="(level, index) in levelConfig" :key="index">
                    <div class="level-info">
                      <span class="name">{{ level.name }}</span>
                      <span class="points">{{ level.points }}分</span>
                    </div>
                    <div class="description">{{ level.description }}</div>
                  </div>
                </div>
              </div>
            </el-dialog>

            <div class="info-section">
              <div class="info-item">
                <div class="label">用户名</div>
                <div class="value">{{ userStore.user?.username || '未设置' }}</div>
              </div>
              <div class="info-item">
                <div class="label">邮箱</div>
                <div class="value">{{ userStore.user?.email || '未设置' }}</div>
              </div>
              <div class="info-item">
                <div class="label">角色</div>
                <div class="value">{{ userStore.user?.role || '普通用户' }}</div>
              </div>
              <div class="info-item">
                <div class="label">加入时间</div>
                <div class="value">{{ formatDate(userStore.user?.created_at) }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 最近活动 -->
      <el-col :xs="24" :lg="16">
        <div class="app-card">
          <div class="card-header">
            <h3>最近活动</h3>
            <el-button type="primary" text @click="router.push('/events')">
              查看全部
            </el-button>
          </div>

          <el-table v-if="recentEvents.length" :data="recentEvents" style="width: 100%">
            <el-table-column prop="name" label="活动名称" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getEventTypeTag(row.type)">
                  {{ getEventTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="participant_count" label="参与人数" width="100" />
            <el-table-column prop="user" label="创建人" width="120" />
          </el-table>
          <el-empty v-else description="暂无活动" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :xs="24" :lg="8">
        <div class="app-card">
          <div class="card-header">
            <h3>联系人积分排行</h3>
            <el-button type="primary" text @click="router.push('/leaderboard')">
              查看全部
            </el-button>
          </div>

          <div v-if="leaderboard.length" class="leaderboard-list">
            <div
              v-for="(item, index) in leaderboard"
              :key="item.id"
              class="leaderboard-item"
            >
              <div class="rank" :class="'rank-' + (index + 1)">
                {{ index + 1 }}
              </div>
              <el-avatar :size="40">{{ item.name.charAt(0) }}</el-avatar>
              <div class="info">
                <div class="name">{{ item.name }}</div>
                <div class="details">
                  <span>{{ item.points }} 积分</span>
                  <el-divider direction="vertical" />
                  <span>{{ item.major }} - {{ item.grade }}年级</span>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </div>
      </el-col>

      <el-col :xs="24" :lg="16">
        <div class="app-card">
          <div class="card-header">
            <h3>使用者积分排行榜</h3>
            <el-select
              v-model="timeRange"
              size="small"
              style="width: 100px"
              @change="fetchLeaderboard"
            >
              <el-option
                v-for="option in timeRangeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>

          <div class="leaderboard-list">
            <div
              v-for="(user, index) in leaderboardData.results"
              :key="user.id"
              class="leaderboard-item"
              :class="{ 'is-current': user.id === userStore.user?.id }"
            >
              <div class="rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</div>
              <el-avatar class="user-avatar">{{ user.username.charAt(0) }}</el-avatar>
              <div class="user-info">
                <div class="name">{{ user.username }}</div>
                <div class="details">
                  <span>{{ user.points }}积分</span>
                  <el-divider direction="vertical" />
                  <el-tooltip
                    :content="user.level_description"
                    placement="top"
                    :show-after="200"
                  >
                    <span>{{ user.level_name }} ({{ user.level_points_range }})</span>
                  </el-tooltip>
                </div>
              </div>
            </div>

            <!-- 显示当前用户排名(如果不在前5名) -->
            <template v-if="leaderboardData.my_rank && !leaderboardData.results.find(u => u.id === userStore.user?.id)">
              <div class="rank-divider"></div>
              <div class="leaderboard-item is-current">
                <div class="rank">{{ leaderboardData.my_rank.rank }}</div>
                <el-avatar class="user-avatar">{{ leaderboardData.my_rank.username.charAt(0) }}</el-avatar>
                <div class="user-info">
                  <div class="name">{{ leaderboardData.my_rank.username }}</div>
                  <div class="details">
                    <span>{{ leaderboardData.my_rank.points }}积分</span>
                    <el-divider direction="vertical" />
                    <el-tooltip
                      :content="leaderboardData.my_rank.level_description"
                      placement="top"
                      :show-after="200"
                    >
                      <span>{{ leaderboardData.my_rank.level_name }} ({{ leaderboardData.my_rank.level_points_range }})</span>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="65%"
      destroy-on-close
      class="custom-dialog"
    >
      <template v-if="dialogData.length">
        <!-- 联系人列表 -->
        <el-table
          v-if="dialogTitle === '我创建的联系人'"
          :data="dialogData"
          style="width: 100%"
        >
          <el-table-column prop="name" label="姓名" sortable />
          <el-table-column prop="major" label="专业" sortable />
          <el-table-column prop="grade" label="年级" width="100" align="center" sortable />
          <el-table-column prop="points" label="积分" width="100" align="center" sortable />
          <el-table-column label="创建时间" min-width="120" align="center" sortable>
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default>
              <el-button type="primary" link @click="router.push('/contacts')">编辑</el-button>
              <el-button type="danger" link @click="router.push('/contacts')">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 活动列表 -->
        <el-table
          v-else
          :data="dialogData"
          style="width: 100%"
        >
          <el-table-column prop="name" label="活动名称" min-width="150" sortable />
          <el-table-column label="日期" width="120" align="center" sortable>
            <template #default="{ row }">
              {{ formatDate(row.date) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getEventTypeTag(row.type)" effect="plain">
                {{ getEventTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="participant_count" label="参与人数" width="100" align="center" sortable />
          <el-table-column prop="user" label="创建人" width="120" align="center" />
        </el-table>
      </template>
      <el-empty v-else description="暂无数据" />
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
      destroy-on-close
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="修改用户名" name="username">
          <el-form
            ref="usernameFormRef"
            :model="usernameForm"
            :rules="usernameRules"
            label-width="100px"
          >
            <el-form-item label="新用户名" prop="username">
              <el-input v-model="usernameForm.username" placeholder="请输入新用户名" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
          >
            <el-form-item label="原密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                placeholder="请输入原密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                show-password
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="activeTab === 'username' ? handleChangeUsername() : handleChangePassword()"
            :loading="submitting"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserFilled, Calendar, Timer } from '@element-plus/icons-vue'
import { getEvents } from '@/api/events'
import { getLeaderboard, getStats, getContacts } from '@/api/contacts'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getUserInfo } from '@/api/auth'
import { changeUsername, changePassword } from '@/api/user'
import { getUserLeaderboard } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const stats = ref({
  total_contacts: 0,
  monthly_activities: 0,
  today_activities: 0
})

const recentEvents = ref([])
const leaderboard = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogData = ref([])

const editDialogVisible = ref(false)
const activeTab = ref('username')
const submitting = ref(false)

const usernameFormRef = ref(null)
const usernameForm = ref({
  username: ''
})
const usernameRules = {
  username: [
    { required: true, message: '请输入新用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在 3 到 20 个字符之间', trigger: 'blur' }
  ]
}

const passwordFormRef = ref(null)
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于 6 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const leaderboardData = ref({
  results: [],
  my_rank: null,
  total_users: 0
})

const timeRange = ref('all')
const timeRangeOptions = [
  { label: '全部', value: 'all' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '今年', value: 'year' }
]

const getEventTypeTag = (type) => {
  const types = {
    meal: 'info',
    activity: 'success',
    quest: 'warning',
    meeting: 'danger'
  }
  return types[type] || 'info'
}

const getEventTypeName = (type) => {
  const types = {
    meal: '吃饭',
    activity: '活动',
    quest: '求道',
    meeting: '法会'
  }
  return types[type] || type
}

const fetchData = async () => {
  try {
    // 获取今天的日期（使用本地时区）
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    console.log('今天日期:', todayStr)

    // 获取统计数据
    const statsData = await getStats({
      today: todayStr  // 传递今天的日期给后端
    })
    console.log('获取到的统计数据:', statsData)
    stats.value = {
      total_contacts: statsData.total_contacts || 0,
      monthly_activities: statsData.monthly_activities || 0,
      today_activities: statsData.today_activities || 0
    }

    // 获取最近活动
    const eventsData = await getEvents({ page: 1, page_size: 10, ordering: '-date' })
    console.log('获取到的活动数据:', eventsData)
    recentEvents.value = eventsData.results?.map(event => ({
      ...event,
      user: event.user || '未知'
    })) || []

    console.log('处理后的活动数据:', recentEvents.value)

    // 获取排行榜
    const contactLeaderboardData = await getLeaderboard({ limit: 5 })
    leaderboard.value = (contactLeaderboardData.results || []).slice(0, 5)
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
  }
}

// 处理卡片点击
const handleCardClick = async (type) => {
  try {
    const data = await fetchDetailData(type)
    if (data) {
      dialogTitle.value = data.title
      dialogData.value = data.data
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取详细数据失败:', error)
    ElMessage.error('获取详细数据失败')
  }
}

// 获取详细数据
const fetchDetailData = async (type) => {
  try {
    let data = null
    const currentUser = userStore.user
    console.log('当前用户:', currentUser)

    // 获取今天的日期（使用本地时区）
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    console.log('今天日期:', todayStr)

    switch(type) {
      case 'contacts': {
        // 获取联系人列表，然后在前端筛选
        const contactsData = await getContacts({
          page: 1,
          page_size: 10,
          ordering: '-created_at'
        })
        console.log('获取到的联系人数据:', contactsData)

        // 在前端筛选当前用户创建的联系人
        const filteredContacts = contactsData.results?.filter(
          contact => contact.user === currentUser?.username
        ) || []

        data = {
          title: '我创建的联系人',
          type: 'contacts',
          data: filteredContacts
        }
        break
      }
      case 'events': {
        const eventsData = await getEvents({
          page: 1,
          page_size: 10,
          ordering: '-date'
        })
        data = {
          title: '活动列表',
          type: 'events',
          data: eventsData.results?.map(event => ({
            ...event,
            user: event.user || '未知'
          })) || []
        }
        break
      }
      case 'today': {
        const todayEvents = await getEvents({
          page: 1,
          page_size: 10,
          date: todayStr,
          ordering: '-date'
        })
        console.log('获取到的今日活动:', todayEvents)
        data = {
          title: '今日活动列表',
          type: 'today',
          data: todayEvents.results?.map(event => ({
            ...event,
            user: event.user || '未知'
          })) || []
        }
        break
      }
    }

    return data
  } catch (error) {
    console.error('获取详细数据失败:', error)
    throw error
  }
}

// 获取当前等级的最高分数
const getCurrentLevelMaxPoints = (points) => {
  if (points >= 500) return 500
  if (points >= 200) return 500
  if (points >= 110) return 200
  if (points >= 50) return 110
  return 50
}

// 计算等级进度百分比
const calculateLevelProgress = (points) => {
  const maxPoints = getCurrentLevelMaxPoints(points)
  return Math.floor((points / maxPoints) * 100)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取最新的用户信息
const updateUserInfo = async () => {
  try {
    const response = await getUserInfo()
    console.log('获取到的用户信息:', response)
    if (response) {
      const userInfo = {
        ...userStore.user,
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role,
        is_staff: response.is_staff,
        points: response.points,
        level: response.level,
        level_name: response.level_name,
        level_description: response.level_description,
        created_at: response.created_at,
        updated_at: response.updated_at
      }
      userStore.updateUserInfo(userInfo)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 显示编辑对话框
const showEditDialog = () => {
  editDialogVisible.value = true
  usernameForm.value.username = userStore.user?.username || ''
}

// 修改用户名
const handleChangeUsername = async () => {
  if (!usernameFormRef.value) return

  await usernameFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await changeUsername(usernameForm.value.username)
        ElMessage.success('用户名修改成功')
        await userStore.updateUserInfo()
        editDialogVisible.value = false
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '修改失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await changePassword(passwordForm.value)
        ElMessage.success('密码修改成功，请重新登录')
        userStore.logout()
        router.push('/login')
      } catch (error) {
        ElMessage.error(error.response?.data?.error || '修改失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 获取排行榜数据
const fetchLeaderboard = async () => {
  try {
    const response = await getUserLeaderboard({
      time_range: timeRange.value,
      limit: 5
    })
    leaderboardData.value = response
  } catch (error) {
    console.error('获取排行榜失败:', error)
  }
}

// 等级系统相关
const levelDialogVisible = ref(false)
const levelConfig = [
  {
    name: '初心者',
    points: '0-50',
    description: '剛開始修行，對佛法有所興趣但理解尚淺，處於學習和嘗試階段。'
  },
  {
    name: '修行者',
    points: '50-110',
    description: '已進入修行之路，專注於戒律、禪修和智慧的培養，目標是提升內在修養。'
  },
  {
    name: '實踐者',
    points: '110-200',
    description: '修行有一定成就，能夠平衡內心，開始幫助他人並傳播佛法。'
  },
  {
    name: '覺悟者',
    points: '200-500',
    description: '達到初步覺悟的境界，斷除了部分煩惱，具備清淨的智慧和慈悲心。'
  },
  {
    name: '大覺者',
    points: '500+',
    description: '修行圓滿，徹底覺悟，心境安寧無礙，具備引導眾生脫離苦難的能力。'
  }
]

// 获取当前等级名称
const getCurrentLevelName = (points) => {
  if (points >= 500) return '大覺者'
  if (points >= 200) return '覺悟者'
  if (points >= 110) return '實踐者'
  if (points >= 50) return '修行者'
  return '初心者'
}

// 获取当前等级描述
const getCurrentLevelDescription = (points) => {
  if (points >= 500) return levelConfig[4].description
  if (points >= 200) return levelConfig[3].description
  if (points >= 110) return levelConfig[2].description
  if (points >= 50) return levelConfig[1].description
  return levelConfig[0].description
}

// 获取下一等级所需积分
const getNextLevelPoints = (points) => {
  if (points >= 500) return 500
  if (points >= 200) return 500 - 200
  if (points >= 110) return 200 - 110
  if (points >= 50) return 110 - 50
  return 50
}

// 显示等级详情
const showLevelDetails = () => {
  levelDialogVisible.value = true
}

onMounted(async () => {
  try {
    await Promise.all([
      updateUserInfo(),
      fetchData(),
      fetchLeaderboard()
    ])
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('获取数据失败')
  }
})
</script>

<style lang="scss" scoped>
.home-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.stat-card {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, #66b1ff 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow);
  }

  &:active {
    transform: translateY(0);
  }

  .icon {
    font-size: 48px;
    opacity: 0.8;
  }

  .content {
    flex: 1;

    .value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
    }

    .label {
      font-size: 14px;
      opacity: 0.8;
      margin-top: 4px;
    }
  }
}

.app-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: var(--el-text-color-primary);
  }
}

.leaderboard-list {
  padding: 0 20px;

  .leaderboard-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    &.is-current {
      background-color: var(--el-color-primary-light-9);
      margin: 0 -20px;
      padding: 12px 20px;
    }

    .rank {
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;
      margin-right: 12px;
      font-size: 14px;
      font-weight: bold;

      &.rank-1 { background-color: #FFD700; color: white; }
      &.rank-2 { background-color: #C0C0C0; color: white; }
      &.rank-3 { background-color: #CD7F32; color: white; }
    }

    .user-avatar {
      margin-right: 12px;
      background: var(--el-color-primary);
      color: white;
    }

    .user-info {
      flex: 1;

      .name {
        font-size: 14px;
        color: var(--el-text-color-primary);
        font-weight: 500;
        margin-bottom: 4px;
      }

      .details {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        display: flex;
        align-items: center;
        gap: 8px;

        span:last-child {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: help;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .rank-divider {
    height: 1px;
    background-color: var(--el-border-color-lighter);
    margin: 8px -20px;
  }
}

.custom-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-bg-color);

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-table) {
    --el-table-border-color: var(--el-border-color-lighter);
    --el-table-header-bg-color: var(--el-bg-color);
    --el-table-row-hover-bg-color: var(--el-fill-color-light);
  }
}

.user-profile {
  padding: 20px 0;

  .avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;

    .avatar {
      margin-bottom: 16px;
      border: 4px solid var(--el-color-primary-light-8);
      background: linear-gradient(135deg, var(--el-color-primary) 0%, #66b1ff 100%);
      color: white;
      font-size: 32px;
      font-weight: bold;
    }

    .user-role {
      .role-tag {
        font-size: 12px;
        padding: 0 12px;
        height: 24px;
        line-height: 24px;
      }
    }
  }

  .level-section {
    background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-9) 100%);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;

    .level-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .level-name {
        font-size: 20px;
        font-weight: bold;
        color: var(--el-color-primary);
      }

      .level-points {
        font-size: 16px;
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }

    .level-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .level-progress {
      :deep(.el-progress-bar__outer) {
        background-color: var(--el-color-primary-light-8);
      }

      :deep(.el-progress-bar__inner) {
        background: linear-gradient(90deg, var(--el-color-primary) 0%, #66b1ff 100%);
      }
    }
  }

  .info-section {
    .info-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .label {
        width: 80px;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }

      .value {
        flex: 1;
        color: var(--el-text-color-primary);
        font-weight: 500;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.level-info {
  background-color: var(--el-color-primary-light-9);
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.hover-effect:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .level-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-color-primary);
    margin-bottom: 8px;
  }

  .level-points {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .level-description {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-top: 12px;
    line-height: 1.5;
  }
}

.level-dialog {
  :deep(.el-dialog__body) {
    padding: 24px;
  }

  .level-details {
    .current-level {
      background-color: var(--el-color-primary-light-9);
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 24px;

      .level-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .level-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-color-primary);
        }

        .level-points {
          font-size: 20px;
          font-weight: bold;
        }
      }
    }

    .level-list {
      .level-item {
        padding: 16px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:last-child {
          border-bottom: none;
        }

        .level-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .name {
            font-size: 16px;
            font-weight: 500;
            color: var(--el-color-primary);
          }

          .points {
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }
        }

        .description {
          font-size: 14px;
          color: var(--el-text-color-regular);
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
