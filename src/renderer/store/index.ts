import { createPinia, defineStore } from 'pinia'
import { DEFAULT_STYLE } from '../../service/const'

export const useConfigStore = defineStore('config', {
  state: () => ({
    roomId: 1,
    realRoomId: 1, // === roomId
    displayRoomId: 1,
    isConnected: false,
    guardNumber: 0,
    recordDir: "",
    isWithCookie: false,
    isAutoRecord: false,
    onlyMyselfRoom: true,
    isWatchLottery: false,
    isShowHeadline: true,
    optionstring: "{A}\n{B}\n{C}",
    voteOptions: [],
    historyRooms: [],
    isAutoReply: false,
    fontWeight: 'normal',
    signInMessage: '',
    onlyTodayZeroIntimacy: true,
    isLiveWindowAlwaysOnTop: false,
    isScrollDanmakuWindowAlwaysOnTop: false,
    liveWindowOpacity: 1,
    liveWindowId: null,
    danmakuWindowId: null,
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
    scrollDanmakuWindowId: null,
    scrollDanmakuWidth: 600,
    scrollDanmakuHeight: 600,
    scrollDanmakuX: 600,
    scrollDanmakuY: 600,
    scrollDanmakuBackground: "rgba(0, 0, 0, 0.3)",
    scrollDanmakuOpacity: 100,
    scrollDanmakuStyleExtend: 'self',
    scrollDanmakuEmojiSize: 60,
    ASRWindowId: null,
    ASRLineCount: 5,
    emojiSize: 24,
    liveVolume: 1,
    ffmpegExe: '',
    aliAppKeys: [],
    muteCommandSetting: {
      enable: false,
      roles: [],
      keyword: '',
      hintText: '',
      useHintText: false,
    },
    autoReplyRules: [
    ],
    borderImages: [
      {
        isAdaptContent: false,
        dataUrl: "data:image/gif;base64,R0lGODlhggCCAPf/AP/4yf/Kjv/Wyf/m29H90f/++P/75P/KwP/azf/+9v/86+3+6s39zv/hubn9wfHx8f/t1P/98Pz//P/50v/86f/oyf++fP/4zcH9xf/Fhv/74NX91ej+5v/97v/86Jb/tPL+8P/98v/Wo//85v72w//51f/73sb9yf/AvP/x3qX+uf/15f/62P/74v/07vj+9v/50OD+3qD+tv/62rX9v//kwJL/s//63f/s0v/CvP+8euX+4v/OlP/7+Nz92v+6d/b+9cj9yv/+9f/brf++u//Mkf/Gvv/es//e0f/Owtr92PD+7v/69P/qzf/mxd793P/QxZr+tf/cz/T+8v/69v/47v/w6P/Evef95Jz+tv/Cgv/SxpT/tP/8+P/z7P/28P/r4P/o3f/etf/z4aj+uf/49OL+4P/Tnf/p3r79xP/v5q79vLH9vf/i1//26v/Iv//Rmqz9up7+tpj+tP/s4v/89v/Yy/X19f/Af//Bgf/w2/r21e7+6//38v/Hicr9zNf91v/v2P/h1P32zf/Xpbz9w/+8eP/99P/aqv/61vr0zvz0yP/y6qL+t+r+6P/u5fnxwf/68v/gtv/PxPz67P341v+5dZH/s//3xP+7uv+6uv///u7u7v/3xf39/f///P+8uv/++v/3xv/+/f///f/3x//++//4yuzs7Pj4+P/4y/z/+////5T/s/+9uv/4zv/8+v/+/P/9+//+/v/51v/4z6T+t//5z/7//vv/+v/9+v/9/P/Eg/+7d/n/9/r/+f/Un/3//f+9u/f+9v/489T90/7+/v/k1//59bP9vv/Gvf/Ii8T9x/X+8//58P/NwrL9vf//+//Ux//Fvf/x6f/n3P/37P/jvv/Sxav9uv/Lwbf9wP+/u//q3//Qw//07f/t5P752P/Ql//Yp//j1//kv6r+uv/i1fr6+vbwy/7+/Pz1x/z0wvzzwfr23f/61f352P32xf342//60/z43P753v354P332Pv43P/+8f/g0///+v/Rxf73xv74z////yH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDcuMC1jMDAwIDc5LmRhYmFjYmIsIDIwMjEvMDQvMTQtMDA6Mzk6NDQgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjg3NzkxMzNEMjVCRTExRUM4NkJDQzUwNzU2MThEOEU4IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjg3NzkxMzNDMjVCRTExRUM4NkJDQzUwNzU2MThEOEU4IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCAyMi41IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MzU2MmVhMzgtYzdhYi01ZTQ3LWI2OGMtMzZjOWYwNTk4YjI2IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MzU2MmVhMzgtYzdhYi01ZTQ3LWI2OGMtMzZjOWYwNTk4YjI2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp6Ofm5eTj4uHg397d3Nva2djX1tXU09LR0M/OzczLysnIx8bFxMPCwcC/vr28u7q5uLe2tbSzsrGwr66trKuqqainpqWko6KhoJ+enZybmpmYl5aVlJOSkZCPjo2Mi4qJiIeGhYSDgoGAf359fHt6eXh3dnV0c3JxcG9ubWxramloZ2ZlZGNiYWBfXl1cW1pZ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",
        isSelected: false,
        'border-width': 15,
        'border-image-width': '1.5',
        'border-image-slice': '50',
        'border-image-repeat': 'stretch',
        'border-image-outset': '0',
      }
    ],
    colors: [],
    userInfoFrequencyLimit: 1000,
    waitingSpeakerCount: 0,
    onTopLevel: 'floating',
    isOnTopForce: false,
    disableIgnoreMouseEvent: false,
    audioFrom: 'livestream',
    mtFromLang: '',
    mtToLang: '',
    disableMircrophotoNoticeMessage: false,
    messageSettings: [
      {
        type: 'avatar',
        isShow: true,
        size: 24,
      },
      {
        type: 'guard',
        isShow: true,
      },
      {
        type: 'medal',
        isShow: true,
      },
      {
        type: 'name',
        isShow: true,
      },
      {
        type: 'colon',
        isShow: true
      },
      {
        type: 'comment',
        isShow: true,
      }
    ],
    aliAccessKeyId: '',
    aliAccessKeySecret: '',
    aliAppKey: '',

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
