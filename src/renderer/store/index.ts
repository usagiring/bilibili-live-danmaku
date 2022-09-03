import { createStore  } from 'vuex'
const { createPersistedState, createSharedMutations } = require('vuex-electron')
import Config from './modules/Config'

// const { context, modules } = loadModules()

const store = createStore({
  modules: {
    Config: Config
  },
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
