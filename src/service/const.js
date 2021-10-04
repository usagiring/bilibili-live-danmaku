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
  isShowHeadline: true,
  optionstring: "{A}\n{B}\n{C}",
  historyRooms: [],
  isAutoReply: false,
  fontWeight: 'normal',
  autoReplyRules: [
  ],
  borderImages: [
    {
      isAdaptContent: false,
      dataUrl: "data:image/png;base64,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",
      isSelected: false,
      'border-width': 15,
      'border-image-width': '5',
      'border-image-slice': '55',
      'border-image-repeat': 'stretch',
      'border-image-outset': '0',
    }
  ],
  colors: [],
  userInfoFrequencyLimit: 1000,
  onTopLevel: 'floating',
  isOnTopForce: false,
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