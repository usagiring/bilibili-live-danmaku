interface DmStyle {
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

interface SSEPayload {
  cmd: string,
  payload: any,
}

interface GiftExtra {
  id: number
  name: string
  price: number
  count: number
  coinType?: 'gold' | 'silver'
  priceProperties?: {
    colors: string[]
    duration: number
  }
  totalPrice?: number
}

interface Message {
  id: number
  content: string                   // 原始消息文本（弹幕文本 / 礼物名称 / 进入房间等）
  color?: string             // 弹幕颜色（十六进制字符串）
  category: 'comment' | 'gift' | 'guard' | 'superchat' | 'interact'
  type?: number
  sendAt: number                    // 发送时间戳 (ms)
  roomId: string
  clientId?: string
  userId: string
  username: string                  // 用户名
  usernameColor?: string     // 用户名颜色
  roles?: number[]           // 身份标识数组
  face?: string              // 头像 URL
  emots?: Record<string, { url: string; height?: number }> // 表情映射
  gift?: GiftExtra
  medal?: { name: string; level: number; guard: number }
  interact?: { type: number }
  createdAt: number
  // ── 运行时计算字段 ──

  isHover?: boolean
  styleSuffix?: string
  anchorIcon?: string
  isAdmin?: boolean
  similar?: number

  // splitContent?: string[]
  emojiUrl?: string
  voiceUrl?: string
  contentJPN?: string
  // count?: number
  // name?: string
  fileDuration?: number
  // totalPrice?: number
  // priceProperties?: { time?: number; colors?: string[] }
}