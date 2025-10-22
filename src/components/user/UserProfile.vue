<template>
  <div class="user-profile">
    <div class="profile-header">
      <h2>👤 个人中心</h2>
      <div v-if="!isLoggedIn" class="auth-buttons">
        <GameButton @click="showLogin = true" icon="🔑">
          登录
        </GameButton>
        <GameButton @click="showRegister = true" variant="outline" icon="📝">
          注册
        </GameButton>
      </div>
    </div>

    <div v-if="isLoggedIn" class="profile-content">
      <div class="user-info-card">
        <div class="avatar-section">
          <div class="user-avatar">
            {{ getAvatarEmoji(player.name) }}
          </div>
          <div class="user-details">
            <h3>{{ player.name }}</h3>
            <p>等级 {{ player.level }} 探险家</p>
            <div class="user-stats">
              <span>🏆 排名 #{{ playerRank }}</span>
              <span>⭐ 经验 {{ player.experience }}</span>
            </div>
          </div>
        </div>

        <div class="progress-section">
          <h4>升级进度</h4>
          <div class="level-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: levelProgress + '%' }"
              ></div>
            </div>
            <span class="progress-text">
              {{ player.experience }}/{{ expNeeded }} EXP
            </span>
          </div>
        </div>

        <div class="achievements-section">
          <h4>🏅 成就</h4>
          <div class="achievements-grid">
            <div 
              v-for="achievement in achievements" 
              :key="achievement.id"
              class="achievement-item"
              :class="{ unlocked: achievement.unlocked }"
            >
              <div class="achievement-icon">
                {{ achievement.icon }}
              </div>
              <div class="achievement-info">
                <div class="achievement-name">{{ achievement.name }}</div>
                <div class="achievement-desc">{{ achievement.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <GameButton @click="logout" variant="outline" icon="🚪">
          退出登录
        </GameButton>
        <GameButton @click="resetProgress" variant="danger" icon="🔄">
          重置进度
        </GameButton>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <div v-if="showLogin" class="modal-overlay">
      <LoginForm 
        mode="login"
        @success="handleLoginSuccess"
        @close="showLogin = false"
      />
    </div>

    <!-- 注册弹窗 -->
    <div v-if="showRegister" class="modal-overlay">
      <LoginForm 
        mode="register"
        @success="handleRegisterSuccess"
        @close="showRegister = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '../../store/gameStore'
import LoginForm from './LoginForm.vue'
import GameButton from '../common/GameButton.vue'

const gameStore = useGameStore()

const showLogin = ref(false)
const showRegister = ref(false)

const isLoggedIn = computed(() => gameStore.isLoggedIn)
const player = computed(() => gameStore.player)
const playerRank = computed(() => gameStore.playerRank)

const expNeeded = computed(() => player.value.level * 100)
const levelProgress = computed(() => (player.value.experience / expNeeded.value) * 100)

const achievements = computed(() => [
  {
    id: 1,
    name: '初次探险',
    description: '完成第一个地点探索',
    icon: '🎯',
    unlocked: gameStore.gameState.completedLocations.length >= 1
  },
  {
    id: 2,
    name: '碎片收集者',
    description: '收集所有地图碎片',
    icon: '🧩',
    unlocked: gameStore.collectedFragments >= 3
  },
  {
    id: 3,
    name: '资深探险家',
    description: '达到5级',
    icon: '⭐',
    unlocked: player.value.level >= 5
  },
  {
    id: 4,
    name: '财富积累',
    description: '积累500金币',
    icon: '💰',
    unlocked: player.value.coins >= 500
  }
])

const getAvatarEmoji = (name) => {
  if (!name) return '👤'
  const emojis = ['🦁', '🐯', '🐻', '🐼', '🐨', '🐵', '🐧', '🐺']
  const index = name.length % emojis.length
  return emojis[index]
}

const handleLoginSuccess = (userData) => {
  showLogin.value = false
  gameStore.loginUser(userData)
}

const handleRegisterSuccess = (userData) => {
  showRegister.value = false
  gameStore.loginUser(userData)
}

const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    gameStore.logout()
  }
}

const resetProgress = () => {
  if (confirm('确定要重置游戏进度吗？这将清除所有游戏数据！')) {
    gameStore.gameState = {
      currentLocation: null,
      fragments: [],
      skills: [],
      revives: 0,
      completedLocations: []
    }
    gameStore.player = {
      ...gameStore.player,
      level: 1,
      experience: 0,
      hp: 3,
      coins: 0
    }
    gameStore.saveGameProgress()
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.auth-buttons {
  display: flex;
  gap: 15px;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.user-info-card {
  background: rgba(15, 23, 52, 0.8);
  border-radius: 12px;
  padding: 30px;
  border: 1px solid rgba(59, 115, 255, 0.3);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b73ff, #66e0ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.user-details h3 {
  margin: 0 0 5px 0;
  color: #e7ecff;
  font-size: 1.5rem;
}

.user-details p {
  margin: 0 0 10px 0;
  color: #9bb3ff;
}

.user-stats {
  display: flex;
  gap: 15px;
}

.user-stats span {
  background: rgba(59, 115, 255, 0.2);
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.progress-section {
  margin-bottom: 30px;
}

.progress-section h4 {
  margin-bottom: 15px;
  color: #e7ecff;
}

.level-progress {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b73ff, #66e0ff);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  color: #9bb3ff;
  font-size: 0.9rem;
  min-width: 100px;
}

.achievements-section h4 {
  margin-bottom: 15px;
  color: #e7ecff;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  opacity: 1;
  background: rgba(123, 255, 178, 0.1);
  border-color: rgba(123, 255, 178, 0.3);
}

.achievement-icon {
  font-size: 1.5rem;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: #e7ecff;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 0.8rem;
  color: #9bb3ff;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.modal-overlay {
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
</style>