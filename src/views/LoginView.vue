<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-text">CRM</div>
        <h1>履德佛堂-蔬食厨房</h1>
        <p>未来佛修炼系统</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    const success = await userStore.login(form.username, form.password)
    if (!success) {
      ElMessage.error('用户名或密码错误')
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    .dark & {
      background: rgba(43, 43, 43, 0.9);
    }
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;

    .logo-text {
      font-size: 48px;
      font-weight: bold;
      color: var(--primary-color);
      margin-bottom: 16px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    }

    h1 {
      font-size: 24px;
      color: var(--text-color);
      margin-bottom: 8px;
    }

    p {
      color: var(--text-color);
      opacity: 0.7;
    }
  }

  .login-form {
    .login-button {
      width: 100%;
      padding: 12px;
      font-size: 16px;
    }
  }
}
</style>
