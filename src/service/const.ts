const path = require('path')
const fs = require('fs')
const YAML = require('yaml')
const config = fs.readFileSync(`config.yaml`, 'utf8')
const OPTION_CONFIG = YAML.parse(config)

export const DEFAULT_AVATAR = 'https://static.hdslb.com/images/member/noface.gif'

export const PRICE_PROPERTIES = OPTION_CONFIG.PRICE_PROPERTIES || {
  1: {
    backgroundColor: "#EDF5FF",
    backgroundPriceColor: "#7497CD",
    backgroundBottomColor: "#2A60B2",
    time: 60000,
  },
  2: {
    backgroundColor: "#DBFFFD",
    backgroundPriceColor: "#7DA4BD",
    backgroundBottomColor: "#427D9E",
    time: 120000,
  },
  3: {
    backgroundColor: "#FFF1C5",
    backgroundPriceColor: "gold",
    backgroundBottomColor: "#E2B52B",
    time: 300000,
  },
  4: {
    backgroundColor: "rgb(255,234,210)",
    backgroundPriceColor: "rgb(255,234,210)",
    backgroundBottomColor: "rgb(244,148,67)",
    time: 1800000,
  },
  5: {
    backgroundColor: "rgb(255,231,228)",
    backgroundPriceColor: "rgb(255,231,228)",
    backgroundBottomColor: "rgb(229,77,77)",
    time: 3600000,
  },
  6: {
    backgroundColor: "rgb(255,216,216)",
    backgroundPriceColor: "rgb(255,216,216)",
    backgroundBottomColor: "rgb(171,26,50)",
    time: 7200000,
  },
}

export const GUARD_ICON_1 = "https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard1.png"
export const GUARD_ICON_2 = "https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard2.png"
export const GUARD_ICON_3 = "https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard3.png"

export const GUARD_ICON_MAP = {
  1: GUARD_ICON_1,
  2: GUARD_ICON_2,
  3: GUARD_ICON_3,
}

export const GUARD_LEVEL_MAP = {
  0: "normal",
  1: "governor",
  2: "admiral",
  3: "captain",
}

export const INTERACT_TYPE = {
  1: '进入',
  2: '关注',
  3: '分享'
}

export const ENTER_ROOM_TYPE = {
  1: '进入',
  2: '光临'
}

export const GET_USER_INFO_FREQUENCY_LIMIT = OPTION_CONFIG.GET_USER_INFO_FREQUENCY_LIMIT || 1000

export const COLORS = OPTION_CONFIG.COLORS || ['crimson', 'darkorange', 'moccasin', 'forestgreen', 'darkcyan', 'dodgerblue', 'violet']

export const DEFAULT_FONTS = [
  'inherit',
  'initial',
  'unset'
]

export const DEFAULT_COMMON_FONT_FAMILIES = [
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
]

export const IPC_CHECK_FOR_UPDATE = 'IPC_CHECK_FOR_UPDATE'
export const IPC_UPDATE_AVAILABLE = 'IPC_UPDATE_AVAILABLE'
export const IPC_DOWNLOAD_UPDATE = 'IPC_DOWNLOAD_UPDATE'
export const IPC_DOWNLOAD_PROGRESS = 'IPC_DOWNLOAD_PROGRESS'
export const IPC_UPDATE_DOWNLOADED = 'IPC_UPDATE_DOWNLOADED'
export const IPC_LIVE_WINDOW_PLAY = 'IPC_LIVE_WINDOW_PLAY'
export const IPC_LIVE_WINDOW_CLOSE = 'IPC_LIVE_WINDOW_CLOSE'
export const IPC_GET_USER_PATH = 'IPC_GET_USER_PATH'
export const IPC_GET_VERSION = 'IPC_GET_VERSION'
export const IPC_GET_EXE_PATH = 'IPC_GET_EXE_PATH'
export const IPC_ENABLE_WEB_CONTENTS = 'IPC_ENABLE_WEB_CONTENTS'
export const IPC_LIVE_WINDOW_ON_TOP = 'IPC_LIVE_WINDOW_ON_TOP'
export const SET_DANMAKU_ON_TOP_LEVEL = OPTION_CONFIG.SET_DANMAKU_ON_TOP_LEVEL || 'floating'
export const MAX_HISTORY_ROOM = OPTION_CONFIG.MAX_HISTORY_ROOM || 9
export const PORT = OPTION_CONFIG.PORT || 8081
export const BASE_URL = `http://127.0.0.1:${PORT}`
export const BASE_WS_URL = `ws://127.0.0.1:${PORT}`
const SAVE_ALL_BILI_MESSAGE = OPTION_CONFIG.SAVE_ALL_BILI_MESSAGE || false

