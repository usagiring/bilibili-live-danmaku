/* eslint-disable */
/**
 * Pinia Store 完整类型声明
 * 由所有 useConfigStore() 访问的 key 汇总生成
 */

// ── 房间级别数据 ──

export interface RoomState {
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

// interface MuteCommandSetting {
//   enable: boolean
//   roles: string[]
//   keyword: string
//   count?: number
//   hintText?: string
//   useHintText?: boolean
// }

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
  // 全局设置
  signInMessage: string
  isNeedRefreshCookieCache?: number
  refreshToken?: string
  waitingSpeakerCount?: number

  user?: User,
  rooms: Room[],
  windows: Window[],
  providers: Provider[],

  dmStyle: DmStyle,
  dmRawStyle: DmRawStyle,
  liveConfig: LiveConfig,
  messageConfig: MessageConfig,
  recordConfig: RecordConfig,
  asrConfig: AsrConfig,
  mtConfig: MtConfig,
  chartConfig: ChartConfig,
}

// ── Store Getters ──

export interface ConfigStoreGetters {
  // activeRoom: RoomState | null
  // hasConnectedRoom: boolean
  // isActiveRoomConnected: boolean
}

// ── Store Actions ──

export interface ConfigStoreActions {
  // ADD_ROOM(roomId: number): void
  // REMOVE_ROOM(index: number): void
  // SET_ACTIVE_ROOM(index: number): void
  // UPDATE_ACTIVE_ROOM(payload: Partial<RoomState>): void
  // UPDATE_ROOM(index: number, payload: Partial<RoomState>): void
  // UPDATE_STYLE(payload: any): void
  // UPDATE_CONFIG(payload: Record<string, any>): void
  // CLEAR_TEXT_STROKE_VERSION_0_4_8(): void
}
