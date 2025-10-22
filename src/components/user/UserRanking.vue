<template>
  <div class="user-ranking">
    <div class="ranking-header">
      <h2>🏆 玩家排行榜</h2>
      <div class="header-actions">
        <GameButton @click="refreshRankings" icon="🔄" size="small">
          刷新
        </GameButton>
        <GameButton @click="exportRankings" variant="outline" size="small" icon="📊">
          导出
        </GameButton>
      </div>
    </div>

    <div class="ranking-filters">
      <div class="filter-group">
        <label>排序方式:</label>
        <select v-model="sortBy" class="filter-select">
          <option value="level">等级</option>
          <option value="fragments">碎片数量</option>
          <option value="experience">经验值</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>排序顺序:</label>
        <select v-model="sortOrder" class="filter-select">
          <option value="desc">降序</option>
          <option value="asc">升序</option>
        </select>
      </div>
    </div>

    <div class="ranking-content">
      <div class="top-three">
        <div 
          v-for="(player, index) in topThreePlayers" 
          :key="player.id"
          class="podium-item"
          :class="`position-${index + 1}`"
        >
          <div class="podium-rank">{{ index + 1 }}</div>
          <div class="podium-avatar">
            {{ getAvatarEmoji(player.name) }}
          </div>
          <div class="podium-info">
            <div class="player-name">{{ player.name }}</div>
            <div class="player-stats">
              <span>Lv.{{ player.level }}</span>
              <span>🧩 {{ player.fragments }}</span>
              <span>⭐ {{ player.experience }}</span>
            </div>
          </div>
          <div class="podium-score">
            {{ getScore(player) }}
          </div>
        </div>
      </div>

      <div class="ranking-list">
        <div 
          v-for="(player, index) in otherPlayers" 
          :key="player.id"
          class="ranking-item"
          :class="{ 
            'current-user': player.id === currentUser.id,
            'highlight': index % 2 === 0
          }"
        >
          <div class="rank-number">{{ index + 4 }}</div>
          <div class="player-avatar">
            {{ getAvatarEmoji(player.name) }}
          </div>
          <div class="player-details">
            <div class="player-name">
              {{ player.name }}
              <span v-if="player.id === currentUser.id" class="you-badge">(你)</span>
            </div>
            <div class="player-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: getLevelProgress(player) + '%' }"
                ></div>
              </div>
              <span class="level-text">Lv.{{ player.level }}</span>
            </div>
          </div>
          <div class="player-stats">
            <div class="stat">
              <span class="stat-icon">🧩</span>
              <span class="stat-value">{{ player.fragments }}/3</span>
            </div>
            <div class="stat">
              <span class="stat-icon">⭐</span>
              <span class="stat-value">{{ player.experience }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="sortedRankings.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>暂无排行榜数据</h3>
        <p>开始游戏后，你的成绩将会出现在这里</p>
      </div>
    </div>

    <div class="ranking-stats">
      <div class="stat-card">
        <div class="stat-value">{{ totalPlayers }}</div>
        <div class="stat-label">总玩家数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ averageLevel }}</div>
        <div class="stat-label">平均等级</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ completionRate }}%</div>
        <div class="stat-label">完成率</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../../store/gameStore'
import GameButton from '../common/GameButton.vue'

const gameStore = useGameStore()

const sortBy = ref('level')
const sortOrder = ref('desc')

// 从游戏状态加载排行榜
onMounted(() => {
  gameStore.loadRankings()
})

const currentUser = computed(() => gameStore.player)

const sortedRankings = computed(() => {
  const rankings = [...gameStore.rankings]
  
  return rankings.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy.value) {
      case 'level':
        aValue = a.level
        bValue = b.level
        break
      case 'fragments':
        aValue = a.fragments
        bValue = b.fragments
        break
      case 'experience':
        aValue = a.experience
        bValue = b.experience
        break
      default:
        aValue = a.level
        bValue = b.level
    }
    
    if (sortOrder.value === 'desc') {
      return bValue - aValue
    } else {
      return aValue - bValue
    }
  })
})

