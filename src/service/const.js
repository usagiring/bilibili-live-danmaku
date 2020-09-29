export const DEFAULT_AVATAR = 'https://static.hdslb.com/images/member/noface.gif'

// TODO 可配置文字颜色，避免显示不清
export const PRICE_PROPERTIES = {
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

export const GUARD_LEVEL_MAP = {
  0: "normal",
  1: "governor",
  2: "admiral",
  3: "captain",
};

// 限制获取头像频率，单位毫秒，避免 412 限制，1000 为比较安全的值
export const GET_USER_INFO_FREQUENCY_LIMIT = 1000

export const EXAMPLE_MESSAGES = [
  {
    id: 1,
    type: "comment",
    uid: "12345",
    name: "bli_22222222222",
    comment: "草",
    avatar: DEFAULT_AVATAR,
    role: 3,
    similar: 1
  },
  {
    id: 2,
    uid: "12346",
    name: "bli_11111111111",
    type: "comment",
    comment: "？？？？？？？？",
    avatar: DEFAULT_AVATAR,
    role: 0
  },
  {
    id: 6,
    uid: "12345",
    name: "bli_22222222222",
    type: "superChat",
    comment: "8888888888888888888",
    price: 50,
    totalPrice: 50,
    avatar: DEFAULT_AVATAR,
    role: 0
  },
  {
    id: 7,
    type: "gift",
    uid: 12345,
    name: 'bli_11111111111',
    avatar: DEFAULT_AVATAR,
    price: 6,
    giftNumber: 50,
    totalPrice: 300,
    giftName: '小红花'
  }
]