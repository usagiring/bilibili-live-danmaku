import { createPinia, defineStore } from 'pinia'
import { DEFAULT_STYLE } from '../../service/const'

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

export const useConfigStore = defineStore('config', {
  state: () => ({
    // ── 多房间支持 ──
    rooms: [] as RoomState[],
    activeRoomIndex: 0,

    // ── 全局设置（所有房间共享） ──
    recordDir: '',
    isWithCookie: false,
    isAutoRecord: false,
    onlyMyselfRoom: true,
    isWatchLottery: false,
    isShowHeadline: true,
    fontWeight: 'normal',
    signInMessage: '',
    onlyTodayZeroIntimacy: true,
    isLiveWindowAlwaysOnTop: false,
    isScrollDanmakuWindowAlwaysOnTop: false,
    liveWindowOpacity: 1,
    liveWindowId: null as number | null,
    danmakuWindowId: null as number | null,
    isShowType1: true,
    isShowType2: true,
    isShowSuperChatJPN: true,
    liveWindowX: 600,
    liveWindowY: 600,
    liveWindowHeight: 480,
    enableMessageListenMode: false,
    scrollDanmakuFontSize: 22,
    scrollDanmakuDuration: 10000,
    scrollDanmakuDirection: 'RL',
    scrollDanmakuWindowId: null as number | null,
    scrollDanmakuWidth: 600,
    scrollDanmakuHeight: 600,
    scrollDanmakuX: 600,
    scrollDanmakuY: 600,
    scrollDanmakuBackground: 'rgba(0, 0, 0, 0.3)',
    scrollDanmakuOpacity: 100,
    scrollDanmakuStyleExtend: 'self',
    scrollDanmakuEmojiSize: 60,
    ASRWindowId: null as number | null,
    ASRLineCount: 5,
    emojiSize: 24,
    liveVolume: 1,
    ffmpegExe: '',
    aliAppKeys: [] as string[],
    autoReplyRules: [] as any[],
    borderImages: [
      {
        isAdaptContent: false,
        dataUrl: '',
        isSelected: false,
        'border-width': 15,
        'border-image-width': '1.5',
        'border-image-slice': '50',
        'border-image-repeat': 'stretch',
        'border-image-outset': '0',
      },
    ],
    colors: [] as string[],
    userInfoFrequencyLimit: 1000,
    waitingSpeakerCount: 0,
    onTopLevel: 'floating' as string,
    isOnTopForce: false,
    disableIgnoreMouseEvent: false,
    audioFrom: 'livestream',
    MTFromLang: '',
    MTToLang: '',
    disableMircrophotoNoticeMessage: false,
    messageSettings: [
      { type: 'avatar', isShow: true, size: 24 },
      { type: 'guard', isShow: true },
      { type: 'medal', isShow: true },
      { type: 'name', isShow: true },
      { type: 'colon', isShow: true },
      { type: 'comment', isShow: true },
    ],
    aliAccessKeyId: '',
    aliAccessKeySecret: '',
    aliAppKey: '',

    // 投票
    optionstring: '{A}\n{B}\n{C}',
    voteOptions: [] as string[],
    historyRooms: [] as Array<{ roomId: number; uname: string; face: string }>,
    isAutoReply: false,
    isRecording: false,

    ...DEFAULT_STYLE,
  }),

  getters: {
    activeRoom(state): RoomState | null {
      if (state.rooms.length === 0) return null
      return state.rooms[state.activeRoomIndex] || null
    },

    hasConnectedRoom(state): boolean {
      return state.rooms.some((r) => r.isConnected)
    },

    isActiveRoomConnected(state): boolean {
      const room = state.rooms[state.activeRoomIndex]
      return room?.isConnected ?? false
    },
  },

  actions: {
    // ── 房间管理 ──
    ADD_ROOM(roomId: number) {
      if (this.rooms.find((r) => r.displayRoomId === roomId)) return
      this.rooms.push(createRoom(roomId))
      this.activeRoomIndex = this.rooms.length - 1
    },

    REMOVE_ROOM(index: number) {
      this.rooms.splice(index, 1)
      if (this.activeRoomIndex >= this.rooms.length) {
        this.activeRoomIndex = Math.max(0, this.rooms.length - 1)
      }
    },

    SET_ACTIVE_ROOM(index: number) {
      if (index >= 0 && index < this.rooms.length) {
        this.activeRoomIndex = index
      }
    },

    UPDATE_ACTIVE_ROOM(payload: Partial<RoomState>) {
      const room = this.rooms[this.activeRoomIndex]
      if (room) Object.assign(room, payload)
    },

    UPDATE_ROOM(index: number, payload: Partial<RoomState>) {
      const room = this.rooms[index]
      if (room) Object.assign(room, payload)
    },

    // ── 全局设置 ──
    UPDATE_STYLE(payload: any) {
      const objKey = `${payload.prop}_lv${payload.role}`
      ;(this as any)[objKey] = { ...(this as any)[objKey], ...payload.style }
    },

    UPDATE_CONFIG(payload: Record<string, any>) {
      for (const key in payload) {
        ;(this as any)[key] = payload[key]
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
        const newData = { ...(this as any)[objKey] }
        delete newData['-webkit-text-stroke-width']
        delete newData['-webkit-text-stroke-color']
        ;(this as any)[objKey] = newData
      })
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
