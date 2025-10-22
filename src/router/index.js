// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import GameHome from '../views/GameHome.vue'
import UserCenter from '../views/UserCenter.vue'
import RankingPage from '../views/RankingPage.vue'

const routes = [
  {
    path: '/',
    name: 'GameHome',
    component: GameHome
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: UserCenter
  },
  {
    path: '/ranking',
    name: 'RankingPage',
    component: RankingPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router