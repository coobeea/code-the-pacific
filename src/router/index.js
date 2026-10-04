import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// 四入口按路由懒加载，避免首包过大（需求 N-01）；hash 模式规避静态托管深链 404（坑 2）
const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '首页展厅' } },
  { path: '/01-summit', name: 'summit', component: () => import('../views/SummitView.vue'), meta: { entry: 'summit', title: '峰会资讯' } },
  { path: '/02-nanshan', name: 'nanshan', component: () => import('../views/NanshanView.vue'), meta: { entry: 'nanshan', title: '鹏城数字名片' } },
  { path: '/02-nanshan/scene/:id', name: 'scene', component: () => import('../views/SceneDetailView.vue'), meta: { entry: 'nanshan', title: '南山八景' } },
  { path: '/03-pedia', name: 'pedia', component: () => import('../views/PediaView.vue'), meta: { entry: 'pedia', title: '亚太经济体百科' } },
  { path: '/04-youth', name: 'youth', component: () => import('../views/YouthView.vue'), meta: { entry: 'youth', title: '少年亚太对话' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }), // 切换入口/详情返回时复位滚动，评委最容易感知的"流畅"点
})

router.afterEach((to) => {
  document.title = (to.meta.title ? to.meta.title + ' · ' : '') + '码上亚太 Code the Pacific'
})

export default router
