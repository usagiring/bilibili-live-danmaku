import { DmRawStyle, LiveConfig } from '@tokine/shared/types.js'

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
  medalId?: string
  isRecording?: boolean
  recordBps?: string
}

interface User {
  id?: string
  face?: string
  cookie: string
  refreshToken: string
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

// interface LiveConfig {
//   isWindowAlwaysOnTop: boolean
//   windowOpacity: number
//   windowBackground: string
//   isWithCookie: boolean
//   ignoreMouseEvent?: boolean
// }

interface MessageConfig {
  isRealTimeMode: boolean
  // isShowSilverGift: boolean
  // isShowUserSpaceLink: boolean
  isShowUserId: boolean
  isShowSendAt: boolean
  isShowInteract: boolean
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
  quality: number
  isAutoRecord: boolean
}

export interface VoteConfig {
  options: {
    value: string
    description: string
  }[]
  isAccurateMatch: boolean
  isAllowReVote: boolean
  duration: number
}

export interface ReplyRuleTag {
  id: string
  key: string
  name: string
  kind: 'condition' | 'action'
  description?: string
  data?: any
  display?: string
}

export interface AutoReplyRule {
  id: string
  roomId: string
  type: string
  text: string
  sortOrder?: number
  isEnable: boolean
  tags: ReplyRuleTag[]
}

interface AIConfig {
  // roomId: string
  speechToText: {
    model: {
      name: string
    }
    vad: {
      minSpeechDuration: number
      minSilenceDuration: number
      maxSpeechDuration: number
    }
  }
}

export interface ClientConfig {
  id: string
  signInMessage: string
  isNeedRefreshCookieCache: boolean
  waitingSpeakerCount: number
  isRoomPanelCollapsed?: boolean

  user?: User
  rooms: Room[]
  isRecording?: boolean
  windows: Window[]
  providers: Provider[]
  dmStyle?: DmStyle
  dmRawStyle?: DmRawStyle
  liveConfig?: LiveConfig
  messageConfig: MessageConfig
  recordConfig?: RecordConfig
  asrConfig?: AsrConfig
  mtConfig?: MtConfig
  chartConfig?: ChartConfig
  voteConfig: VoteConfig
  autoReplyRule: Record<string, AutoReplyRule>
  AIConfig: AIConfig
}

export interface StoreConfig {
  id: string
  rooms: Room[]
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

export interface Speaker {
  text: string
  voice: string
  speed: number
}
