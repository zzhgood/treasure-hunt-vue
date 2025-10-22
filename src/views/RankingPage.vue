<template>
  <div class="ranking-page">
    <div class="page-header">
      <GameButton @click="$router.push('/')" variant="outline" icon="←">
        返回游戏
      </GameButton>
      <h1>玩家排行榜</h1>
      <div class="header-actions">
        <GameButton @click="$router.push('/user')" icon="👤">
          个人中心
        </GameButton>
      </div>
    </div>

    <div class="page-content">
      <UserRanking />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import UserRanking from '../components/user/UserRanking.vue'
import GameButton from '../components/common/GameButton.vue'

const router = useRouter()
</script>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-primary), #1a1f38);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.page-header h1 {
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .header-actions {
    justify-content: center;
  }
}
</style>