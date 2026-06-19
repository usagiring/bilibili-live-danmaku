import { createPinia, defineStore } from 'pinia'
import { ref, computed, reactive, toRefs, toRaw } from 'vue'
import { updateClientConfig } from '../service/api'

interface Provider {
  type: string
  service: string
  appKey: string
  accessKeyId: string
  accessKeySecret: string

}

export interface Room {
  id: string
  userId: string
  liveStatus: number
  liveStream: string

  isAutoReply: boolean
  autoReplyRules: any[]

  voteOptions: Array<{ keyword: string; value: string }>

  // Render
  realId?: string
  isConnected?: boolean
  isActive?: boolean
  username?: string
  face?: string
  displayId?: string
  anchorNumber?: number
  fansNumber?: number
  fansclubNumber?: number
  ninkiNumber?: number
  watchedNumber?: number
  likeNumber?: number
  onlineNumber?: number
}

interface User {
  id: string
  face: string
  cookie: string
}

// ── 样式值 ──
type StyleValue = Record<string, string>

// ── Config 子类型 ──

export interface DmStyle {
  isShowFace: boolean
  isShowAnchorIcon: boolean
  isShowFanMedal: boolean
  isShowHeadline: boolean
  faceSize: number
  combineSimilarTime: number
  hiddenExpiredTime: number
  showHeadlineThreshold: number
  isShowInteractInfo: boolean
  showGiftCardThreshold: number
  isShowSilverGift: boolean
  font: string
  fontWeight: string
  isUseMiniGiftCard: boolean
  adminIcon: string
  isShowAdminIcon: boolean
  adminIconColor: string
  isShowType1: boolean
  isShowType2: boolean
  channelCount: number
  channelDelayTime: number
  isShowSuperChatJPN: boolean
  windowOpacity: number
  windowBackground: string
  isWindowAlwaysOnTop: boolean
  messageSettings: any[]
  borderImages: any[]
  messageContainer0: StyleValue
  messageUsername0: StyleValue
  messageComment0: StyleValue
  messageContainer1: StyleValue
  messageUsername1: StyleValue
  messageComment1: StyleValue
  messageContainer2: StyleValue
  messageUsername2: StyleValue
  messageComment2: StyleValue
  messageContainer3: StyleValue
  messageUsername3: StyleValue
  messageComment3: StyleValue
  messageContainer99: StyleValue
  messageUsername99: StyleValue
  messageComment99: StyleValue
  messageContainerInteract: StyleValue
  messageCommentInteract: StyleValue
}

export interface DmRawStyle {
  isWindowAlwaysOnTop: boolean
  windowOpacity: number
  windowBackground: string
  direction: 'RL' | 'LR'
  emojiSize: number
  styleExtend: 'bilibili' | 'self'
  duration: number
  windowOnTopLevel: string
  isWindowOnTopForce: boolean
  ignoreMouseEvent: boolean
}

export interface LiveConfig {
  isWindowAlwaysOnTop: boolean
  windowOpacity: number
  windowBackground: string
  isWithCookie: boolean
  volume: number
}

export interface MessageConfig {
  isRealTimeMode: boolean
  isShowUserSpaceLink: boolean
}

export interface AsrConfig {
  showLineCount: number
  audioFrom: string
}

export interface MtConfig {
  fromLang: string
  toLang: string
  disableMircrophotoNoticeMessage: boolean
}

export interface ChartConfig {
  colors: string[]
}

export interface RecordConfig {
  savePath: string
  quality: string
  isAutoRecord: boolean
}

export interface Config {
  clientId: string
  // 全局设置
  signInMessage: string
  isNeedRefreshCookieCache: boolean
  refreshToken: string
  waitingSpeakerCount: number

  user?: User
  rooms: Room[]
  isRecording?: boolean
  windows: Window[]
  providers: Provider[]

  dmStyle?: DmStyle
  dmRawStyle?: DmRawStyle
  liveConfig?: LiveConfig
  messageConfig?: MessageConfig
  recordConfig?: RecordConfig
  asrConfig?: AsrConfig
  mtConfig?: MtConfig
  chartConfig?: ChartConfig
}

export const useConfigStore = defineStore('config', () => {
  // ── State ──
  const state = reactive<Config>({
    clientId: '',
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
    return (state.rooms as Room[])?.find(room => room.isActive) || null
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

  function updateConfig(payload: Record<string, any>) {
    Object.assign(state, payload)
  }

  return {
    ...toRefs(state),
    activeRoom,
    // replaceState,
    updateConfig,
  }
})

// ── 持久化 Plugin：防抖增量同步到桥接后端 ──
let syncTimer: ReturnType<typeof setTimeout> | null = null
const changedKeys = new Set<string>()
const SYNC_DEBOUNCE = 800  // ms
const immediateKeys = new Set(['dmStyle', 'dmRawStyle'])

function findRootKey(state: Record<string, any>, event: any): string | null {
  const target = toRaw(event.target)
  for (const key of Object.keys(state)) {
    const raw = toRaw(state[key])
    // 直接匹配
    if (raw === target) return key
    // 数组内元素变化：target 可能是数组的某一项
    if (Array.isArray(raw) && raw.includes(target)) return key
  }
  // 回退：event.key 本身可能就是根 key
  const k = event.key as string
  if (k in state) return k
  return null
}

async function flushSync(state: Config) {
  const keys = [...changedKeys]
  changedKeys.clear()
  if (keys.length === 0) return

  const kvs = keys.map(key => ({ key, value: state[key] }))
  try {
    await updateClientConfig({ clientId: state.clientId, kvs })
  } catch { /* 忽略同步失败 */ }
}

function syncPlugin({ store }: { store: any }) {
  store.$subscribe((mutation: any) => {
    const state = store.$state as Config
    if (!state.clientId) return

    const raw = mutation.events
    if (!raw) return
    const events = Array.isArray(raw) ? raw : [raw]

    let isImmediate = false
    for (const event of events) {
      // 通过 target 反查根 key：对比 toRaw(state[k]) === toRaw(event.target)
      const rootKey = findRootKey(state, event) || (event.key as string)
      changedKeys.add(rootKey)
      if (immediateKeys.has(rootKey)) isImmediate = true
    }


    console.log(changedKeys)

    if (isImmediate) {
      // 立刻同步：取消防抖，合并当前积累的 key 一起发
      if (syncTimer) clearTimeout(syncTimer)
      flushSync(state)
      return
    }

    // 普通 key：防抖同步
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(() => flushSync(state), SYNC_DEBOUNCE)
  }, { detached: true })
}

const pinia = createPinia()
// pinia.use(syncPlugin)

export default pinia
