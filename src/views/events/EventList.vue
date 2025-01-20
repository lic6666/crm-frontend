<template>
  <div class="page-container">
    <div class="app-card">
      <!-- 搜索和操作栏 -->
      <div class="toolbar">
        <div class="search-bar">
          <el-date-picker
            v-model="filters.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="fetchEvents"
          />

          <el-select
            v-model="filters.type"
            placeholder="活动类型"
            clearable
            @change="fetchEvents"
          >
            <el-option
              v-for="type in eventTypes"
              :key="type.value"
              v-bind="type"
            />
          </el-select>
        </div>

        <el-button v-if="isAdmin" type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>创建活动
        </el-button>
      </div>

      <!-- 活动列表 -->
      <el-table
        v-loading="loading"
        :data="events"
        style="width: 100%"
      >
        <el-table-column prop="name" label="活动名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getEventTypeTag(row.type)">
              {{ getEventTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participant_count" label="参与人数" width="100" align="center" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" link @click="handleViewParticipants(row)">
                查看参与者
              </el-button>
              <el-button type="success" link @click="handleAddParticipant(row)">
                添加参与者
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 创建活动对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="创建活动"
      width="500px"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
      >
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="createForm.name" />
        </el-form-item>
        <el-form-item label="活动日期" prop="date">
          <el-date-picker
            v-model="createForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="活动类型" prop="type">
          <el-select v-model="createForm.type" placeholder="选择类型">
            <el-option
              v-for="type in eventTypes"
              :key="type.value"
              v-bind="type"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleCreateSubmit"
          :loading="submitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 参与者对话框 -->
    <el-dialog
      v-model="participantsDialogVisible"
      :title="'参与者列表 - ' + currentEvent?.name"
      width="800px"
    >
      <el-table :data="participants" style="width: 100%">
        <el-table-column prop="contact.name" label="姓名" />
        <el-table-column prop="contact.points" label="总积分" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="primary" effect="dark" class="points-tag">
              {{ row.contact.points }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="获得积分" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success">+{{ row.points }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="记录人" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              link
              @click="handleRemoveParticipant(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 添加参与者对话框 -->
    <el-dialog
      v-model="addParticipantDialogVisible"
      title="添加参与者"
      width="500px"
    >
      <el-form
        ref="participantFormRef"
        :model="participantForm"
        :rules="participantRules"
        label-width="80px"
      >
        <el-form-item label="联系人" prop="contact_id">
          <el-select
            v-model="participantForm.contact_id"
            placeholder="搜索联系人"
            filterable
            remote
            :remote-method="searchContacts"
            :loading="contactsLoading"
            clearable
            :filter-method="() => true"
            :debounce="300"
          >
            <el-option
              v-for="item in contactOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div class="contact-option">
                <span>{{ item.name }}</span>
                <span class="contact-info">
                  {{ item.major }} - {{ item.grade }}年级
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="积分" prop="points">
          <el-input-number
            v-model="participantForm.points"
            :min="0"
            placeholder="不填则使用默认分数"
          />
          <div class="points-tip">
            默认分数：吃饭1分、活动2分、求道10分、法会20分
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addParticipantDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleAddParticipantSubmit"
          :loading="submitting"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getEvents,
  createEvent,
  deleteEvent,
  addParticipant,
  removeParticipant
} from '@/api/events'
import { getContacts } from '@/api/contacts'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => {
  const currentUser = userStore.user
  console.log('当前用户信息:', currentUser)

  // 检查用户权限：
  // 1. 是否是管理员角色 (role === 'admin')
  // 2. 是否有staff权限 (is_staff === true)
  const hasAdminPrivilege =
    currentUser?.role === 'admin' ||
    currentUser?.is_staff === true

  console.log('管理员判断条件:', {
    role: currentUser?.role,
    is_staff: currentUser?.is_staff,
    isAdmin: hasAdminPrivilege
  })

  return hasAdminPrivilege
})

// 常量
const eventTypes = [
  { label: '吃饭', value: 'meal' },
  { label: '活动', value: 'activity' },
  { label: '求道', value: 'quest' },
  { label: '法会', value: 'meeting' }
]

// 数据
const events = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const filters = reactive({
  date: '',
  type: ''
})

// 创建活动
const createDialogVisible = ref(false)
const createFormRef = ref(null)
const submitting = ref(false)
const createForm = reactive({
  name: '',
  date: '',
  type: ''
})

const createRules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择活动日期', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ]
}

// 参与者管理
const participantsDialogVisible = ref(false)
const currentEvent = ref(null)
const participants = ref([])