export const DEFAULT_STYLE = {
  isShowAvatar: true,
  isShowMemberShipIcon: true,
  isShowFanMedal: true,
  avatarSize: 24,
  combineSimilarTime: 3000,
  hiddenExpiredTime: 0,
  showHeadlineThreshold: 30,
  isShowInteractInfo: false,
  showGiftCardThreshold: 0,
  isShowSilverGift: false,
  opacity: 1,
  danmakuFont: 'unset',
  isUseMiniGiftCard: false,
  background: "rgba(0, 0, 0, 0.3)",
  adminIcon: "ios-home-outline",
  isShowAdminIcon: false,
  adminIconColor: 'coral',
  danmakuChannel: 1,
  channelDelayTime: 20,

  message_lv0: {
    background: 'rgba(0,0,0,0)'
  },
  name_lv0: {
    'font-size': '16px',
    '--textStrokeWidth': '0px',
    '--textStrokeColor': 'white',
    color: 'white'
  },
  comment_lv0: {
    'font-size': '16px',
    color: 'white',
    "--textStrokeColor": 'rgba(0,0,0,1)'
  },

  message_lv3: {
    background: 'rgba(106,106,106,0.6)'
  },
  name_lv3: {
    'font-size': '16px',
    '--textStrokeWidth': '0px',
    '--textStrokeColor': 'crimson',
    color: 'white'
  },
  comment_lv3: {
    'font-size': '16px',
    color: 'white',
    "--textStrokeColor": 'rgba(0,0,0,1)'
  },

  message_lv2: {
    background: 'rgba(106,106,106,0.6)'
  },
  name_lv2: {
    'font-size': '16px',
    '--textStrokeWidth': '0.2px',
    '--textStrokeColor': 'crimson',
    color: 'white'
  },
  comment_lv2: {
    'font-size': '16px',
    color: 'white',
    "--textStrokeColor": 'rgba(0,0,0,1)'
  },

  message_lv1: {
    background: 'rgba(106,106,106,0.6)'
  },
  name_lv1: {
    'font-size': '16px',
    '--textStrokeWidth': '0.2px',
    '--textStrokeColor': 'crimson',
    color: 'white'
  },
  comment_lv1: {
    'font-size': '16px',
    color: 'white',
    "--textStrokeColor": 'rgba(0,0,0,1)'
  },

  message_lvadmin: {
    background: 'rgba(0,0,0,0)'
  },
  name_lvadmin: {
    'font-size': '16px',
    '--textStrokeWidth': '0px',
    '--textStrokeColor': 'white',
    color: 'white'
  },
  comment_lvadmin: {
    'font-size': '16px',
    color: 'white',
    "--textStrokeColor": 'rgba(0,0,0,1)'
  },
}
export const DEFAULT_CONFIG = {
  roomId: 1,
  realRoomId: 1,
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
}

export const DEFAULT_SERVER_CONFIG = {
  ...DEFAULT_STYLE,
  roomId: 1,
  isConnected: false,
  PORT: PORT,
  SAVE_ALL_BILI_MESSAGE,
  HTML_PATH: process.env.NODE_ENV === 'development' ? path.join(__dirname, '../../danmaku-dist') : OPTION_CONFIG.DANMAKU_RENDER_PATH || path.join(__dirname, 'danmaku'),
  // HTML_PATH: path.join(__dirname, '../../node_modules/@tokine/bilibili-bridge/node_modules/@tokine/bilibili-danmaku-page'),
}


