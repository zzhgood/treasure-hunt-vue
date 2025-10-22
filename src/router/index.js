import { createRouter, createWebHashHistory } from 'vue-router'
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

// 关键修改：使用 Hash 模式而不是 History 模式
const router = createRouter({
  history: createWebHashHistory(), // 改为 Hash 模式
  routes
})

export default router