const topThreePlayers = computed(() => {
  return sortedRankings.value.slice(0, 3)
})

const otherPlayers = computed(() => {
  return sortedRankings.value.slice(3)
})

const totalPlayers = computed(() => sortedRankings.value.length)

const averageLevel = computed(() => {
  if (sortedRankings.value.length === 0) return 0
  const total = sortedRankings.value.reduce((sum, player) => sum + player.level, 0)
  return Math.round(total / sortedRankings.value.length)
})

const completionRate = computed(() => {
  if (sortedRankings.value.length === 0) return 0
  const completed = sortedRankings.value.filter(player => player.fragments >= 3).length
  return Math.round((completed / sortedRankings.value.length) * 100)
})

const getAvatarEmoji = (name) => {
  if (!name) return '👤'
  const emojis = ['🦁', '🐯', '🐻', '🐼', '🐨', '🐵', '🐧', '🐺']
  const index = name.length % emojis.length
  return emojis[index]
}

const getScore = (player) => {
  switch (sortBy.value) {
    case 'level':
      return `Lv.${player.level}`
    case 'fragments':
      return `${player.fragments} 碎片`
    case 'experience':
      return `${player.experience} EXP`
    default:
      return `Lv.${player.level}`
  }
}

const getLevelProgress = (player) => {
  const expNeeded = player.level * 100
  return (player.experience / expNeeded) * 100
}

const refreshRankings = () => {
  gameStore.loadRankings()
}

const exportRankings = () => {
  const data = JSON.stringify(sortedRankings.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'treasure-hunt-rankings.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.user-ranking {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.ranking-header h2 {
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.ranking-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(15, 23, 52, 0.8);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.filter-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-primary);
  padding: 8px 12px;
  font-size: 0.9rem;
}

.ranking-content {
  margin-bottom: 30px;
}

.top-three {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(15, 23, 52, 0.8);
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.podium-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
}

.position-1 {
  order: 2;
  border-color: #ffd700;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(15, 23, 52, 0.8));
}

.position-2 {
  order: 1;
  border-color: #c0c0c0;
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(15, 23, 52, 0.8));
}

.position-3 {
  order: 3;
  border-color: #cd7f32;
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(15, 23, 52, 0.8));
}

.podium-rank {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.position-1 .podium-rank {
  color: #ffd700;
}

.position-2 .podium-rank {
  color: #c0c0c0;
}

.position-3 .podium-rank {
  color: #cd7f32;
}

.podium-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.podium-info {
  text-align: center;
  margin-bottom: 15px;
}

.player-name {
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.player-stats {
  display: flex;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.podium-score {
  font-weight: bold;
  color: var(--accent-primary);
  font-size: 1.1rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: rgba(15, 23, 52, 0.8);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: rgba(26, 43, 85, 0.8);
  border-color: var(--accent-primary);
}

.ranking-item.highlight {
  background: rgba(59, 115, 255, 0.1);
}

.ranking-item.current-user {
  background: linear-gradient(135deg, rgba(59, 115, 255, 0.2), rgba(15, 23, 52, 0.8));
  border-color: var(--accent-primary);
}

.rank-number {
  width: 40px;
  font-weight: bold;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 1.2rem;
}

.player-details {
  flex: 1;
}

.player-name {
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.you-badge {
  background: var(--accent-primary);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-left: 5px;
}

.player-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.level-text {
  color: var(--text-secondary);
  font-size: 0.8rem;
  min-width: 50px;
}

.player-stats {
  display: flex;
  gap: 15px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-icon {
  font-size: 0.9rem;
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: var(--text-primary);
}

.ranking-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(15, 23, 52, 0.8);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--accent-primary);
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .ranking-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .top-three {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .podium-item {
    order: 0 !important;
  }
  
  .ranking-item {
    padding: 12px 15px;
  }
  
  .player-stats {
    flex-direction: column;
    gap: 5px;
  }
}
</style>