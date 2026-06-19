import { createPinia, defineStore } from 'pinia'
import { ref, computed, reactive, toRefs, toRaw } from 'vue'
import { set as _set } from 'lodash'
import { updateClientConfig } from '../service/api'
import { ClientConfig, Room } from '../types'

export const useConfigStore = defineStore('config', () => {
  // ── State ──
  const state = reactive<ClientConfig>({
    id: '',
    rooms: [],
    windows: [],
    providers: [],

    signInMessage: '...',
    isNeedRefreshCookieCache: false,
    refreshToken: '',
    waitingSpeakerCount: 0,
  })

  // ── Getters ──
  const activeRoom = computed((): Room | null => {
    return state.rooms?.find(room => room.isActive) || null
  })

  // ── Actions ──
  // function replaceState(payload: Record<string, any>) {
  //   // 先清空再整体替换，确保引用类型完全刷新
  //   const keys = Object.keys(state)
  //   for (const key of keys) {
  //     delete (state as any)[key]
  //   }
  //   Object.assign(state, payload)
  // }

  function set(path, value: any) {
    console.log(path, value)
    _set(state, path, value)
  }

  return {
    ...toRefs(state),
    activeRoom,
    // replaceState,
    set,
  }
})

// ── 持久化 Plugin：防抖增量同步到桥接后端 ──
// let syncTimer: ReturnType<typeof setTimeout> | null = null
// const changedKeys = new Set<string>()
// const SYNC_DEBOUNCE = 800  // ms
// const immediateKeys = new Set(['dmStyle', 'dmRawStyle'])

// function findRootKey(state: Record<string, any>, event: any): string | null {
//   const target = toRaw(event.target)
//   for (const key of Object.keys(state)) {
//     const raw = toRaw(state[key])
//     // 直接匹配
//     if (raw === target) return key
//     // 数组内元素变化：target 可能是数组的某一项
//     if (Array.isArray(raw) && raw.includes(target)) return key
//   }
//   // 回退：event.key 本身可能就是根 key
//   const k = event.key as string
//   if (k in state) return k
//   return null
// }

// async function flushSync(state: ClientConfig) {
//   const keys = [...changedKeys]
//   changedKeys.clear()
//   if (keys.length === 0) return

//   const kvs = keys.map(key => ({ key, value: state[key] }))
//   try {
//     await updateClientConfig({ clientId: state.id, kvs })
//   } catch { /* 忽略同步失败 */ }
// }

// function syncPlugin({ store }: { store: any }) {
//   store.$subscribe((mutation: any) => {
//     const state = store.$state as ClientConfig
//     if (!state.id) return

//     const raw = mutation.events
//     if (!raw) return
//     const events = Array.isArray(raw) ? raw : [raw]

//     let isImmediate = false
//     for (const event of events) {
//       // 通过 target 反查根 key：对比 toRaw(state[k]) === toRaw(event.target)
//       const rootKey = findRootKey(state, event) || (event.key as string)
//       changedKeys.add(rootKey)
//       if (immediateKeys.has(rootKey)) isImmediate = true
//     }


//     console.log(changedKeys)

//     if (isImmediate) {
//       // 立刻同步：取消防抖，合并当前积累的 key 一起发
//       if (syncTimer) clearTimeout(syncTimer)
//       flushSync(state)
//       return
//     }

//     // 普通 key：防抖同步
//     if (syncTimer) clearTimeout(syncTimer)
//     syncTimer = setTimeout(() => flushSync(state), SYNC_DEBOUNCE)
//   }, { detached: true })
// }

const pinia = createPinia()
// pinia.use(syncPlugin)

export default pinia