// 添加参与者
const addParticipantDialogVisible = ref(false)
const participantFormRef = ref(null)
const contactsLoading = ref(false)
const contactOptions = ref([])
const participantForm = reactive({
  contact_id: null,
  points: null
})

const participantRules = {
  contact_id: [
    { required: true, message: '请选择联系人', trigger: 'change' }
  ]
}

// 获取活动列表
const fetchEvents = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      ...filters
    }
    const { results, count } = await getEvents(params)
    events.value = results
    total.value = count
  } catch (error) {
    console.error('获取活动列表失败:', error)
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchEvents()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchEvents()
}

// 创建活动
const handleAdd = () => {
  createForm.name = ''
  createForm.date = ''
  createForm.type = ''
  createDialogVisible.value = true
}

const handleCreateSubmit = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
    submitting.value = true
    await createEvent(createForm)
    ElMessage.success('创建成功')
    createDialogVisible.value = false
    fetchEvents()
  } catch (error) {
    console.error('创建活动失败:', error)
    ElMessage.error('创建活动失败')
  } finally {
    submitting.value = false
  }
}

// 删除活动
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该活动吗？', '提示', {
      type: 'warning'
    })
    await deleteEvent(row.id)
    ElMessage.success('删除成功')
    fetchEvents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除活动失败:', error)
      ElMessage.error('删除活动失败')
    }
  }
}

// 查看参与者
const handleViewParticipants = (row) => {
  currentEvent.value = row
  participants.value = row.participants || []
  participantsDialogVisible.value = true
}

// 添加参与者
const handleAddParticipant = async (row) => {
  currentEvent.value = row
  participantForm.contact_id = null
  participantForm.points = null
  addParticipantDialogVisible.value = true

  // 初始加载一些联系人
  try {
    const { results } = await getContacts({
      page: 1,
      page_size: 20,
      ordering: '-created_at'  // 按创建时间倒序
    })
    contactOptions.value = results
  } catch (error) {
    console.error('获取联系人列表失败:', error)
  }
}

const searchContacts = async (query) => {
  if (query !== '') {
    contactsLoading.value = true
    try {
      const { results } = await getContacts({
        search: query,
        page_size: 20  // 增加返回数量
      })
      contactOptions.value = results
    } catch (error) {
      console.error('搜索联系人失败:', error)
      ElMessage.error('搜索联系人失败')
    } finally {
      contactsLoading.value = false
    }
  }
}

const handleAddParticipantSubmit = async () => {
  if (!participantFormRef.value) return

  try {
    await participantFormRef.value.validate()
    submitting.value = true
    console.log('发送数据:', {
      eventId: currentEvent.value.id,
      participantForm: participantForm
    })
    const response = await addParticipant(currentEvent.value.id, participantForm)
    ElMessage.success('添加成功')
    addParticipantDialogVisible.value = false

    // 更新用戶信息
    if (response.user_info) {
      const userInfo = {
        ...userStore.user,
        points: response.user_info.points,
        level: response.user_info.level,
        level_name: response.user_info.level_name,
        level_description: response.user_info.level_description
      }
      // 更新 store 中的用戶信息
      userStore.updateUserInfo(userInfo)
    }

    fetchEvents()
  } catch (error) {
    console.error('添加参与者失败:', error)
    ElMessage.error('添加参与者失败')
  } finally {
    submitting.value = false
  }
}

// 移除参与者
const handleRemoveParticipant = async (row) => {
  try {
    await ElMessageBox.confirm('确定要移除该参与者吗？', '提示', {
      type: 'warning'
    })
    await removeParticipant(currentEvent.value.id, { contact_id: row.contact.id })
    ElMessage.success('移除成功')
    participants.value = participants.value.filter(p => p.contact.id !== row.contact.id)
    fetchEvents()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除参与者失败:', error)
      ElMessage.error('移除参与者失败')
    }
  }
}

// 工具函数
const getEventTypeName = (type) => {
  const found = eventTypes.find(t => t.value === type)
  return found ? found.label : type
}

const getEventTypeTag = (type) => {
  const types = {
    meal: 'info',
    activity: 'success',
    quest: 'warning',
    meeting: 'danger'
  }
  return types[type] || 'info'
}

// 初始化
fetchEvents()
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  .search-bar {
    display: flex;
    gap: 16px;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tag) {
  text-transform: capitalize;
}

.points-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.contact-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .contact-info {
    font-size: 12px;
    color: #909399;
  }
}

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;

  .el-button {
    padding: 4px 8px;
    margin: 0;
  }
}

.points-tag {
  width: 60px;
  text-align: center;
  font-weight: bold;
}
</style>
