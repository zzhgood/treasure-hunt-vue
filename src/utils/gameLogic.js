export const gameUtils = {
  // 生成随机数
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  // 概率判断
  chance(probability) {
    return Math.random() < probability
  },

  // 格式化时间
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  // 计算等级所需经验
  getExpForLevel(level) {
    return level * 100
  },

  // 生成唯一ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const combatSystem = {
  calculateDamage(attacker, defender, action) {
    let damage = 0
    
    switch (action) {
      case 'attack':
        damage = 1
        if (Math.random() < 0.2) { // 20% 暴击几率
          damage *= 2
        }
        break
      case 'special':
        damage = 2
        break
      default:
        damage = 1
    }
    
    return damage
  },

  calculateDodgeChance(agility) {
    return agility * 0.05 // 每点敏捷提供5%闪避几率
  }
}

export const puzzleSystem = {
  generatePuzzle(difficulty) {
    const puzzles = {
      easy: [
        {
          question: '什么东西越洗越脏？',
          options: ['水', '衣服', '手', '碗'],
          answer: '水'
        }
      ],
      medium: [
        {
          question: '有头无脚，有眼无眉，无脚能走，有翅难飞。',
          options: ['鱼', '鸟', '蛇', '蝴蝶'],
          answer: '鱼'
        }
      ],
      hard: [
        {
          question: '小时四条腿，长大两条腿，老了三条腿。',
          options: ['人', '青蛙', '恐龙', '马'],
          answer: '人'
        }
      ]
    }
    
    const levelPuzzles = puzzles[difficulty] || puzzles.easy
    return levelPuzzles[Math.floor(Math.random() * levelPuzzles.length)]
  }
}