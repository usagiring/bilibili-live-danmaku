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
          component: () => import('@/components/Setting.vue')
        },
        {
          path: 'danmaku',
          component: () => import('@/components/Danmaku.vue')
        },
        {
          path: 'css-generator',
          component: () => import('@/components/CssGenerator.vue')
        }
      ]
    },
    {
      path: '/danmaku',
      name: 'Danmaku',
      component: () => import('@/components/Danmaku.vue')
    },
    {
      path: '/danmaku-example',
      name: 'DanmakuExample',
      component: () => import('@/components/DanmakuExample.vue')
    },
    {
      path: '*',
      redirect: () => import('@/components/NotFound.vue')
    }
  ]
})
