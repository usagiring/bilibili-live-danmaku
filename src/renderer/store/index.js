import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

const { context, modules } = loadModules()

const store = new Vuex.Store({
  modules,
  plugins: [
    createPersistedState({
      whitelist: [
        'UPDATE_STYLE',
        'UPDATE_CONFIG',
      ],
    }),
    createSharedMutations()  // vuex-electron 引入了一个用于多进程间共享 Vuex Store 的状态的插件。如果没有多进程交互的需求，完全可以不引入这个插件。
  ],
  strict: process.env.NODE_ENV !== 'production'
})

export default store

// if (module.hot) {
//   // 在任何模块发生改变时进行热重载。
//   module.hot.accept(context.id, () => {
//     const { modules } = loadModules()

//     store.hotUpdate({
//       modules
//     })
//   })
// }

// 加载所有模块。
function loadModules() {
  const context = require.context("./modules", false, /([a-z_]+)\.js$/i)

  const modules = context
    .keys()
    .map((key) => ({ key, name: key.match(/([a-z_]+)\.js$/i)[1] }))
    .reduce(
      (modules, { key, name }) => ({
        ...modules,
        [name]: context(key).default
      }),
      {}
    )

  return { context, modules }
}