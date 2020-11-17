const YAML = require('yaml')
const fs = require('fs')
const file = fs.readFileSync(`config.yaml`, 'utf8')
const OPTION_CONFIG = YAML.parse(file)
const path = require('path')

const electron = require('electron')
export const USER_DATA_PATH = path.join((electron.app || electron.remote.app).getPath('userData'), '/data')
console.log(USER_DATA_PATH)

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
    id: 1,
    type: "comment",
    uid: "123456",
    name: "bli_123456",
    comment: "这是一条测试弹幕哟～",
    avatar: DEFAULT_AVATAR,
    role: 3,
    similar: 1
  },
  {
    id: 2,
    uid: "654321",
    name: "bli_654321",
    type: "comment",
    comment: "～哟幕弹试测条一是这",
    avatar: DEFAULT_AVATAR,
    role: 0
  },
  {
    id: 6,
    uid: "12345",
    name: "bli_12345",
    type: "superChat",
    comment: "这是一条测试SuperChat哟～",
    commentJPN: "これはテスト用のスパチャだよ〜",
    price: 50,
    totalPrice: 50,
    avatar: DEFAULT_AVATAR,
    role: 0
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
    id: 8,
    type: "gift",
    uid: 777777,
    name: 'bli_777777',
    avatar: DEFAULT_AVATAR,
    isGuardGift: true,
    price: 198,
    giftNumber: 1,
    totalPrice: 198,
    giftName: '舰长'
  }
]

export const COLORS = OPTION_CONFIG.COLORS || ['crimson', 'darkorange', 'moccasin', 'forestgreen', 'darkcyan', 'dodgerblue', 'violet']