<template>
  <div class="location-exploration">
    <div class="exploration-header">
      <GameButton @click="$emit('backToMap')" variant="outline" icon="←">
        返回地图
      </GameButton>
      <h2>{{ currentLocation?.name }} - {{ currentLocation?.description }}</h2>
      <AudioControl />
    </div>

    <div class="exploration-content">
      <div class="task-area">
        <div class="task-description">
          <h3>当前任务</h3>
          <p>{{ getTaskDescription() }}</p>
        </div>

        <div class="interaction-zone">
          <!-- 探索阶段 -->
          <div v-if="currentPhase === 'exploration'" class="exploration-options">
            <GameButton 
              v-for="action in availableActions" 
              :key="action.id"
              @click="handleAction(action)"
              :icon="action.icon"
              :variant="action.variant"
            >
              {{ action.label }}
            </GameButton>
          </div>

          <!-- 图书馆 - 密码破译游戏 -->
          <div v-else-if="currentPhase === 'libraryPuzzle'" class="puzzle-interface">
            <h4>📚 古代密码破译</h4>
            <div class="puzzle-content">
              <p>破译古代文献中的密码符号：</p>
              <div class="symbol-grid">
                <div 
                  v-for="(symbol, index) in librarySymbols" 
                  :key="index"
                  class="symbol"
                  :class="{ selected: selectedSymbols.includes(index) }"
                  @click="toggleSymbol(index)"
                >
                  {{ symbol }}
                </div>
              </div>
              <div class="selected-sequence">
                已选序列: {{ selectedSymbols.map(i => librarySymbols[i]).join(' ') }}
              </div>
              <div class="puzzle-actions">
                <GameButton @click="checkLibrarySolution" variant="primary">
                  验证答案
                </GameButton>
                <GameButton @click="resetLibraryPuzzle" variant="outline">
                  重置
                </GameButton>
              </div>
            </div>
          </div>

          <!-- 港口 - 星盘校准游戏 -->
          <div v-else-if="currentPhase === 'harborPuzzle'" class="puzzle-interface">
            <h4>⚓ 星盘校准</h4>
            <div class="puzzle-content">
              <p>旋转星盘使其与目标星座对齐：</p>
              
              <div class="star-dial-container">
                <!-- 目标星盘 -->
                <div class="target-dial">
                  <h5>目标位置</h5>
                  <div class="dial">
                    <div class="target-star" :style="{ transform: `rotate(${targetRotation}deg)` }">⭐</div>
                  </div>
                </div>
                
                <!-- 玩家控制的星盘 -->
                <div class="player-dial">
                  <h5>当前星盘</h5>
                  <div class="dial" :style="{ transform: `rotate(${dialRotation}deg)` }">
                    <div class="player-star">⭐</div>
                  </div>
                  <div class="rotation-display">
                    当前角度: {{ (dialRotation % 360 + 360) % 360 }}°
                  </div>
                </div>
              </div>
              
              <div class="dial-controls">
                <GameButton @click="rotateDial(-15)" icon="↶">
                  左转15°
                </GameButton>
                <GameButton @click="rotateDial(-5)" icon="↶">
                  左转5°
                </GameButton>
                <GameButton @click="rotateDial(5)" icon="↷">
                  右转5°
                </GameButton>
                <GameButton @click="rotateDial(15)" icon="↷">
                  右转15°
                </GameButton>
                <GameButton @click="checkHarborSolution" variant="primary" :disabled="isChecking">
                  {{ isChecking ? '校准中...' : '校准完成' }}
                </GameButton>
              </div>
              
              <div class="alignment-indicator" :class="getAlignmentClass()">
                对齐精度: {{ alignmentDiff }}° 
                <span v-if="alignmentDiff <= 10">🎯 接近目标!</span>
                <span v-else-if="alignmentDiff <= 30">📏 还需调整</span>
                <span v-else>🎪 偏离较远</span>
              </div>
              
              <div class="hint" v-if="showHint">
                💡 提示: 尝试将当前星盘旋转到 {{ targetRotation }}° 附近
              </div>
            </div>
          </div>

          <!-- 雨林 - 石像谜题 -->
          <div v-else-if="currentPhase === 'junglePuzzle'" class="puzzle-interface">
            <h4>🌿 石像激活序列</h4>
            <div class="puzzle-content">
              <p>按照正确的顺序激活石像：</p>
              <div class="statues-grid">
                <div 
                  v-for="statue in jungleStatues" 
                  :key="statue.id"
                  class="statue"
                  :class="{ active: statue.active, completed: statue.completed }"
                  @click="activateStatue(statue)"
                >
                  <div class="statue-icon">{{ statue.icon }}</div>
                  <div class="statue-name">{{ statue.name }}</div>
                </div>
              </div>
              <div class="sequence-display">
                当前序列: {{ currentSequence.map(s => s.name).join(' → ') }}
              </div>
              <div class="puzzle-actions">
                <GameButton @click="checkJungleSolution" variant="primary">
                  验证序列
                </GameButton>
                <GameButton @click="resetJunglePuzzle" variant="outline">
                  重置序列
                </GameButton>
              </div>
            </div>
          </div>

          <!-- 战斗界面 -->
          <div v-else-if="currentPhase === 'combat'" class="combat-interface">
            <h4>遭遇守卫!</h4>
            <div class="combat-status">
              <div class="enemy-info">
                <span>🛡️ {{ currentEnemy?.name }}</span>
              </div>
              <div class="combat-actions">
                <GameButton @click="combatAction('attack')" icon="⚔️">
                  攻击
                </GameButton>
                <GameButton @click="combatAction('defend')" icon="🛡️">
                  防御
                </GameButton>
                <GameButton 
                  v-if="hasSkill('smoke')" 
                  @click="combatAction('smoke')" 
                  icon="💨"
                >
                  烟雾弹
                </GameButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="game-log">
        <h4>探险日志</h4>
        <div class="log-content">
          <div 
            v-for="(entry, index) in gameLog" 
            :key="index"
            :class="['log-entry', entry.type]"
          >
            <span class="log-time">[{{ entry.time }}]</span>
            {{ entry.message }}
          </div>
        </div>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <div v-if="showResult" class="result-modal">
      <div class="result-content">
        <h3>{{ resultTitle }}</h3>
        <p>{{ resultMessage }}</p>
        <div class="result-rewards" v-if="rewards.length > 0">
          <h4>获得奖励:</h4>
          <ul>
            <li v-for="reward in rewards" :key="reward">{{ reward }}</li>
          </ul>
        </div>
        <GameButton @click="handleResultConfirm" icon="✅">
          确认
        </GameButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../../store/gameStore'
