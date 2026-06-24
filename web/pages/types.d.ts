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
  messageSlots: {
    type: string
    isShow: boolean
  }[]
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

interface SSEPayload {}

interface GiftExtra {
  id: string
  type: string
  name: string
  price: number
  count: number
  coinType?: 'gold' | 'silver'
  priceProperties?: {
    colors: string[]
    duration: number
  }
  batchComboId?: string
  totalPrice?: number
}

interface Message {
  id: number
  content: string // 原始消息文本（弹幕文本 / 礼物名称 / 进入房间等）
  color?: string | null // 弹幕颜色（十六进制字符串）
  category: 'comment' | 'gift' | 'guard' | 'superchat' | 'interact'
  type?: number | null
  sendAt: number // 发送时间戳 (ms)
  roomId: string
  clientId?: string
  userId: string
  username: string // 用户名
  usernameColor?: string | null // 用户名颜色
  roles?: number[] // 身份标识数组
  face?: string // 头像 URL
  emots?: Record<string, { url: string; height?: number }> | null // 表情映射
  gift?: GiftExtra | null
  medal?: {
    name: string
    level: number
    anchor?: number
    roomId: string
    color: {
      bg: string
      level: string
      border: string
      text: string
    }
  } | null
  interact?: { type: number } | null
  createdAt: number
  // ── 运行时计算字段 ──

  isHover?: boolean
  styleSuffix?: string
  anchorIcon?: string
  isAdmin?: boolean
  similar?: number
  splitContent?: string[]
  emojiUrl?: string | null
  voiceUrl?: string | null
  contentJPN?: string | null
  similarColor?: string
  fileDuration?: number | null
}
