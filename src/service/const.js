const path = require('path')
const fs = require('fs')
const YAML = require('yaml')
const electron = require('electron')

const config = fs.readFileSync(`config.yaml`, 'utf8')
export const version = (electron.app || electron.remote.app).getVersion()

const OPTION_CONFIG = YAML.parse(config)

export const USER_DATA_PATH = path.join((electron.app || electron.remote.app).getPath('userData'), '/data')
console.log(USER_DATA_PATH)
export const DEFAULT_RECORD_DIR = path.join((electron.app || electron.remote.app).getPath('exe'), '../record')
console.log(DEFAULT_RECORD_DIR)

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
};

export const GUARD_ICON_1 = "https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard1.png@44w_44h.webp"
export const GUARD_ICON_2 = "https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard2.png@44w_44h.webp"
export const GUARD_ICON_3 = "https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard3.png@44w_44h.webp"

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
};

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

export const EXAMPLE_MESSAGES = [
  {
    cmd: 'EXAMPLE_COMMENT',
    payload: {
      _id: 1,
      id: 1,
      category: "comment",
      uid: "123456",
      uname: "bli_123456",
      content: "这是一条测试弹幕哟～",
      role: 3,
      similar: 1,
      medalName: '测试者',
      "medalLevel": 6,
      "medalColorBorder": "#5d7b9e",
      "medalColorStart": "#5d7b9e",
      "medalColorEnd": "#5d7b9e"
    }
  },
  {
    cmd: 'EXAMPLE_COMMENT',
    payload: {
      _id: 2,
      id: 2,
      role: 0,
      uid: "654321",
      uname: "bli_654321",
      category: "comment",
      content: "～哟幕弹试测条一是这",
    }
  },
  {
    cmd: 'EXAMPLE_SUPER_CHAT',
    payload: {
      _id: 6,
      id: 6,
      uid: "12345",
      uname: "bli_12345",
      category: "superChat",
      content: "这是一条测试SuperChat哟～",
      contentJPN: "これはテスト用のスパチャだよ〜",
      price: 50,
      totalPrice: 50,
      role: 0,
      type: 3,
      coinType: 1
    }
  },
  // {
  //   id: 7,
  //   type: "gift",
  //   uid: 12345,
  //   name: 'bli_12345',
  //   avatar: DEFAULT_AVATAR,
  //   price: 2,
  //   giftNumber: 50,
  //   totalPrice: 100,
  //   giftName: '测试礼物'
  // },
  {
    cmd: 'EXAMPLE_GIFT',
    payload: {
      _id: 8,
      id: 999999,
      category: "gift",
      uid: 777777,
      uname: 'bli_777777',
      type: 2,
      price: 198,
      count: 1,
      totalPrice: 198,
      name: '舰长',
      role: 1,
      coinType: 1
    }
  }
]

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

  message_lv0: {
    background: 'rgba(0,0,0,0)'
  },
  name_lv0: {
    'font-size': '16px',
    '-webkit-text-stroke-width': '0px',
    '-webkit-text-stroke-color': 'white',
    color: 'white'
  },
  comment_lv0: {
    'font-size': '16px',
    color: 'white',
    "-webkit-text-stroke-color": 'rgba(0,0,0,0)'
  },

  message_lv3: {
    background: 'rgba(0,0,0,0)'
  },
  name_lv3: {
    'font-size': '16px',
    '-webkit-text-stroke-width': '0px',
    '-webkit-text-stroke-color': 'crimson',
    color: 'white'
  },
  comment_lv3: {
    'font-size': '16px',
    color: 'white',
    "-webkit-text-stroke-color": 'rgba(0,0,0,0)'
  },

  message_lv2: {
    background: 'rgba(0,0,0,0)'
  },
  name_lv2: {
    'font-size': '16px',
    '-webkit-text-stroke-width': '0.2px',
    '-webkit-text-stroke-color': 'crimson',
    color: 'white'
  },
  comment_lv2: {
    'font-size': '16px',
    color: 'white',
    "-webkit-text-stroke-color": 'rgba(0,0,0,0)'
  },

  message_lv1: {
    background: 'rgba(0,0,0,0)'
  },
  name_lv1: {
    'font-size': '16px',
    '-webkit-text-stroke-width': '0.2px',
    '-webkit-text-stroke-color': 'crimson',
    color: 'white'
  },
  comment_lv1: {
    'font-size': '16px',
    color: 'white',
    "-webkit-text-stroke-color": 'rgba(0,0,0,0)'
  },
}
export const DEFAULT_CONFIG = {
  roomId: 1,
  displayRoomId: 1,
  isConnected: false,
  guardNumber: 0,
  recordDir: "",
  isWithCookie: false,
  isAutoRecord: false,
  onlyMyselfRoom: true,
  isWatchLottery: false,
  optionstring: "{A}\n{B}\n{C}",
  historyRooms: [],
  isAutoReply: false,
  fontWeight: 'normal',
  autoReplyRules: [
  ],
  borderImages: [],
  colors: [],
  userInfoFrequencyLimit: 1000,
  onTopLevel: 'floating',
  isOnTopForce: false,
  messageSettings: [{
    type: 'guard',
    isShow: true,
  },
  {
    type: 'medal',
    isShow: true,
  },
  {
    type: 'avatar',
    isShow: true,
    size: 24,
  },
  {
    type: 'name',
    isShow: true,
  },
  {
    type: 'comment',
    isShow: true,
  }],
}

export const DEFAULT_SERVER_CONFIG = {
  ...DEFAULT_STYLE,
  roomId: 1,
  isConnected: false,
  // autoReplyRules: [{
  //   priority: 0,
  //   text: '',
  //   onlyGold: true
  // }],
  USER_DATA_PATH,
  PORT: PORT,
  EXAMPLE_MESSAGES: EXAMPLE_MESSAGES,
  SAVE_ALL_BILI_MESSAGE,
  HTML_PATH: OPTION_CONFIG.DANMAKU_RENDER_PATH || path.join(__dirname, '../../node_modules/@tokine/bilibili-danmaku-page'),
  // HTML_PATH: path.join(__dirname, '../../node_modules/@tokine/bilibili-bridge/node_modules/@tokine/bilibili-danmaku-page'),
}