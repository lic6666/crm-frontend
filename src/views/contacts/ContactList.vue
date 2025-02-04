<template>
  <div class="page-container">
    <div class="app-card">
      <!-- 搜索和操作栏 -->
      <div class="toolbar">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索联系人..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="gradeFilter"
            placeholder="年级"
            clearable
            class="grade-select"
            @change="handleSearch"
          >
            <el-option
              v-for="i in 4"
              :key="i"
              :label="`${i}年级`"
              :value="i"
            />
          </el-select>

          <el-select
            v-model="creatorFilter"
            placeholder="创建人"
            clearable
            filterable
            class="creator-select"
            @change="handleSearch"
          >
            <el-option
              v-for="creator in creators"
              :key="creator"
              :label="creator"
              :value="creator"
            />
          </el-select>

          <el-select
            v-model="tagsFilter"
            placeholder="选择标签"
            style="width: auto; min-width: 150px;"
            multiple
            clearable
            :popper-class="'tag-select-dropdown'"
            @change="handleSearch"
          >
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateShortcuts"
            :unlink-panels="true"
            @change="handleSearch"
          />
        </div>

        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>添加联系人
        </el-button>
      </div>

      <!-- 联系人表格 -->
      <el-table
        v-loading="loading"
        :data="contacts"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="name" label="姓名" sortable="custom" />
        <el-table-column prop="major" label="专业" />
        <el-table-column prop="grade" label="年级" />
        <el-table-column prop="points" label="积分" sortable="custom" width="100">
          <template #default="{ row }">
            <el-tag :type="getPointsTag(row.points)">{{ row.points }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag.id"
              :type="getTagType(tag.type)"
              class="mx-1"
              size="small"
            >
              {{ tag.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="user" label="创建人" width="120" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                @click="handleEdit(row)"
                class="custom-button"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                @click="handleDelete(row)"
                class="custom-button delete-button"
              >
                删除
              </el-button>
            </el-button-group>
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加联系人' : '编辑联系人'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="form.major" />
        </el-form-item>
        <el-form-item label="年级" prop="grade">
          <el-input-number v-model="form.grade" :min="1" :max="12" />
        </el-form-item>
        <el-form-item label="标签" prop="tag_ids">
          <el-select
            v-model="form.tag_ids"
            placeholder="请选择标签"
            style="width: 100%;"
            multiple
            clearable
            :popper-class="'tag-select-dropdown'"
          >
            <el-option
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getContacts, createContact, updateContact, deleteContact, getTags } from '@/api/contacts'

// 数据
const contacts = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const gradeFilter = ref('')
const creatorFilter = ref('')
const dateRange = ref([])
const creators = ref([])
const tags = ref([])
const tagsFilter = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const submitting = ref(false)
const form = ref({
  name: '',
  major: '',
  grade: 1,
  points: 0,
  tag_ids: []
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'blur' }
  ]
}

// 格式化日期為 ISO 字符串
const formatDateToISO = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 日期快捷選項
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [formatDateToISO(start), formatDateToISO(end)]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return [formatDateToISO(start), formatDateToISO(end)]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return [formatDateToISO(start), formatDateToISO(end)]
    }
  },
  {
    text: '今年至今',
    value: () => {
      const end = new Date()
      const start = new Date(new Date().getFullYear(), 0, 1)
      return [formatDateToISO(start), formatDateToISO(end)]
    }
  }
]

// 在过滤条件中添加标签
const filters = ref({
  search: '',
  grade: '',
  user: '',
  tags: [],
  dateRange: null
})

// 获取标签列表
const fetchTags = async () => {
  try {
    console.log('开始获取标签列表...')
    const response = await getTags()
    console.log('获取到的标签数据:', response)
    tags.value = response
    console.log('处理后的标签列表:', tags.value)
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
  }
}

// 获取标签类型对应的样式
const getTagType = (type) => {
  const types = {
    'quest': 'warning',    // 求道 - 黄色
    'meeting': 'danger',   // 开法会 - 红色
    'research': 'success', // 研究班 - 绿色
    'A': 'info',          // A - 蓝色
    'B': 'info',          // B - 蓝色
    'C': 'info'           // C - 蓝色
  }
  return types[type] || 'info'
}

