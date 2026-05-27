import { createPinia, defineStore } from 'pinia'
import { DEFAULT_CONFIG, DEFAULT_STYLE } from '../../service/const'

export const useConfigStore = defineStore('config', {
  state: () => ({
    ...DEFAULT_CONFIG,
    ...DEFAULT_STYLE,
  }),

  actions: {
    UPDATE_STYLE(payload) {
      const objKey = `${payload.prop}_lv${payload.role}`
      this[objKey] = { ...this[objKey], ...payload.style }
    },

    UPDATE_CONFIG(payload) {
      for (const key in payload) {
        this[key] = payload[key]
      }
    },

    CLEAR_TEXT_STROKE_VERSION_0_4_8() {
      const array = [
        { prop: 'name', role: '0' },
        { prop: 'comment', role: '0' },
        { prop: 'name', role: '1' },
        { prop: 'comment', role: '1' },
        { prop: 'name', role: '2' },
        { prop: 'comment', role: '2' },
        { prop: 'name', role: '3' },
        { prop: 'comment', role: '3' },
        { prop: 'name', role: 'admin' },
        { prop: 'comment', role: 'admin' },
      ]
      array.forEach((i) => {
        const objKey = `${i.prop}_lv${i.role}`
        const newData = { ...this[objKey] }
        delete newData['-webkit-text-stroke-width']
        delete newData['-webkit-text-stroke-color']
        this[objKey] = newData
      })
    },
  },
})

// 简单的 localStorage 持久化插件（替代 vuex-electron 的持久化）
function persistPlugin({ store }) {
  const STORAGE_KEY = 'bilibili-config'

  // 恢复状态
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      store.UPDATE_CONFIG(data)
    }
  } catch {
    // ignore
  }

  // 监听变化并保存
  store.$subscribe(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.$state))
    } catch {
      // ignore
    }
  })
}

const pinia = createPinia()
pinia.use(persistPlugin)

export default pinia
