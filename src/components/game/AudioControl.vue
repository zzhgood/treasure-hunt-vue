<template>
  <div class="audio-control">
    <button 
      class="audio-btn"
      @click="toggleMusic"
      :title="musicEnabled ? '关闭音乐' : '开启音乐'"
    >
      <span class="audio-icon">
        {{ musicEnabled ? '🔊' : '🔇' }}
      </span>
      <span class="audio-text">
        {{ musicEnabled ? '音乐开' : '音乐关' }}
      </span>
    </button>
    
    <audio 
      ref="bgMusic"
      loop
      :volume="volume"
    >
      <source :src="currentMusic" type="audio/mpeg">
      您的浏览器不支持音频元素。
    </audio>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '../../store/gameStore'

const gameStore = useGameStore()
const bgMusic = ref(null)

const musicEnabled = computed({
  get: () => gameStore.settings.musicEnabled,
  set: (value) => {
    gameStore.settings.musicEnabled = value
    gameStore.saveGameProgress()
  }
})

const volume = computed(() => musicEnabled.value ? 0.4 : 0)

// 根据当前场景选择音乐
const currentMusic = computed(() => {
  const location = gameStore.gameState.currentLocation
  const musicMap = {
    library: '/music/library-bg.mp3',
    harbor: '/music/harbor-bg.mp3',
    jungle: '/music/jungle-bg.mp3'
  }
  
  return musicMap[location] || '/music/panorama-bg.mp3'
})

const toggleMusic = async () => {
  musicEnabled.value = !musicEnabled.value
  
  if (musicEnabled.value) {
    try {
      await bgMusic.value.play()
    } catch (error) {
      console.log('音频播放被阻止:', error)
      // 在用户交互后重试
      document.addEventListener('click', () => {
        bgMusic.value.play().catch(e => console.log('播放失败:', e))
      }, { once: true })
    }
  } else {
    bgMusic.value.pause()
  }
}

// 监听音乐变化
watch(currentMusic, (newMusic) => {
  if (bgMusic.value && musicEnabled.value) {
    bgMusic.value.pause()
    bgMusic.value.load()
    bgMusic.value.play().catch(e => console.log('音乐切换失败:', e))
  }
})

// 初始化音频
onMounted(() => {
  if (musicEnabled.value) {
    // 等待用户交互后自动播放
    const playOnInteraction = () => {
      bgMusic.value.play().catch(e => console.log('自动播放被阻止:', e))
      document.removeEventListener('click', playOnInteraction)
    }
    document.addEventListener('click', playOnInteraction)
  }
})
</script>

<style scoped>
.audio-control {
  display: inline-block;
}

.audio-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(15, 23, 52, 0.8);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.audio-btn:hover {
  background: rgba(26, 43, 85, 0.8);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 115, 255, 0.3);
}

.audio-icon {
  font-size: 1rem;
}

.audio-text {
  font-weight: 600;
}

@media (max-width: 768px) {
  .audio-text {
    display: none;
  }
  
  .audio-btn {
    padding: 8px;
  }
}
</style>