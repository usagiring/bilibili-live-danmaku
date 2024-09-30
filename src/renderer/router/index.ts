import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../components/Home.vue'),
    children: [
      {
        path: 'style',
        component: () => import('../components/StyleSetting.vue')
      },
      {
        path: 'message',
        component: () => import('../components/Message.vue')
      },
      {
        path: 'vote',
        component: () => import('../components/Vote.vue')
      },
      {
        path: 'lottery',
        component: () => import('../components/Lottery.vue')
      },
      {
        path: 'statistic',
        component: () => import('../components/Statistic.vue')
      },
      {
        path: 'live',
        component: () => import('../components/Live.vue')
      },
      {
        path: 'help',
        component: () => import('../components/Help.vue')
      },
      {
        path: 'auto-reply',
        component: () => import('../components/AutoReply.vue')
      },
      {
        path: 'command',
        component: () => import('../components/Command.vue')
      },
      {
        path: 'config',
        component: () => import('../components/Config.vue')
      },
      {
        path: 'danmaku-scroll',
        component: () => import('../components/Danmaku-Scroll.vue')
      },
      {
        path: 'asr',
        component: () => import('../components/ASR.vue')
      },
      {
        path: '',
        component: () => import('../components/Introduction.vue')
      }
    ]
  },
  {
    path: '/asr-window',
    component: () => import('../components/ASRWindow.vue')
  },
  {
    path: '/speech-to-danmaku',
    component: () => import('../components/SpeechToDanmaku.vue')
  },
  {
    path: '/live-window',
    component: () => import('../components/LiveWindow.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => import('../components/NotFound.vue')
  }
]

export default createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})
