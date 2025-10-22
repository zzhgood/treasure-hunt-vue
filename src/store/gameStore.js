// store/gameStore.js
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 玩家状态
    player: {
      id: null,
      name: '',
      level: 1,
      experience: 0,
      hp: 3,
      coins: 0
    },
    // 游戏进度
    gameState: {
      currentLocation: null,
      fragments: [],
      skills: [],
      revives: 0,
      completedLocations: []
    },
    // 用户管理
    users: [],
    rankings: [],
    // 设置
    settings: {
      musicEnabled: true,
      soundEnabled: true
    }
  }),

  getters: {
    isLoggedIn: (state) => !!state.player.id,
    playerRank: (state) => {
      return state.rankings.findIndex(r => r.id === state.player.id) + 1
    },
    collectedFragments: (state) => state.gameState.fragments.length,
    totalFragments: () => 3
  },

  actions: {
    // 玩家操作
    loginUser(userData) {
      this.player = { ...this.player, ...userData }
      this.loadGameProgress()
    },

    logout() {
      this.player = {
        id: null,
        name: '',
        level: 1,
        experience: 0,
        hp: 3,
        coins: 0
      }
    },

    // 游戏进度管理
    addFragment(fragment) {
      if (!this.gameState.fragments.includes(fragment)) {
        this.gameState.fragments.push(fragment)
        this.saveGameProgress()
      }
    },

    completeLocation(locationId) {
      if (!this.gameState.completedLocations.includes(locationId)) {
        this.gameState.completedLocations.push(locationId)
        this.player.experience += 100
        this.player.coins += 50
        this.checkLevelUp()
        this.saveGameProgress()
        this.updateRankings()
      }
    },

    takeDamage(amount = 1) {
      this.player.hp = Math.max(0, this.player.hp - amount)
      this.saveGameProgress()
      return this.player.hp > 0
    },

    // 工具方法
    checkLevelUp() {
      const expNeeded = this.player.level * 100
      if (this.player.experience >= expNeeded) {
        this.player.level++
        this.player.experience = 0
        this.player.hp = 3 // 恢复生命值
      }
    },

    saveGameProgress() {
      if (this.isLoggedIn) {
        const progress = {
          gameState: this.gameState,
          player: this.player
        }
        localStorage.setItem(`gameProgress_${this.player.id}`, JSON.stringify(progress))
      }
    },

    loadGameProgress() {
      if (this.isLoggedIn) {
        const saved = localStorage.getItem(`gameProgress_${this.player.id}`)
        if (saved) {
          const progress = JSON.parse(saved)
          this.gameState = progress.gameState
          this.player = { ...this.player, ...progress.player }
        }
      }
    },

    updateRankings() {
      // 更新排行榜逻辑
      const userIndex = this.rankings.findIndex(r => r.id === this.player.id)
      if (userIndex !== -1) {
        this.rankings[userIndex] = {
          ...this.rankings[userIndex],
          level: this.player.level,
          experience: this.player.experience,
          fragments: this.gameState.fragments.length
        }
      } else {
        this.rankings.push({
          id: this.player.id,
          name: this.player.name,
          level: this.player.level,
          experience: this.player.experience,
          fragments: this.gameState.fragments.length
        })
      }
      
      // 排序
      this.rankings.sort((a, b) => {
        if (b.level !== a.level) return b.level - a.level
        if (b.fragments !== a.fragments) return b.fragments - a.fragments
        return b.experience - a.experience
      })
      
      localStorage.setItem('treasureRankings', JSON.stringify(this.rankings))
    },

    loadRankings() {
      const saved = localStorage.getItem('treasureRankings')
      if (saved) {
        this.rankings = JSON.parse(saved)
      }
    }
  }
})