import AudioControl from './AudioControl.vue'
import GameButton from '../common/GameButton.vue'

const gameStore = useGameStore()

const props = defineProps({
  location: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['backToMap', 'locationCompleted'])

// 游戏状态
const currentPhase = ref('exploration')
const gameLog = ref([])
const showResult = ref(false)
const resultTitle = ref('')
const resultMessage = ref('')
const rewards = ref([])

// 地点特定游戏状态
const currentPuzzle = ref(null)
const currentEnemy = ref(null)

// 图书馆游戏状态
const librarySymbols = ref(['🌀', '⚡', '🌟', '🔱', '💠', '🔯', '🎯', '🎴'])
const selectedSymbols = ref([])
const librarySolution = [0, 2, 5, 3] // 正确的符号序列

// 港口游戏状态 - 修复后的逻辑
const dialRotation = ref(0)
const targetRotation = ref(0)
const isChecking = ref(false)
const showHint = ref(false)
const hintTimer = ref(null)

// 雨林游戏状态
const jungleStatues = ref([
  { id: 1, name: '太阳石像', icon: '☀️', active: false, completed: false },
  { id: 2, name: '月亮石像', icon: '🌙', active: false, completed: false },
  { id: 3, name: '星星石像', icon: '⭐', active: false, completed: false },
  { id: 4, name: '大地石像', icon: '🌍', active: false, completed: false }
])
const currentSequence = ref([])
const jungleSolution = [1, 3, 2, 4] // 正确的激活顺序

const currentLocation = computed(() => props.location)

// 计算对齐差异
const alignmentDiff = computed(() => {
  const current = (dialRotation.value % 360 + 360) % 360
  const target = (targetRotation.value % 360 + 360) % 360
  return Math.min(
    Math.abs(current - target),
    360 - Math.abs(current - target)
  )
})

// 获取对齐状态类名
const getAlignmentClass = () => {
  if (alignmentDiff.value <= 5) return 'perfect'
  if (alignmentDiff.value <= 15) return 'good'
  if (alignmentDiff.value <= 30) return 'fair'
  return 'poor'
}

const availableActions = computed(() => {
  const actions = [
    { id: 'explore', label: '探索区域', icon: '🔍', variant: 'primary' },
    { id: 'search', label: '搜索线索', icon: '📋', variant: 'outline' }
  ]
  
  if (gameStore.gameState.skills.includes('detect')) {
    actions.push({ id: 'detect', label: '使用探测', icon: '📡', variant: 'special' })
  }
  
  return actions
})

const hasSkill = (skill) => {
  return gameStore.gameState.skills.includes(skill)
}

// 游戏方法
const addLog = (message, type = 'info') => {
  const time = new Date().toLocaleTimeString()
  gameLog.value.push({ message, type, time })
  if (gameLog.value.length > 20) {
    gameLog.value.shift()
  }
}

const handleAction = (action) => {
  switch (action.id) {
    case 'explore':
      startExploration()
      break
    case 'search':
      searchForClues()
      break
    case 'detect':
      useDetection()
      break
  }
}

const startExploration = () => {
  addLog('开始探索当前区域...', 'info')
  
  // 根据地点启动不同的游戏
  switch (props.location.task) {
    case 'library':
      startLibraryPuzzle()
      break
    case 'harbor':
      startHarborPuzzle()
      break
    case 'jungle':
      startJunglePuzzle()
      break
    default:
      // 默认30%几率遭遇敌人，40%几率发现谜题，30%几率直接找到线索
      const random = Math.random()
      if (random < 0.3) {
        encounterEnemy()
      } else if (random < 0.7) {
        discoverPuzzle()
      } else {
        findClue()
      }
  }
}

// 图书馆密码破译游戏
const startLibraryPuzzle = () => {
  addLog('发现了一本古老的密码书...', 'info')
  currentPhase.value = 'libraryPuzzle'
  resetLibraryPuzzle()
}

const toggleSymbol = (index) => {
  if (selectedSymbols.value.includes(index)) {
    selectedSymbols.value = selectedSymbols.value.filter(i => i !== index)
  } else {
    selectedSymbols.value.push(index)
  }
}

const resetLibraryPuzzle = () => {
  selectedSymbols.value = []
}

const checkLibrarySolution = () => {
  const isCorrect = selectedSymbols.value.length === librarySolution.length &&
                   selectedSymbols.value.every((val, idx) => val === librarySolution[idx])
  
  if (isCorrect) {
    addLog('✅ 密码破译成功！', 'success')
    rewards.value = ['古代智慧卷轴', '经验值 +40']
    completeLocation()
  } else {
    addLog('❌ 密码错误，触发了魔法陷阱！', 'error')
    gameStore.takeDamage(1)
    resetLibraryPuzzle()
  }
}

// 港口星盘校准游戏
const startHarborPuzzle = () => {
  addLog('发现了古代星象台...', 'info')
  currentPhase.value = 'harborPuzzle'
  
  // 随机生成目标角度（0-359度）
  targetRotation.value = Math.floor(Math.random() * 360)
  
  // 随机生成玩家初始角度，确保与目标有足够差异
  let initialRotation
  do {
    initialRotation = Math.floor(Math.random() * 360)
  } while (Math.abs(initialRotation - targetRotation.value) < 45 && 
           Math.abs(initialRotation - targetRotation.value) > 315)
  
  dialRotation.value = initialRotation
  isChecking.value = false
  showHint.value = false
  
  // 30秒后显示提示
  clearTimeout(hintTimer.value)
  hintTimer.value = setTimeout(() => {
    showHint.value = true
  }, 30000)
}

const rotateDial = (degrees) => {
  dialRotation.value += degrees
  // 确保角度在合理范围内
  dialRotation.value = (dialRotation.value % 360 + 360) % 360
}

const checkHarborSolution = () => {
  isChecking.value = true
  
  // 模拟校准过程
  setTimeout(() => {
    const tolerance = 10 // 允许的误差范围
    
    if (alignmentDiff.value <= tolerance) {
      addLog('✅ 星盘校准成功！', 'success')
      rewards.value = ['星象图', '经验值 +35']
      completeLocation()
    } else {
      addLog('❌ 星盘校准失败，触发了机关！', 'error')
      gameStore.takeDamage(1)
    }
    
    isChecking.value = false
    clearTimeout(hintTimer.value)
  }, 1000)
}

// 雨林石像序列游戏
const startJunglePuzzle = () => {
  addLog('发现了神秘的古代石像群...', 'info')
  currentPhase.value = 'junglePuzzle'
  resetJunglePuzzle()
}

const activateStatue = (statue) => {
  if (!statue.completed && !statue.active) {
    statue.active = true
    currentSequence.value.push(statue)
    addLog(`激活了 ${statue.name}`, 'info')
  }
}

const resetJunglePuzzle = () => {
  jungleStatues.value.forEach(statue => {
    statue.active = false
    statue.completed = false
  })
  currentSequence.value = []
}

const checkJungleSolution = () => {
  const isCorrect = currentSequence.value.length === jungleSolution.length &&
                   currentSequence.value.every((statue, idx) => statue.id === jungleSolution[idx])
  
  if (isCorrect) {
    addLog('✅ 石像序列正确！遗迹大门打开了！', 'success')
    rewards.value = ['古代符文', '经验值 +45']
    completeLocation()
  } else {
    addLog('❌ 序列错误，石像恢复了原状', 'error')
    resetJunglePuzzle()
  }
}

// 原有的通用游戏逻辑
const encounterEnemy = () => {
  const enemies = [
    { name: '巡夜守卫', difficulty: 'easy' },
    { name: '港卫队长', difficulty: 'medium' },
    { name: '遗迹猎人', difficulty: 'hard' }
  ]
  
  currentEnemy.value = enemies[Math.floor(Math.random() * enemies.length)]
  currentPhase.value = 'combat'
  addLog(`⚠️ 遭遇了 ${currentEnemy.value.name}！`, 'warning')
}

const combatAction = (action) => {
  switch (action) {
    case 'attack':
      resolveCombat('attack')
      break
    case 'defend':
      resolveCombat('defend')
      break
    case 'smoke':
      useSmokeBomb()
      break
  }
}

const resolveCombat = (playerAction) => {
  const enemyActions = ['attack', 'defend']
  const enemyAction = enemyActions[Math.floor(Math.random() * enemyActions.length)]
  
  // 简单的战斗逻辑
  if (playerAction === 'attack' && enemyAction === 'attack') {
    const survived = gameStore.takeDamage(1)
    addLog('⚔️ 双方交战，你受到了伤害！', 'warning')
    
    if (!survived) {
      gameOver()
      return
    }
  } else if (playerAction === 'attack' && enemyAction === 'defend') {
    addLog('⚔️ 攻击被格挡了！', 'info')
  } else if (playerAction === 'defend' && enemyAction === 'attack') {
    addLog('🛡️ 成功防御了攻击！', 'success')
  }
  
  // 判断战斗是否结束
  if (Math.random() > 0.5) {
    combatVictory()
  }
}

const combatVictory = () => {
  addLog('✅ 成功击败了敌人！', 'success')
  rewards.value = ['经验值 +50', '金币 +30']
  completeLocation()
}

const useSmokeBomb = () => {
  gameStore.gameState.skills = gameStore.gameState.skills.filter(s => s !== 'smoke')
  addLog('💨 使用烟雾弹成功逃脱！', 'success')
  currentPhase.value = 'exploration'
}

const findClue = () => {
  addLog('🔍 找到了重要线索！', 'success')
  rewards.value = ['地图碎片', '经验值 +20']
  completeLocation()
}

const searchForClues = () => {
  addLog('仔细搜索区域...', 'info')
  // 50%几率找到线索，50%几率遭遇敌人
  if (Math.random() > 0.5) {
    findClue()
  } else {
    encounterEnemy()
  }
}

const useDetection = () => {
  gameStore.gameState.skills = gameStore.gameState.skills.filter(s => s !== 'detect')
  addLog('📡 使用探测技能发现了隐藏的通道！', 'success')
  rewards.value = ['地图碎片', '经验值 +25']
  completeLocation()
}

const discoverPuzzle = () => {
  // 默认谜题逻辑
  const puzzles = {
    library: {
      question: '胡子不多两边翘，开口总说妙妙妙，黑夜巡逻眼似灯，日里白天睡大觉。这是什么？',
      options: ['猫', '狗', '老鼠', '猫头鹰'],
      answer: '猫'
    },
    harbor: {
      question: '坐也是坐，立也是坐，行也是坐，卧也是坐。这是什么？',
      options: ['青蛙', '鱼', '鸟', '乌龟'],
      answer: '青蛙'
    },
    jungle: {
      question: '脱了红袍子，是个白胖子，去了白胖子，剩个黑丸子。这是什么？',
      options: ['荔枝', '龙眼', '葡萄', '樱桃'],
      answer: '荔枝'
    }
  }
  
  currentPuzzle.value = puzzles[props.location.task]
  addLog('发现了一个古老的谜题...', 'info')
}

const completeLocation = () => {
  gameStore.completeLocation(props.location.id)
  gameStore.addFragment(`地图碎片 ${props.location.id}`)
  
  resultTitle.value = '任务完成！'
  resultMessage.value = `成功探索了${props.location.name}`
  showResult.value = true
  
  addLog(`🎉 完成了 ${props.location.name} 的探索！`, 'success')
}

const handleResultConfirm = () => {
  showResult.value = false
  currentPhase.value = 'exploration'
  emit('locationCompleted', props.location)
}

const gameOver = () => {
  resultTitle.value = '游戏结束'
  resultMessage.value = '生命值已归零，探险失败'
  showResult.value = true
  addLog('💀 游戏结束！', 'error')
}

const getTaskDescription = () => {
  switch (props.location.task) {
    case 'library':
      return '解读古老的密码符号，破译隐藏的信息'
    case 'harbor':
      return '校准星象台上的星盘，揭示正确的方位'
    case 'jungle':
      return '按照正确的顺序激活石像，打开遗迹大门'
    default:
      return '探索这个神秘的地点'
  }
}

onMounted(() => {
  addLog(`进入 ${props.location.name}，开始探险...`, 'info')
})

onUnmounted(() => {
  // 清理定时器
  clearTimeout(hintTimer.value)
})
</script>

<style scoped>
.location-exploration {
  height: 100vh;
  background: linear-gradient(135deg, #0b1020, #1a2b55);
  color: #e7ecff;
  overflow: hidden;
}

.exploration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(11, 16, 32, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(42, 52, 85, 0.5);
}

.exploration-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: calc(100vh - 80px);
  padding: 20px;
}

.task-area, .game-log {
  background: rgba(15, 23, 52, 0.8);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(59, 115, 255, 0.3);
}

.task-description {
  margin-bottom: 30px;
}

.interaction-zone {
  min-height: 300px;
}

.exploration-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 300px;
}

