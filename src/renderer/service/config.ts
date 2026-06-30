import { set as _set } from 'lodash'
import { reactive } from 'vue'
import { ClientConfig } from '../types'

// 全局共享的客户端配置（响应式，任何组件 import 后读写即生效）
const config: ClientConfig & { set: (p: string, v: string) => void } = reactive({
  id: '',
  rooms: [],
  windows: [],
  providers: [],

  signInMessage: '...',
  isNeedRefreshCookieCache: false,

  waitingSpeakerCount: 0,

  messageConfig: {
    isRealTimeMode: false,
    isShowUserId: true,
    isShowSendAt: true,
    isShowInteract: true,
  },

  voteConfig: {
    options: [],
    isAccurateMatch: false,
    isAllowReVote: false,
    duration: 60,
  },

  isRoomPanelCollapsed: false,

  autoReplyRules: [],

  set(path: string, value: any) {
    _set(this, path, value)
  },
})

export default config
