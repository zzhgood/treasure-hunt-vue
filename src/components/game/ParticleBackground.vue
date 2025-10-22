<template>
  <div class="particles-container" ref="particlesContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const particlesContainer = ref(null)
let animationFrame = null

const createParticles = () => {
  const container = particlesContainer.value
  if (!container) return

  const particleCount = 30
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    particle.classList.add('particle')
    
    // 随机属性
    const size = Math.random() * 6 + 2
    const left = Math.random() * 100
    const delay = Math.random() * 15
    const duration = Math.random() * 10 + 15
    const opacity = Math.random() * 0.3 + 0.1
    
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.left = `${left}%`
    particle.style.bottom = `-${size}px`
    particle.style.animationDelay = `${delay}s`
    particle.style.animationDuration = `${duration}s`
    particle.style.opacity = opacity.toString()
    
    // 随机颜色
    const colors = [
      'rgba(111, 179, 255, 0.3)',
      'rgba(102, 224, 255, 0.3)',
      'rgba(123, 255, 178, 0.3)',
      'rgba(255, 214, 107, 0.3)'
    ]
    const color = colors[Math.floor(Math.random() * colors.length)]
    particle.style.background = color
    
    container.appendChild(particle)
  }
}

const animateParticles = () => {
  // 这里可以添加更复杂的粒子动画逻辑
  animationFrame = requestAnimationFrame(animateParticles)
}

onMounted(() => {
  createParticles()
  animateParticles()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float 15s infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

/* 额外的粒子动画变体 */
.particle:nth-child(odd) {
  animation-name: float-alt;
}

@keyframes float-alt {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(-100px) rotate(-360deg);
    opacity: 0;
  }
}
</style>