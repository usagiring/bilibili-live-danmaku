import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/Home.vue'),
  },
  {
    path: '/asr-window',
    component: () => import('../components/ASRWindow.vue'),
  },
  {
    path: '/speech-to-danmaku',
    component: () => import('../components/SpeechToDanmaku.vue'),
  },
  {
    path: '/live-window',
    component: () => import('../components/LiveWindow.vue'),
  },
  // {
  //   path: '/danmaku-scroll',
  //   component: () => import('../components/Danmaku-Scroll.vue')
  // },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('../components/NotFound.vue'),
  },
]

export default createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})