.puzzle-interface, .combat-interface {
  text-align: center;
}

/* 图书馆符号网格 */
.symbol-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.symbol {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(59, 115, 255, 0.2);
  border: 2px solid rgba(59, 115, 255, 0.5);
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.symbol:hover {
  background: rgba(59, 115, 255, 0.4);
  transform: scale(1.1);
}

.symbol.selected {
  background: rgba(123, 255, 178, 0.3);
  border-color: #7bffb2;
  box-shadow: 0 0 10px #7bffb2;
}

.selected-sequence {
  margin: 15px 0;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-family: 'Courier New', monospace;
}

/* 港口星盘校准 */
.star-dial-container {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  gap: 20px;
}

.target-dial, .player-dial {
  text-align: center;
}

.target-dial h5, .player-dial h5 {
  margin-bottom: 10px;
  color: #9bb3ff;
}

.dial {
  width: 120px;
  height: 120px;
  border: 2px solid rgba(59, 115, 255, 0.5);
  border-radius: 50%;
  position: relative;
  background: rgba(11, 16, 32, 0.8);
  margin: 0 auto;
}

.target-star, .player-star {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
}

.rotation-display {
  margin-top: 10px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.9rem;
}

.dial-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 20px 0;
}

.alignment-indicator {
  margin: 15px 0;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
}