// 获取联系人列表
const fetchContacts = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      ordering: sortOrder.value,
      search: filters.value.search || undefined,
      grade: filters.value.grade || undefined,
      user: filters.value.user || undefined,
      tags: Array.isArray(filters.value.tags) && filters.value.tags.length > 0 ? filters.value.tags.join(',') : undefined,
      created_after: filters.value.dateRange?.[0] || undefined,
      created_before: filters.value.dateRange?.[1] || undefined
    }

    console.log('请求参数:', params)
    const response = await getContacts(params)
    contacts.value = response.results
    total.value = response.count

    if (currentPage.value === 1) {
      updateCreatorsList(response.results)
    }
  } catch (error) {
    console.error('获取联系人列表失败:', error)
    ElMessage.error('获取联系人列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  filters.value = {
    search: searchQuery.value,
    grade: gradeFilter.value,
    user: creatorFilter.value,
    tags: tagsFilter.value,
    dateRange: dateRange.value
  }
  console.log('搜索条件:', filters.value)
  console.log('标签筛选:', tagsFilter.value)
  fetchContacts()
}

// 排序处理
const handleSortChange = ({ prop, order }) => {
  const ordering = order === 'descending' ? `-${prop}` : prop
  sortOrder.value = ordering
  currentPage.value = 1
  fetchContacts()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchContacts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchContacts()
}

// 编辑联系人
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = {
    ...row,
    tag_ids: row.tags?.map(tag => tag.id) || []
  }
  dialogVisible.value = true
}

// 删除联系人
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该联系人吗？', '提示', {
      type: 'warning'
    })
    await deleteContact(row.id)
    ElMessage.success('删除成功')
    fetchContacts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除联系人失败:', error)
      ElMessage.error('删除联系人失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = {
      ...form.value,
      tag_ids: form.value.tag_ids || []
    }

    if (dialogType.value === 'add') {
      await createContact(submitData)
      ElMessage.success('添加成功')
    } else {
      await updateContact(submitData.id, submitData)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    fetchContacts()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}

// 积分标签颜色
const getPointsTag = (points) => {
  if (points >= 100) return 'danger'
  if (points >= 50) return 'warning'
  if (points >= 20) return 'success'
  return 'info'
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 添加联系人
const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    name: '',
    major: '',
    grade: 1,
    points: 0,
    tag_ids: []
  }
  dialogVisible.value = true
}

// 初始化時獲取創建人列表
const initCreators = async () => {
  try {
    const response = await getContacts({
      page: 1,
      page_size: 1000,
      ordering: '-created_at'
    })

    // 初始化創建人列表
    const uniqueCreators = Array.from(new Set(
      response.results
        .map(contact => contact.user)
        .filter(user => user && user.trim() !== '')
    ))
    creators.value = uniqueCreators.sort()
    console.log('初始化創建人列表:', creators.value)
  } catch (error) {
    console.error('獲取創建人列表失敗:', error)
  }
}

// 排序
const sortOrder = ref('-created_at')

// 更新创建者列表
const updateCreatorsList = (contacts) => {
  const uniqueCreators = [...new Set(contacts.map(contact => contact.user))]
  creators.value = uniqueCreators.filter(Boolean).sort()
  console.log('更新创建者列表:', creators.value)
}

onMounted(async () => {
  console.log('组件加载，开始初始化...')
  await fetchTags()  // 先获取标签
  await fetchContacts()  // 再获取联系人列表
  await initCreators()  // 最后初始化创建人列表
})
</script>

<style lang="scss" scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .search-bar {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 12px;
    min-width: 300px;
    align-items: center;

    .el-input {
      width: 200px;
    }

    .el-select {
      &.grade-select {
        width: 100px;
      }

      &.creator-select {
        width: 150px;
      }
    }

    .el-date-picker {
      width: 260px;
    }
  }

  .el-button {
    flex-shrink: 0;
    height: 32px;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
}

:deep(.el-table) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-select) {
  .el-select__tags {
    flex-wrap: wrap;

    .el-tag {
      display: flex;
      align-items: center;
      margin: 2px 4px 2px 0;

      .el-tag__close {
        display: inline-flex !important;
        margin-left: 4px;
      }
    }
  }
}

.tag-select-dropdown {
  .el-select-dropdown__item {
    padding: 0 20px;
  }
}
</style>
