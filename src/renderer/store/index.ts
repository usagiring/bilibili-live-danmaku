import { createPinia, defineStore } from 'pinia'
import type { RoomState } from './store-types'

function createRoom(roomId: number): RoomState {
  return {
    roomId,
    realRoomId: roomId,
    displayRoomId: roomId,
    isConnected: false,
    guardNumber: 0,
    username: '',
    avatar: null,
    ninkiNumber: 0,
    fansNumber: 0,
    fansClubNumber: 0,
    liveStatus: 0,
    onlineNumber: 0,
    roomUserId: 0,
    watchedNumber: 0,
    likeNumber: 0,
    topPhoto: '',
    medalId: null,
    medalName: '',
  }
}

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
  isConnect?: boolean
  isActive?: boolean
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
  // 全局设置
  signInMessage: string
  isNeedRefreshCookieCache?: number
  refreshToken?: string
  waitingSpeakerCount?: number

  user?: User
  rooms: Room[]
  isRecording: boolean
  windows: Window[]
  providers: Provider[]

  dmStyle: DmStyle
  dmRawStyle: DmRawStyle
  liveConfig: LiveConfig
  messageConfig: MessageConfig
  recordConfig: RecordConfig
  asrConfig: AsrConfig
  mtConfig: MtConfig
  chartConfig: ChartConfig
}

export const useConfigStore = defineStore('config', {
  state: (): Config => ({
    rooms: [],
    activeRoomIndex: 0,
    isRecording: false,
  } as unknown as Config),

  getters: {
    activeRoom(state): Room | null {
      return state.rooms?.find(room => room.isActive) || null
    },

    // hasConnectedRoom(state): boolean {
    //   return state.rooms.some((r) => r.isConnected)
    // },

    // isActiveRoomConnected(state): boolean {
    //   const room = state.rooms[state.activeRoomIndex]
    //   return room?.isConnected ?? false
    // },
  },

  actions: {
    // ── 房间管理 ──
    // ADD_ROOM(roomId: number) {
    //   if (this.rooms.find((r) => r.displayRoomId === roomId)) return
    //   this.rooms.push(createRoom(roomId))
    //   this.activeRoomIndex = this.rooms.length - 1
    // },

    // REMOVE_ROOM(index: number) {
    //   this.rooms.splice(index, 1)
    //   if (this.activeRoomIndex >= this.rooms.length) {
    //     this.activeRoomIndex = Math.max(0, this.rooms.length - 1)
    //   }
    // },

    // SET_ACTIVE_ROOM(index: number) {
    //   if (index >= 0 && index < this.rooms.length) {
    //     this.activeRoomIndex = index
    //   }
    // },

    // UPDATE_ACTIVE_ROOM(payload: Partial<RoomState>) {
    //   const room = this.rooms[this.activeRoomIndex]
    //   if (room) Object.assign(room, payload)
    // },

    // UPDATE_ROOM(index: number, payload: Partial<RoomState>) {
    //   const room = this.rooms[index]
    //   if (room) Object.assign(room, payload)
    // },

    // // ── 全局设置 ──
    // UPDATE_STYLE(payload: any) {
    //   const objKey = `${payload.prop}_lv${payload.role}`
    //   ;(this as any)[objKey] = { ...(this as any)[objKey], ...payload.style }
    // },

    UPDATE_CONFIG(payload: Record<string, any>) {
      for (const key in payload) {
        ;(this as any)[key] = payload[key]
      }
    },
  },
})

// localStorage 持久化
function persistPlugin({ store }: { store: any }) {
  const STORAGE_KEY = 'bilibili-config'

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      store.UPDATE_CONFIG(data)
    }
  } catch { /* ignore */ }

  store.$subscribe(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.$state))
    } catch { /* ignore */ }
  })
}

const pinia = createPinia()
pinia.use(persistPlugin)

export default pinia
