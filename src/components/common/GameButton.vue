<template>
  <button 
    class="game-button"
    :class="[variant, size, { disabled }]"
    @click="handleClick"
    :disabled="disabled"
  >
    <span v-if="icon" class="button-icon">{{ icon }}</span>
    <span class="button-text"><slot></slot></span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'danger', 'success'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}

const buttonClasses = computed(() => {
  return [
    `variant-${props.variant}`,
    `size-${props.size}`,
    { disabled: props.disabled }
  ]
})
</script>

<style scoped>
.game-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: inherit;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.game-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.game-button:not(:disabled):hover {
  transform: translateY(-2px);
}

.game-button:not(:disabled):active {
  transform: translateY(0);
}

/* 尺寸 */
.size-small {
  padding: 8px 12px;
  font-size: 0.8rem;
}

.size-medium {
  padding: 12px 18px;
  font-size: 0.9rem;
}

.size-large {
  padding: 16px 24px;
  font-size: 1rem;
}

/* 变体 */
.variant-primary {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: #061020;
  box-shadow: 0 4px 12px rgba(59, 115, 255, 0.3);
}

.variant-primary:not(:disabled):hover {
  box-shadow: 0 6px 15px rgba(59, 115, 255, 0.4);
}

.variant-secondary {
  background: rgba(15, 23, 52, 0.8);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.variant-secondary:not(:disabled):hover {
  background: rgba(26, 43, 85, 0.8);
  border-color: var(--accent-primary);
}

.variant-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.variant-outline:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--accent-primary);
}

.variant-danger {
  background: linear-gradient(135deg, #ff4757, #ff6b81);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
}

.variant-danger:not(:disabled):hover {
  box-shadow: 0 6px 15px rgba(255, 71, 87, 0.4);
}

.variant-success {
  background: linear-gradient(135deg, #2ed573, #7bed9f);
  color: #061020;
  box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);
}

.variant-success:not(:disabled):hover {
  box-shadow: 0 6px 15px rgba(46, 213, 115, 0.4);
}

/* 图标 */
.button-icon {
  font-size: 1.1em;
}

.button-text {
  white-space: nowrap;
}

/* 加载状态 */
.game-button.loading {
  pointer-events: none;
}

.game-button.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 涟漪效果 */
.game-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.game-button:active::before {
  width: 100px;
  height: 100px;
}
</style>