<template>
  <div class="panorama-container">
    <ParticleBackground />
    <AudioControl />
    
    <div class="top-bar">
      <h1 class="game-title">🗺️ 寻宝游戏 - 全景地图</h1>
      <div class="top-controls">
        <GameButton @click="navigateToUserCenter" icon="👤">
          个人中心
        </GameButton>
        <GameButton @click="navigateToRanking" icon="🏆">
          排行榜
        </GameButton>
      </div>
    </div>

    <div class="content-area">
      <GameHUD class="status-panel" />
      
      <div class="locations-container">
        <div 
          v-for="location in locations" 
          :key="location.id"
          class="location"
          :class="`location-${location.id}`"
          @click="enterLocation(location)"
        >
          <div class="location-content">
            <div class="location-title">{{ location.icon }} {{ location.name }}</div>
            <div class="location-desc">{{ location.description }}</div>
            <div v-if="isLocationCompleted(location.id)" class="completed-badge">
              ✅ 已完成
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../../store/gameStore'
import ParticleBackground from './ParticleBackground.vue'
import AudioControl from './AudioControl.vue'
import GameHUD from './GameHUD.vue'
import GameButton from '../common/GameButton.vue'

const router = useRouter()
const gameStore = useGameStore()

// 定义emit
const emit = defineEmits(['enterLocation'])

const locations = ref([
  {
    id: 1,
    name: "古老图书馆",
    icon: "📚",
    description: "解读残卷密码阵",
    task: "library"
  },
  {
    id: 2,
    name: "港口星象台", 
    icon: "⚓",
    description: "校准星盘",
    task: "harbor"
  },
  {
    id: 3,
    name: "雨林遗迹",
    icon: "🌿",
    description: "石像谜题", 
    task: "jungle"
  }
])

const enterLocation = (location) => {
  if (!gameStore.isLoggedIn) {
    alert('请先登录后再开始游戏')
    router.push('/user')
    return
  }
  
  // 更新游戏状态
  gameStore.gameState.currentLocation = location.task
  console.log(`进入地点: ${location.name}`)
  
  // 触发事件通知父组件
  emit('enterLocation', location)
}

const isLocationCompleted = (locationId) => {
  return gameStore.gameState.completedLocations.includes(locationId)
}

const navigateToUserCenter = () => {
  router.push('/user')
}

const navigateToRanking = () => {
  router.push('/ranking')
}
</script>

<style scoped>
.panorama-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0b1020, #1a1f38);
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(11, 16, 32, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(42, 52, 85, 0.5);
}

.game-title {
  color: #e7ecff;
  font-size: 1.8rem;
  margin: 0;
  text-shadow: 0 0 10px rgba(111, 179, 255, 0.5);
}

.top-controls {
  display: flex;
  gap: 15px;
}

.content-area {
  display: flex;
  height: calc(100vh - 80px);
  padding: 20px;
  gap: 20px;
}

.status-panel {
  width: 280px;
  flex-shrink: 0;
}

.locations-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.location:hover {
  transform: scale(1.15);
  border: 3px solid #6fb3ff;
  box-shadow: 0 0 25px #6fb3ff;
}

.location-content {
  background: rgba(15, 23, 52, 0.95);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(59, 115, 255, 0.3);
  width: 100%;
  text-align: center;
  transition: all 0.3s ease;
}

.location:hover .location-content {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
}

.location-title {
  font-weight: bold;
  font-size: 1.2rem;
  color: #e7ecff;
  margin-bottom: 8px;
}

.location-desc {
  font-size: 0.9rem;
  color: #9bb3ff;
}

.completed-badge {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #7bffb2;
}

.location-1 { top: 20%; left: 20%; }
.location-2 { top: 60%; left: 50%; }
.location-3 { top: 30%; left: 75%; }
</style>