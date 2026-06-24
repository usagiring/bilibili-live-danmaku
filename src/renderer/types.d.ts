type StyleValue = Record<string, string>

interface Provider {
  type: string
  service: string
  appKey: string
  accessKeyId: string
  accessKeySecret: string
}

interface Room {
  id: string
  userId: string
  isAutoReply: boolean
  autoReplyRules: any[]
  voteOptions: Array<{ keyword: string; value: string }>
  realId?: string
  username?: string
  displayId?: string

  liveStatus?: number
  liveStream?: string
  face?: string
  isConnected?: boolean
  isActive?: boolean
  anchorNumber?: number
  fansNumber?: number
  fansclubNumber?: number
  ninkiNumber?: number
  watchedNumber?: number
  likeNumber?: number
  onlineNumber?: number
  userSpaceBanner?: string
  isInitialized?: boolean
}

interface User {
  id: string
  face: string
  cookie: string
}

interface Window {
  id: string
  type: 'live' | 'dm' | 'dmRaw' | 'asr'
  roomId: number

  x: number
  y: number
  width: number
  height: number
}

interface DmStyle {
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
  ignoreMouseEvent: boolean
  emojiSize: number
  messageSlots: {
    type: 'medal' | 'face' | 'name' | 'comment'
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

interface DmRawStyle {
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

interface LiveConfig {
  isWindowAlwaysOnTop: boolean
  windowOpacity: number
  windowBackground: string
  isWithCookie: boolean
  volume: number
}

interface MessageConfig {
  isRealTimeMode: boolean
  isShowUserSpaceLink: boolean
}

interface AsrConfig {
  showLineCount: number
  audioFrom: string
}

interface MtConfig {
  fromLang: string
  toLang: string
  disableMircrophotoNoticeMessage: boolean
}

interface ChartConfig {
  colors: string[]
}

interface RecordConfig {
  savePath: string
  quality: string
  isAutoRecord: boolean
}

export interface ClientConfig {
  id: string
  signInMessage: string
  isNeedRefreshCookieCache: boolean
  refreshToken: string
  waitingSpeakerCount: number
  user?: User
  rooms: Room[]
  isRecording?: boolean
  windows: Window[]
  providers: Provider[]
  dmStyle?: DmStyle
  dmRawStyle?: DmRawStyle
  liveConfig?: LiveConfig
  messageConfig?: MessageConfig
  recordConfig?: RecordConfig
  asrConfig?: AsrConfig
  mtConfig?: MtConfig
  chartConfig?: ChartConfig
}

interface RoomState {
  roomId: number
  realRoomId: number
  displayRoomId: number
  isConnected: boolean
  anchorNumber: number
  username: string
  avatar: string | null
  ninkiNumber: number
  fansNumber: number
  fansClubNumber: number
  liveStatus: number
  onlineNumber: number
  roomUserId: number
  watchedNumber: number
  likeNumber: number
  topPhoto: string
  medalId: number | null
  medalName: string
}
