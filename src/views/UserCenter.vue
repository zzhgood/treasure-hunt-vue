<template>
  <div class="user-center">
    <div class="center-header">
      <GameButton @click="$router.push('/')" variant="outline" icon="←">
        返回游戏
      </GameButton>
      <h1>用户中心</h1>
      <div class="header-actions">
        <GameButton @click="$router.push('/ranking')" icon="🏆">
          查看排行榜
        </GameButton>
      </div>
    </div>

    <div class="center-content">
      <UserProfile />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import UserProfile from '../components/user/UserProfile.vue'
import GameButton from '../components/common/GameButton.vue'

const router = useRouter()
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), #1a1f38);
  padding: 20px;
}

.center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.center-header h1 {
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.center-content {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .center-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>