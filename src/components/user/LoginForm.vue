<template>
  <div class="login-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ mode === 'login' ? '登录账户' : '注册账户' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            placeholder="请输入用户名"
            :disabled="loading"
          >
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="请输入密码"
            :disabled="loading"
            minlength="6"
          >
        </div>

        <div v-if="mode === 'register'" class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            placeholder="请再次输入密码"
            :disabled="loading"
            minlength="6"
          >
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <GameButton
          type="submit"
          :disabled="loading || !isFormValid"
          class="submit-btn"
          :icon="loading ? '⏳' : '🔑'"
        >
          {{ loading ? '处理中...' : (mode === 'login' ? '登录' : '注册') }}
        </GameButton>

        <div class="form-footer">
          <template v-if="mode === 'login'">
            还没有账户？
            <button type="button" class="link-btn" @click="switchMode('register')">
              立即注册
            </button>
          </template>
          <template v-else>
            已有账户？
            <button type="button" class="link-btn" @click="switchMode('login')">
              立即登录
            </button>
          </template>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import GameButton from '../common/GameButton.vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
})

const emit = defineEmits(['success', 'close'])

const loading = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const isFormValid = computed(() => {
  if (props.mode === 'login') {
    return form.username.trim() && form.password.length >= 6
  } else {
    return (
      form.username.trim() &&
      form.password.length >= 6 &&
      form.password === form.confirmPassword
    )
  }
})

const switchMode = (newMode) => {
  // 重置表单和错误
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  error.value = ''
  
  // 在实际实现中，这里会通过父组件切换模式
  // 这里简化处理，直接重新渲染
  if (newMode !== props.mode) {
    // 通过父组件重新渲染
    emit('close')
    // 在实际应用中，应该通过父组件控制模式切换
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 简单的验证逻辑
    if (props.mode === 'register') {
      // 检查用户名是否已存在（模拟）
      const existingUsers = JSON.parse(localStorage.getItem('treasureUsers') || '[]')
      if (existingUsers.some(user => user.username === form.username)) {
        throw new Error('用户名已存在')
      }

      // 创建新用户
      const newUser = {
        id: Date.now().toString(),
        username: form.username,
        password: form.password, // 注意：实际应用中应该加密
        createdAt: new Date().toISOString()
      }

      existingUsers.push(newUser)
      localStorage.setItem('treasureUsers', JSON.stringify(existingUsers))
      
      emit('success', {
        id: newUser.id,
        name: newUser.username,
        level: 1,
        experience: 0,
        hp: 3,
        coins: 0
      })
    } else {
      // 登录逻辑
      const existingUsers = JSON.parse(localStorage.getItem('treasureUsers') || '[]')
      const user = existingUsers.find(u => 
        u.username === form.username && u.password === form.password
      )

      if (!user) {
        throw new Error('用户名或密码错误')
      }

      emit('success', {
        id: user.id,
        name: user.username,
        level: 1,
        experience: 0,
        hp: 3,
        coins: 0
      })
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 10, 26, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(15, 23, 52, 0.95);
  border-radius: 12px;
  border: 1px solid var(--border);
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.login-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(59, 115, 255, 0.2);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: rgba(255, 123, 150, 0.1);
  border: 1px solid rgba(255, 123, 150, 0.3);
  color: var(--error);
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  margin-bottom: 20px;
}

.form-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
}

.link-btn:hover {
  color: var(--accent-secondary);
}
</style>