.alignment-indicator.perfect {
  background: rgba(123, 255, 178, 0.2);
  border: 1px solid #7bffb2;
  color: #7bffb2;
}

.alignment-indicator.good {
  background: rgba(255, 214, 107, 0.2);
  border: 1px solid #ffd66b;
  color: #ffd66b;
}

.alignment-indicator.fair {
  background: rgba(255, 152, 107, 0.2);
  border: 1px solid #ff986b;
  color: #ff986b;
}

.alignment-indicator.poor {
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid #ff6b6b;
  color: #ff6b6b;
}

.hint {
  margin-top: 10px;
  padding: 10px;
  background: rgba(255, 214, 107, 0.2);
  border: 1px solid #ffd66b;
  border-radius: 6px;
  color: #ffd66b;
  font-size: 0.9rem;
}

/* 雨林石像网格 */
.statues-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

.statue {
  padding: 15px;
  background: rgba(59, 115, 255, 0.2);
  border: 2px solid rgba(59, 115, 255, 0.5);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.statue:hover {
  background: rgba(59, 115, 255, 0.4);
  transform: translateY(-2px);
}

.statue.active {
  background: rgba(255, 214, 107, 0.3);
  border-color: #ffd66b;
}

.statue.completed {
  background: rgba(123, 255, 178, 0.3);
  border-color: #7bffb2;
}

.statue-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.statue-name {
  font-size: 0.9rem;
  color: #9bb3ff;
}

.sequence-display {
  margin: 15px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-height: 40px;
}

.puzzle-actions, .combat-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.game-log {
  overflow-y: auto;
}

.log-content {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.log-entry {
  margin-bottom: 8px;
  line-height: 1.4;
}

.log-time {
  color: #9bb3ff;
  font-size: 0.8rem;
}

.log-entry.info { color: #e7ecff; }
.log-entry.success { color: #7bffb2; }
.log-entry.warning { color: #ffd66b; }
.log-entry.error { color: #ff7b96; }

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 10, 26, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
  z-index: 1000;
}

.result-content {
  background: rgba(15, 23, 52, 0.95);
  padding: 30px;
  border-radius: 12px;
  border: 2px solid #3b73ff;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.result-rewards {
  margin: 20px 0;
}

.result-rewards ul {
  list-style: none;
  padding: 0;
}

.result-rewards li {
  padding: 5px 0;
  color: #7bffb2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .exploration-content {
    grid-template-columns: 1fr;
  }
  
  .star-dial-container {
    flex-direction: column;
    align-items: center;
  }
  
  .dial-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .dial-controls .game-button {
    width: 200px;
  }
}
</style>