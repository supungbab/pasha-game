import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/ui/GameView.vue')
    },
    // Dev only routes for testing minigames
    {
      path: '/test',
      name: 'minigame-test-list',
      component: () => import('../components/ui/MiniGameTestList.vue')
    },
    {
      path: '/test/:id',
      name: 'minigame-test-player',
      component: () => import('../components/ui/MiniGameTestPlayer.vue')
    }
  ]
})

export default router