export const ICONS = [
  "ios-add",
  "md-add",
  "ios-add-circle",
  "ios-add-circle-outline",
  "md-add-circle",
  "ios-alarm",
  "ios-alarm-outline",
  "md-alarm",
  "ios-albums",
  "ios-albums-outline",
  "md-albums",
  "ios-alert",
  "ios-alert-outline",
  "md-alert",
  "ios-american-football",
  "ios-american-football-outline",
  "md-american-football",
  "ios-analytics",
  "ios-analytics-outline",
  "md-analytics",
  "logo-android",
  "logo-angular",
  "ios-aperture",
  "ios-aperture-outline",
  "md-aperture",
  "logo-apple",
  "ios-apps",
  "ios-apps-outline",
  "md-apps",
  "ios-appstore",
  "ios-appstore-outline",
  "md-appstore",
  "ios-archive",
  "ios-archive-outline",
  "md-archive",
  "ios-arrow-back",
  "md-arrow-back",
  "ios-arrow-down",
  "md-arrow-down",
  "ios-arrow-dropdown",
  "md-arrow-dropdown",
  "ios-arrow-dropdown-circle",
  "md-arrow-dropdown-circle",
  "ios-arrow-dropleft",
  "md-arrow-dropleft",
  "ios-arrow-dropleft-circle",
  "md-arrow-dropleft-circle",
  "ios-arrow-dropright",
  "md-arrow-dropright",
  "ios-arrow-dropright-circle",
  "md-arrow-dropright-circle",
  "ios-arrow-dropup",
  "md-arrow-dropup",
  "ios-arrow-dropup-circle",
  "md-arrow-dropup-circle",
  "ios-arrow-forward",
  "md-arrow-forward",
  "ios-arrow-round-back",
  "md-arrow-round-back",
  "ios-arrow-round-down",
  "md-arrow-round-down",
  "ios-arrow-round-forward",
  "md-arrow-round-forward",
  "ios-arrow-round-up",
  "md-arrow-round-up",
  "ios-arrow-up",
  "md-arrow-up",
  "ios-at",
  "ios-at-outline",
  "md-at",
  "ios-attach",
  "md-attach",
  "ios-backspace",
  "ios-backspace-outline",
  "md-backspace",
  "ios-barcode",
  "ios-barcode-outline",
  "md-barcode",
  "ios-baseball",
  "ios-baseball-outline",
  "md-baseball",
  "ios-basket",
  "ios-basket-outline",
  "md-basket",
  "ios-basketball",
  "ios-basketball-outline",
  "md-basketball",
  "ios-battery-charging",
  "md-battery-charging",
  "ios-battery-dead",
  "md-battery-dead",
  "ios-battery-full",
  "md-battery-full",
  "ios-beaker",
  "ios-beaker-outline",
  "md-beaker",
  "ios-beer",
  "ios-beer-outline",
  "md-beer",
  "ios-bicycle",
  "md-bicycle",
  "logo-bitcoin",
  "ios-bluetooth",
  "md-bluetooth",
  "ios-boat",
  "ios-boat-outline",
  "md-boat",
  "ios-body",
  "ios-body-outline",
  "md-body",
  "ios-bonfire",
  "ios-bonfire-outline",
  "md-bonfire",
  "ios-book",
  "ios-book-outline",
  "md-book",
  "ios-bookmark",
  "ios-bookmark-outline",
  "md-bookmark",
  "ios-bookmarks",
  "ios-bookmarks-outline",
  "md-bookmarks",
  "ios-bowtie",
  "ios-bowtie-outline",
  "md-bowtie",
  "ios-briefcase",
  "ios-briefcase-outline",
  "md-briefcase",
  "ios-browsers",
  "ios-browsers-outline",
  "md-browsers",
  "ios-brush",
  "ios-brush-outline",
  "md-brush",
  "logo-buffer",
  "ios-bug",
  "ios-bug-outline",
  "md-bug",
  "ios-build",
  "ios-build-outline",
  "md-build",
  "ios-bulb",
  "ios-bulb-outline",
  "md-bulb",
  "ios-bus",
  "ios-bus-outline",
  "md-bus",
  "ios-cafe",
  "ios-cafe-outline",
  "md-cafe",
  "ios-calculator",
  "ios-calculator-outline",
  "md-calculator",
  "ios-calendar",
  "ios-calendar-outline",
  "md-calendar",
  "ios-call",
  "ios-call-outline",
  "md-call",
  "ios-camera",
  "ios-camera-outline",
  "md-camera",
  "ios-car",
  "ios-car-outline",
  "md-car",
  "ios-card",
  "ios-card-outline",
  "md-card",
  "ios-cart",
  "ios-cart-outline",
  "md-cart",
  "ios-cash",
  "ios-cash-outline",
  "md-cash",
  "ios-chatboxes",
  "ios-chatboxes-outline",
  "md-chatboxes",
  "ios-chatbubbles",
  "ios-chatbubbles-outline",
  "md-chatbubbles",
  "ios-checkbox",
  "ios-checkbox-outline",
  "md-checkbox",
  "md-checkbox-outline",
  "ios-checkmark",
  "md-checkmark",
  "ios-checkmark-circle",
  "ios-checkmark-circle-outline",
  "md-checkmark-circle",
  "md-checkmark-circle-outline",
  "logo-chrome",
  "ios-clipboard",
  "ios-clipboard-outline",
  "md-clipboard",
  "ios-clock",
  "ios-clock-outline",
  "md-clock",
  "ios-close",
  "md-close",
  "ios-close-circle",
  "ios-close-circle-outline",
  "md-close-circle",
  "ios-closed-captioning",
  "ios-closed-captioning-outline",
  "md-closed-captioning",
  "ios-cloud",
  "ios-cloud-outline",
  "md-cloud",
  "ios-cloud-circle",
  "ios-cloud-circle-outline",
  "md-cloud-circle",
  "ios-cloud-done",
  "ios-cloud-done-outline",
  "md-cloud-done",
  "ios-cloud-download",
  "ios-cloud-download-outline",
  "md-cloud-download",
  "md-cloud-outline",
  "ios-cloud-upload",
  "ios-cloud-upload-outline",
  "md-cloud-upload",
  "ios-cloudy",
  "ios-cloudy-outline",
  "md-cloudy",
  "ios-cloudy-night",
  "ios-cloudy-night-outline",
  "md-cloudy-night",
  "ios-code",
  "md-code",
  "ios-code-download",
  "md-code-download",
  "ios-code-working",
  "md-code-working",
  "logo-codepen",
  "ios-cog",
  "ios-cog-outline",
  "md-cog",
  "ios-color-fill",
  "ios-color-fill-outline",
  "md-color-fill",
  "ios-color-filter",
  "ios-color-filter-outline",
  "md-color-filter",
  "ios-color-palette",
  "ios-color-palette-outline",
  "md-color-palette",
  "ios-color-wand",
  "ios-color-wand-outline",
  "md-color-wand",
  "ios-compass",
  "ios-compass-outline",
  "md-compass",
  "ios-construct",
  "ios-construct-outline",
  "md-construct",
  "ios-contact",
  "ios-contact-outline",
  "md-contact",
  "ios-contacts",
  "ios-contacts-outline",
  "md-contacts",
  "ios-contract",
  "md-contract",
  "ios-contrast",
  "md-contrast",
  "ios-copy",
  "ios-copy-outline",
  "md-copy",
  "ios-create",
  "ios-create-outline",
  "md-create",
  "ios-crop",
  "ios-crop-outline",
  "md-crop",
  "logo-css3",
  "ios-cube",
  "ios-cube-outline",
  "md-cube",
  "ios-cut",
  "ios-cut-outline",
  "md-cut",
  "logo-designernews",
  "ios-desktop",
  "ios-desktop-outline",
  "md-desktop",
  "ios-disc",
  "ios-disc-outline",
  "md-disc",
  "ios-document",
  "ios-document-outline",
  "md-document",
  "ios-done-all",
  "md-done-all",
  "ios-download",
  "ios-download-outline",
  "md-download",
  "logo-dribbble",
  "logo-dropbox",
  "ios-easel",
  "ios-easel-outline",
  "md-easel",
  "ios-egg",
  "ios-egg-outline",
  "md-egg",
  "logo-euro",
  "ios-exit",
  "ios-exit-outline",
  "md-exit",
  "ios-expand",
  "md-expand",
  "ios-eye",
  "ios-eye-outline",
  "md-eye",
  "ios-eye-off",
  "ios-eye-off-outline",
  "md-eye-off",
  "logo-facebook",
  "ios-fastforward",
  "ios-fastforward-outline",
  "md-fastforward",
  "ios-female",
  "md-female",
  "ios-filing",
  "ios-filing-outline",
  "md-filing",
  "ios-film",
  "ios-film-outline",
  "md-film",
  "ios-finger-print",
  "md-finger-print",
  "ios-flag",
  "ios-flag-outline",
  "md-flag",
  "ios-flame",
  "ios-flame-outline",
  "md-flame",
  "ios-flash",
  "ios-flash-outline",
  "md-flash",
  "ios-flask",
  "ios-flask-outline",
  "md-flask",
  "ios-flower",
  "ios-flower-outline",
  "md-flower",
  "ios-folder",
  "ios-folder-outline",
  "md-folder",
  "ios-folder-open",
  "ios-folder-open-outline",
  "md-folder-open",
  "ios-football",
  "ios-football-outline",
  "md-football",
  "logo-foursquare",
  "logo-freebsd-devil",
  "ios-funnel",
  "ios-funnel-outline",
  "md-funnel",
  "ios-game-controller-a",
  "ios-game-controller-a-outline",
  "md-game-controller-a",
  "ios-game-controller-b",
  "ios-game-controller-b-outline",
  "md-game-controller-b",
  "ios-git-branch",
  "md-git-branch",
  "ios-git-commit",
  "md-git-commit",
  "ios-git-compare",
  "md-git-compare",
  "ios-git-merge",
  "md-git-merge",
  "ios-git-network",
  "md-git-network",
  "ios-git-pull-request",
  "md-git-pull-request",
  "logo-github",
  "ios-glasses",
  "ios-glasses-outline",
  "md-glasses",
  "ios-globe",
  "ios-globe-outline",
  "md-globe",
  "logo-google",
  "logo-googleplus",
  "ios-grid",
  "ios-grid-outline",
  "md-grid",
  "logo-hackernews",
  "ios-hammer",
  "ios-hammer-outline",
  "md-hammer",
  "ios-hand",
  "ios-hand-outline",
  "md-hand",
  "ios-happy",
  "ios-happy-outline",
  "md-happy",
  "ios-headset",
  "ios-headset-outline",
  "md-headset",
  "ios-heart",
  "ios-heart-outline",
  "md-heart",
  "md-heart-outline",
  "ios-help",
  "md-help",
  "ios-help-buoy",
  "ios-help-buoy-outline",
  "md-help-buoy",
  "ios-help-circle",
  "ios-help-circle-outline",
  "md-help-circle",
  "ios-home",
  "ios-home-outline",
  "md-home",
  "logo-html5",
  "ios-ice-cream",
  "ios-ice-cream-outline",
  "md-ice-cream",
  "ios-image",
  "ios-image-outline",
  "md-image",
  "ios-images",
  "ios-images-outline",
  "md-images",
  "ios-infinite",
  "ios-infinite-outline",
  "md-infinite",
  "ios-information",
  "md-information",
  "ios-information-circle",
  "ios-information-circle-outline",
  "md-information-circle",
  "logo-instagram",
  "ios-ionic",
  "ios-ionic-outline",
  "md-ionic",
  "ios-ionitron",
  "ios-ionitron-outline",
  "md-ionitron",
  "logo-javascript",
  "ios-jet",
  "ios-jet-outline",
  "md-jet",
  "ios-key",
  "ios-key-outline",
  "md-key",
  "ios-keypad",
  "ios-keypad-outline",
  "md-keypad",
  "ios-laptop",
  "md-laptop",
  "ios-leaf",
  "ios-leaf-outline",
  "md-leaf",
  "ios-link",
  "ios-link-outline",
  "md-link",
  "logo-linkedin",
  "ios-list",
  "md-list",
  "ios-list-box",
  "ios-list-box-outline",
  "md-list-box",
  "ios-locate",
  "ios-locate-outline",
  "md-locate",
  "ios-lock",
  "ios-lock-outline",
  "md-lock",
  "ios-log-in",
  "md-log-in",
  "ios-log-out",
  "md-log-out",
  "ios-magnet",
  "ios-magnet-outline",
  "md-magnet",
  "ios-mail",
  "ios-mail-outline",
  "md-mail",
  "ios-mail-open",
  "ios-mail-open-outline",
  "md-mail-open",
  "ios-male",
  "md-male",
  "ios-man",
  "ios-man-outline",
  "md-man",
  "ios-map",
  "ios-map-outline",
  "md-map",
  "logo-markdown",
  "ios-medal",
  "ios-medal-outline",
  "md-medal",
  "ios-medical",
  "ios-medical-outline",
  "md-medical",
  "ios-medkit",
  "ios-medkit-outline",
  "md-medkit",
  "ios-megaphone",
  "ios-megaphone-outline",
  "md-megaphone",
  "ios-menu",
  "ios-menu-outline",
  "md-menu",
  "ios-mic",
  "ios-mic-outline",
  "md-mic",
  "ios-mic-off",
  "ios-mic-off-outline",
  "md-mic-off",
  "ios-microphone",
  "ios-microphone-outline",
  "md-microphone",
  "ios-moon",
  "ios-moon-outline",
  "md-moon",
  "ios-more",
  "ios-more-outline",
  "md-more",
  "ios-move",
  "md-move",
  "ios-musical-note",
  "ios-musical-note-outline",
  "md-musical-note",
  "ios-musical-notes",
  "ios-musical-notes-outline",
  "md-musical-notes",
  "ios-navigate",
  "ios-navigate-outline",
  "md-navigate",
  "ios-no-smoking",
  "ios-no-smoking-outline",
  "md-no-smoking",
  "logo-nodejs",
  "ios-notifications",
  "ios-notifications-outline",
  "md-notifications",
  "ios-notifications-off",
  "ios-notifications-off-outline",
  "md-notifications-off",
  "md-notifications-outline",
  "ios-nuclear",
  "ios-nuclear-outline",
  "md-nuclear",
  "ios-nutrition",
  "ios-nutrition-outline",
  "md-nutrition",
  "logo-octocat",
  "ios-open",
  "ios-open-outline",
  "md-open",
  "ios-options",
  "ios-options-outline",
  "md-options",
  "ios-outlet",
  "ios-outlet-outline",
  "md-outlet",
  "ios-paper",
  "ios-paper-outline",
  "md-paper",
  "ios-paper-plane",
  "ios-paper-plane-outline",
  "md-paper-plane",
  "ios-partly-sunny",
  "ios-partly-sunny-outline",
  "md-partly-sunny",
  "ios-pause",
  "ios-pause-outline",
  "md-pause",
  "ios-paw",
  "ios-paw-outline",
  "md-paw",
  "ios-people",
  "ios-people-outline",
  "md-people",
  "ios-person",
  "ios-person-outline",
  "md-person",
  "ios-person-add",
  "ios-person-add-outline",
  "md-person-add",
  "ios-phone-landscape",
  "md-phone-landscape",
  "ios-phone-portrait",
  "md-phone-portrait",
  "ios-photos",
  "ios-photos-outline",
  "md-photos",
  "ios-pie",
  "ios-pie-outline",
  "md-pie",
  "ios-pin",
  "ios-pin-outline",
  "md-pin",
  "ios-pint",
  "ios-pint-outline",
  "md-pint",
  "logo-pinterest",
  "ios-pizza",
  "ios-pizza-outline",
  "md-pizza",
  "ios-plane",
  "ios-plane-outline",
  "md-plane",
  "ios-planet",
  "ios-planet-outline",
  "md-planet",
  "ios-play",
  "ios-play-outline",
  "md-play",
  "logo-playstation",
  "ios-podium",
  "ios-podium-outline",
  "md-podium",
  "ios-power",
  "ios-power-outline",
  "md-power",
  "ios-pricetag",
  "ios-pricetag-outline",
  "md-pricetag",
  "ios-pricetags",
  "ios-pricetags-outline",
  "md-pricetags",
  "ios-print",
  "ios-print-outline",
  "md-print",
  "ios-pulse",
  "ios-pulse-outline",
  "md-pulse",
  "logo-python",
  "ios-qr-scanner",
  "md-qr-scanner",
  "ios-quote",
  "ios-quote-outline",
  "md-quote",
  "ios-radio",
  "ios-radio-outline",
  "md-radio",
  "ios-radio-button-off",
  "md-radio-button-off",
  "ios-radio-button-on",
  "md-radio-button-on",
  "ios-rainy",
  "ios-rainy-outline",
  "md-rainy",
  "ios-recording",
  "ios-recording-outline",
  "md-recording",
  "logo-reddit",
  "ios-redo",
  "ios-redo-outline",
  "md-redo",
  "ios-refresh",
  "md-refresh",
  "ios-refresh-circle",
  "ios-refresh-circle-outline",
  "md-refresh-circle",
  "ios-remove",
  "md-remove",
  "ios-remove-circle",
  "ios-remove-circle-outline",
  "md-remove-circle",
  "ios-reorder",
  "md-reorder",
  "ios-repeat",
  "md-repeat",
  "ios-resize",
  "md-resize",
  "ios-restaurant",
  "ios-restaurant-outline",
  "md-restaurant",
  "ios-return-left",
  "md-return-left",
  "ios-return-right",
  "md-return-right",
  "ios-reverse-camera",
  "ios-reverse-camera-outline",
  "md-reverse-camera",
  "ios-rewind",
  "ios-rewind-outline",
  "md-rewind",
  "ios-ribbon",
  "ios-ribbon-outline",
  "md-ribbon",
  "ios-rose",
  "ios-rose-outline",
  "md-rose",
  "logo-rss",
  "ios-sad",
  "ios-sad-outline",
  "md-sad",
  "logo-sass",
  "ios-school",
  "ios-school-outline",
  "md-school",
  "ios-search",
  "ios-search-outline",
  "md-search",
  "ios-send",
  "ios-send-outline",
  "md-send",
  "ios-settings",
  "ios-settings-outline",
  "md-settings",
  "ios-share",
  "ios-share-outline",
  "md-share",
  "ios-share-alt",
  "ios-share-alt-outline",
  "md-share-alt",
  "ios-shirt",
  "ios-shirt-outline",
  "md-shirt",
  "ios-shuffle",
  "md-shuffle",
  "ios-skip-backward",
  "ios-skip-backward-outline",
  "md-skip-backward",
  "ios-skip-forward",
  "ios-skip-forward-outline",
  "md-skip-forward",
  "logo-skype",
  "logo-snapchat",
  "ios-snow",
  "ios-snow-outline",
  "md-snow",
  "ios-speedometer",
  "ios-speedometer-outline",
  "md-speedometer",
  "ios-square",
  "ios-square-outline",
  "md-square",
  "md-square-outline",
  "ios-star",
  "ios-star-outline",
  "md-star",
  "ios-star-half",
  "md-star-half",
  "md-star-outline",
  "ios-stats",
  "ios-stats-outline",
  "md-stats",
  "logo-steam",
  "ios-stopwatch",
  "ios-stopwatch-outline",
  "md-stopwatch",
  "ios-subway",
  "ios-subway-outline",
  "md-subway",
  "ios-sunny",
  "ios-sunny-outline",
  "md-sunny",
  "ios-swap",
  "md-swap",
  "ios-switch",
  "ios-switch-outline",
  "md-switch",
  "ios-sync",
  "md-sync",
  "ios-tablet-landscape",
  "md-tablet-landscape",
  "ios-tablet-portrait",
  "md-tablet-portrait",
  "ios-tennisball",
  "ios-tennisball-outline",
  "md-tennisball",
  "ios-text",
  "ios-text-outline",
  "md-text",
  "ios-thermometer",
  "ios-thermometer-outline",
  "md-thermometer",
  "ios-thumbs-down",
  "ios-thumbs-down-outline",
  "md-thumbs-down",
  "ios-thumbs-up",
  "ios-thumbs-up-outline",
  "md-thumbs-up",
  "ios-thunderstorm",
  "ios-thunderstorm-outline",
  "md-thunderstorm",
  "ios-time",
  "ios-time-outline",
  "md-time",
  "ios-timer",
  "ios-timer-outline",
  "md-timer",
  "ios-train",
  "ios-train-outline",
  "md-train",
  "ios-transgender",
  "md-transgender",
  "ios-trash",
  "ios-trash-outline",
  "md-trash",
  "ios-trending-down",
  "md-trending-down",
  "ios-trending-up",
  "md-trending-up",
  "ios-trophy",
  "ios-trophy-outline",
  "md-trophy",
  "logo-tumblr",
  "logo-tux",
  "logo-twitch",
  "logo-twitter",
  "ios-umbrella",
  "ios-umbrella-outline",
  "md-umbrella",
  "ios-undo",
  "ios-undo-outline",
  "md-undo",
  "ios-unlock",
  "ios-unlock-outline",
  "md-unlock",
  "logo-usd",
  "ios-videocam",
  "ios-videocam-outline",
  "md-videocam",
  "logo-vimeo",
  "ios-volume-down",
  "md-volume-down",
  "ios-volume-mute",
  "md-volume-mute",
  "ios-volume-off",
  "md-volume-off",
  "ios-volume-up",
  "md-volume-up",
  "ios-walk",
  "md-walk",
  "ios-warning",
  "ios-warning-outline",
  "md-warning",
  "ios-watch",
  "md-watch",
  "ios-water",
  "ios-water-outline",
  "md-water",
  "logo-whatsapp",
  "ios-wifi",
  "ios-wifi-outline",
  "md-wifi",
  "logo-windows",
  "ios-wine",
  "ios-wine-outline",
  "md-wine",
  "ios-woman",
  "ios-woman-outline",
  "md-woman",
  "logo-wordpress",
  "logo-xbox",
  "logo-yahoo",
  "logo-yen",
  "logo-youtube",
  "ios-loading",
]