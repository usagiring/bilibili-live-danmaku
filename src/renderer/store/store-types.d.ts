/* eslint-disable */
/**
 * Pinia Store 完整类型声明
 * 由所有 useConfigStore() 访问的 key 汇总生成
 */

// ── 房间级别数据 ──

interface RoomState {
  roomId: number
  realRoomId: number
  displayRoomId: number
  isConnected: boolean
  guardNumber: number
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

// ── 消息设置项 ──

interface MessageSettingItem {
  type: 'avatar' | 'guard' | 'medal' | 'name' | 'colon' | 'comment'
  isShow: boolean
  size?: number
}

// ── 禁言指令设置 ──

interface MuteCommandSetting {
  enable: boolean
  roles: string[]
  keyword: string
  count?: number
  hintText?: string
  useHintText?: boolean
}

// ── 弹幕样式（DEFAULT_STYLE 展开 + 运行时字段）──

interface DanmakuStyle {
  // 基本
  isShowAvatar: boolean
  isShowMemberShipIcon: boolean
  isShowFanMedal: boolean
  avatarSize: number
  combineSimilarTime: number
  hiddenExpiredTime: number
  showHeadlineThreshold: number
  isShowInteractInfo: boolean
  showGiftCardThreshold: number
  isShowSilverGift: boolean
  opacity: number
  danmakuFont: string
  isUseMiniGiftCard: boolean
  background: string
  adminIcon: string
  isShowAdminIcon: boolean
  adminIconColor: string
  danmakuChannel: number
  channelDelayTime: number

  // 各级别消息样式
  [key: string]: any // 允许 `message_lv0`, `name_lv3` 等动态 key
}

// ── Store 完整类型 ──

export interface ConfigStoreState extends DanmakuStyle {
  // 多房间
  rooms: RoomState[]
  activeRoomIndex: number

  // 全局设置
  recordDir: string
  isWithCookie: boolean
  userCookie: string
  isAutoRecord: boolean
  onlyMyselfRoom: boolean
  isWatchLottery: boolean
  isShowHeadline: boolean
  fontWeight: string
  signInMessage: string
  onlyTodayZeroIntimacy: boolean
  isLiveWindowAlwaysOnTop: boolean
  isScrollDanmakuWindowAlwaysOnTop: boolean
  liveWindowOpacity: number
  liveWindowId: number | null
  danmakuWindowId: number | null
  isShowType1: boolean
  isShowType2: boolean
  isShowSuperChatJPN: boolean
  liveWindowX: number
  liveWindowY: number
  liveWindowHeight: number
  enableMessageListenMode: boolean

  // 滚动弹幕窗
  scrollDanmakuFontSize: number
  scrollDanmakuDuration: number
  scrollDanmakuDirection: string
  scrollDanmakuWindowId: number | null
  scrollDanmakuWidth: number
  scrollDanmakuHeight: number
  scrollDanmakuX: number
  scrollDanmakuY: number
  scrollDanmakuBackground: string
  scrollDanmakuOpacity: number
  scrollDanmakuStyleExtend: string
  scrollDanmakuEmojiSize: number

  // ASR / 音频
  ASRWindowId: number | null
  ASRLineCount: number
  emojiSize: number
  liveVolume: number
  ffmpegExe: string
  audioFrom: string
  MTFromLang: string
  MTToLang: string
  disableMircrophotoNoticeMessage: boolean

  // 阿里云
  aliAppKeys: string[]
  aliAccessKeyId: string
  aliAccessKeySecret: string
  aliAppKey: string

  // 窗口控制
  onTopLevel: string
  isOnTopForce: boolean
  disableIgnoreMouseEvent: boolean

  // 消息设置
  messageSettings: MessageSettingItem[]
  userInfoFrequencyLimit: number

  // 语音播报
  waitingSpeakerCount: number

  // 颜色 / 边框
  colors: string[]
  borderImages: any[]

  // 自动回复
  autoReplyRules: any[]
  isAutoReply: boolean
  muteCommandSetting: MuteCommandSetting

  // 投票
  optionstring: string
  voteOptions: string[]

  // 历史房间
  historyRooms: Array<{ roomId: number; uname: string; face: string }>
  isRecording: boolean
  isShowUserSpaceLink?: boolean

  // Cookie
  isNeedRefreshCookieCache?: number
  refreshToken?: string
}

// ── Store Getters ──

export interface ConfigStoreGetters {
  activeRoom: RoomState | null
  hasConnectedRoom: boolean
  isActiveRoomConnected: boolean
}

// ── Store Actions ──

export interface ConfigStoreActions {
  ADD_ROOM(roomId: number): void
  REMOVE_ROOM(index: number): void
  SET_ACTIVE_ROOM(index: number): void
  UPDATE_ACTIVE_ROOM(payload: Partial<RoomState>): void
  UPDATE_ROOM(index: number, payload: Partial<RoomState>): void
  UPDATE_STYLE(payload: any): void
  UPDATE_CONFIG(payload: Record<string, any>): void
  CLEAR_TEXT_STROKE_VERSION_0_4_8(): void
}
