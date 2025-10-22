<template>
  <div class="audio-control">
    <button 
      class="audio-btn"
      @click="toggleMusic"
      :title="musicEnabled ? '关闭音乐' : '开启音乐'"
      :disabled="audioLoading"
    >
      <span class="audio-icon">
        <span v-if="audioLoading">⏳</span>
        <span v-else>{{ musicEnabled ? '🔊' : '🔇' }}</span>
      </span>
      <span class="audio-text">
        <span v-if="audioLoading">加载中...</span>
        <span v-else>{{ musicEnabled ? '音乐开' : '音乐关' }}</span>
      </span>
    </button>
    
    <audio 
      ref="bgMusic"
      loop
      :volume="volume"
      @error="handleAudioError"
      @canplaythrough="handleCanPlay"
      @loadstart="handleLoadStart"
      @stalled="handleStalled"
      preload="auto"
    >
      <source :src="currentMusic" type="audio/mpeg">
      您的浏览器不支持音频元素。
    </audio>
    
    <!-- 调试信息（开发时显示） -->
    <div v-if="debugMode" class="debug-info">
      <div>状态: {{ audioState }}</div>
      <div>错误: {{ audioError }}</div>
      <div>当前音乐: {{ currentMusic }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '../../store/gameStore'

const gameStore = useGameStore()
const bgMusic = ref(null)

// 状态管理
const audioLoading = ref(false)
const audioError = ref(null)
const audioState = ref('idle')
const hasUserInteracted = ref(false)
const debugMode = ref(false) // 设置为 true 可以显示调试信息

// 音乐启用状态
const musicEnabled = computed({
  get: () => gameStore.settings.musicEnabled,
  set: (value) => {
    gameStore.settings.musicEnabled = value
    gameStore.saveGameProgress()
  }
})

const volume = computed(() => musicEnabled.value ? 0.5 : 0)

// 音乐文件路径 - 使用正确的相对路径
const currentMusic = computed(() => {
  const location = gameStore.gameState.currentLocation
  const musicMap = {
    library: './music/library-bg.mp3',
    harbor: './music/harbor-bg.mp3',
    jungle: './music/jungle-bg.mp3'
  }
  
  return musicMap[location] || './music/panorama-bg.mp3'
})

// 音频事件处理
const handleAudioError = (event) => {
  console.error('音频加载错误:', event)
  audioError.value = `音乐加载失败: ${bgMusic.value?.error?.message || '未知错误'}`
  audioLoading.value = false
  audioState.value = 'error'
}

const handleCanPlay = () => {
  console.log('音频可以播放')
  audioLoading.value = false
  audioState.value = 'canplay'
  
  // 如果可以播放且音乐已启用，尝试播放
  if (musicEnabled.value && hasUserInteracted.value) {
    playAudio()
  }
}

const handleLoadStart = () => {
  console.log('开始加载音频')
  audioLoading.value = true
  audioState.value = 'loading'
}

const handleStalled = () => {
  console.warn('音频加载停滞')
  audioState.value = 'stalled'
}

// 播放音频
const playAudio = async () => {
  if (!bgMusic.value) return
  
  try {
    audioState.value = 'playing'
    await bgMusic.value.play()
    audioError.value = null
    console.log('音乐播放成功')
  } catch (error) {
    console.error('播放失败:', error)
    audioError.value = `播放失败: ${error.message}`
    audioState.value = 'play_error'
    
    // 如果是自动播放被阻止，等待用户交互
    if (error.name === 'NotAllowedError') {
      audioError.value = '需要用户点击页面后才能播放音乐'
    }
  }
}

// 停止音频
const stopAudio = () => {
  if (bgMusic.value) {
    bgMusic.value.pause()
    bgMusic.value.currentTime = 0
    audioState.value = 'paused'
  }
}

// 切换音乐
const toggleMusic = async () => {
  // 标记用户已经交互
  hasUserInteracted.value = true
  
  musicEnabled.value = !musicEnabled.value
  
  if (musicEnabled.value) {
    // 确保音频元素已加载
    if (bgMusic.value) {
      audioLoading.value = true
      bgMusic.value.load() // 重新加载确保状态正确
      await playAudio()
    }
  } else {
    stopAudio()
  }
}

// 监听音乐文件变化
watch(currentMusic, (newMusic, oldMusic) => {
  if (newMusic !== oldMusic && bgMusic.value && musicEnabled.value) {
    console.log('切换音乐:', newMusic)
    audioLoading.value = true
    audioState.value = 'switching'
    
    // 短暂延迟确保DOM更新
    setTimeout(() => {
      if (bgMusic.value) {
        bgMusic.value.load()
      }
    }, 100)
  }
})

// 监听音乐启用状态变化
watch(musicEnabled, (newValue) => {
  if (newValue && hasUserInteracted.value) {
    playAudio()
  } else if (!newValue) {
    stopAudio()
  }
})

// 生命周期
onMounted(() => {
  console.log('AudioControl 组件挂载')
  
  // 预加载音频
  if (bgMusic.value) {
    bgMusic.value.load()
  }
  
  // 全局用户交互监听
  const handleGlobalInteraction = () => {
    if (!hasUserInteracted.value) {
      hasUserInteracted.value = true
      console.log('用户首次交互，可以播放音频了')
      
      // 如果音乐是启用的，尝试播放
      if (musicEnabled.value && bgMusic.value) {
        playAudio()
      }
    }
  }
  
  // 添加多种交互事件监听
  const events = ['click', 'touchstart', 'keydown', 'mousedown']
  events.forEach(event => {
    document.addEventListener(event, handleGlobalInteraction, { once: true })
  })
  
  // 保存清理函数
  window._audioCleanup = () => {
    events.forEach(event => {
      document.removeEventListener(event, handleGlobalInteraction)
    })
  }
})

onUnmounted(() => {
  // 清理事件监听
  if (window._audioCleanup) {
    window._audioCleanup()
  }
  
  // 停止音乐
  stopAudio()
})

// 开发时启用调试模式
if (process.env.NODE_ENV === 'development') {
  debugMode.value = true
}
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
  min-width: 100px;
  justify-content: center;
}

.audio-btn:hover:not(:disabled) {
  background: rgba(26, 43, 85, 0.8);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 115, 255, 0.3);
}

.audio-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.audio-icon {
  font-size: 1rem;
}

.audio-text {
  font-weight: 600;
  font-size: 0.8rem;
}

.debug-info {
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  z-index: 1000;
  margin-top: 5px;
  min-width: 200px;
}

.debug-info div {
  margin: 2px 0;
}

@media (max-width: 768px) {
  .audio-text {
    display: none;
  }
  
  .audio-btn {
    padding: 8px;
    min-width: auto;
  }
}
</style>