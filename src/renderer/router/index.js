import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/components/Home.vue'),
      children: [
        {
          path: 'setting',
          component: () => import('@/components/StyleSetting.vue')
        },
        {
          path: 'message',
          component: () => import('@/components/Message.vue')
        },
        {
          path: 'vote',
          component: () => import('@/components/Vote.vue')
        },
        {
          path: 'lottery',
          component: () => import('@/components/Lottery.vue')
        },
        {
          path: 'statistic',
          component: () => import('@/components/Statistic.vue')
        },
        {
          path: 'live',
          component: () => import('@/components/Live.vue')
        },
        {
          path: 'help',
          component: () => import('@/components/Help.vue')
        },
        {
          path: '',
          component: () => import('@/components/Introduction.vue')
        }
      ]
    },
    {
      path: '*',
      redirect: () => import('@/components/NotFound.vue')
    }
  ]
})
