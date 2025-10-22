<template>
  <div class="game-hud">
    <div class="hud-section">
      <h3 class="section-title">👤 玩家状态</h3>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">等级:</span>
          <span class="value">{{ player.level }}</span>
        </div>
        <div class="status-item">
          <span class="label">经验:</span>
          <span class="value">{{ player.experience }}/{{ expNeeded }}</span>
        </div>
        <div class="status-item">
          <span class="label">生命值:</span>
          <div class="health-bar">
            <div 
              v-for="n in 3" 
              :key="n" 
              class="health-point"
              :class="{ active: n <= player.hp }"
            ></div>
          </div>
        </div>
        <div class="status-item">
          <span class="label">金币:</span>
          <span class="value">💰 {{ player.coins }}</span>
        </div>
      </div>
    </div>

    <div class="hud-section">
      <h3 class="section-title">🧩 收集进度</h3>
      <div class="fragments-progress">
        <div class="progress-text">
          {{ collectedFragments }}/{{ totalFragments }} 地图碎片
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: fragmentProgress + '%' }"
          ></div>
        </div>
        <div class="fragments-list">
          <div 
            v-for="n in totalFragments" 
            :key="n"
            class="fragment-item"
            :class="{ collected: n <= collectedFragments }"
          >
            碎片 {{ n }}
          </div>
        </div>
      </div>
    </div>

    <div class="hud-section">
      <h3 class="section-title">🎒 技能与物品</h3>
      <div class="skills-list">
        <div 
          v-for="skill in skills" 
          :key="skill"
          class="skill-item"
        >
          {{ getSkillIcon(skill) }} {{ skill }}
        </div>
        <div v-if="skills.length === 0" class="no-skills">
          暂无技能
        </div>
      </div>
      <div class="special-items">
        <div class="item-count">
          <span>🛡️ 复活甲:</span>
          <span>{{ revives }}</span>
        </div>
      </div>
    </div>

    <div class="hud-section">
      <h3 class="section-title">📊 游戏统计</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span>已完成地点:</span>
          <span>{{ completedLocations }}/3</span>
        </div>
        <div class="stat-item">
          <span>游戏排名:</span>
          <span>#{{ playerRank }}</span>
        </div>
        <div class="stat-item">
          <span>总游戏时间:</span>
          <span>{{ formatGameTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../../store/gameStore'

const gameStore = useGameStore()

const player = computed(() => gameStore.player)
const skills = computed(() => gameStore.gameState.skills)
const revives = computed(() => gameStore.gameState.revives)
const collectedFragments = computed(() => gameStore.collectedFragments)
const totalFragments = computed(() => gameStore.totalFragments)
const completedLocations = computed(() => gameStore.gameState.completedLocations.length)
const playerRank = computed(() => gameStore.playerRank)

const expNeeded = computed(() => player.value.level * 100)
const fragmentProgress = computed(() => (collectedFragments.value / totalFragments.value) * 100)

const formatGameTime = computed(() => {
  // 这里可以添加实际游戏时间计算逻辑
  return '00:00:00'
})

const getSkillIcon = (skill) => {
  const icons = {
    '烟雾弹': '💨',
    '临时护盾': '🛡️',
    '疾跑': '🏃',
    '探测': '📡'
  }
  return icons[skill] || '🎯'
}
</script>

<style scoped>
.game-hud {
  background: rgba(15, 23, 52, 0.9);
  border: 1px solid rgba(59, 115, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.hud-section {
  margin-bottom: 25px;
}

.hud-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  color: #e7ecff;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(59, 115, 255, 0.3);
  padding-bottom: 8px;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: #9bb3ff;
  font-size: 0.9rem;
}

.value {
  color: #e7ecff;
  font-weight: 600;
}

.health-bar {
  display: flex;
  gap: 5px;
}

.health-point {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.health-point.active {
  background: #ff7b96;
  border-color: #ff7b96;
  box-shadow: 0 0 8px #ff7b96;
}

.fragments-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-text {
  text-align: center;
  color: #9bb3ff;
  font-size: 0.9rem;
}

.progress-bar {
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

.fragments-list {
  display: flex;
  justify-content: space-between;
}

.fragment-item {
  padding: 5px 10px;
  border: 1px solid rgba(59, 115, 255, 0.3);
  border-radius: 6px;
  font-size: 0.8rem;
  color: #9bb3ff;
  transition: all 0.3s ease;
}

.fragment-item.collected {
  background: rgba(123, 255, 178, 0.2);
  border-color: #7bffb2;
  color: #7bffb2;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.skill-item {
  padding: 8px 12px;
  background: rgba(59, 115, 255, 0.1);
  border: 1px solid rgba(59, 115, 255, 0.3);
  border-radius: 6px;
  font-size: 0.9rem;
}

.no-skills {
  text-align: center;
  color: #9bb3ff;
  font-style: italic;
  padding: 20px;
}

.special-items {
  display: flex;
  justify-content: center;
}

.item-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 123, 150, 0.1);
  border: 1px solid rgba(255, 123, 150, 0.3);
  border-radius: 6px;
  min-width: 120px;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.stat-item span:first-child {
  color: #9bb3ff;
}

.stat-item span:last-child {
  color: #e7ecff;
  font-weight: 600;
}
</style>