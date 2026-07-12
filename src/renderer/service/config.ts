import { set as _set } from 'lodash'
import { reactive } from 'vue'
import { ClientConfig } from '../types'

// 全局共享的客户端配置（响应式，任何组件 import 后读写即生效）
const config: ClientConfig & { set: (p: string, v: string) => void } = reactive({
  id: '',
  rooms: [],
  window: {},
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

  autoReplyRule: {},
  AIConfig: {
    speechToText: {
      model: {
        name: '',
      },
      vad: {
        minSpeechDuration: 0.1,
        minSilenceDuration: 0.1,
        maxSpeechDuration: 5,
      },
    },
  },

  set(path: string, value: any) {
    _set(this, path, value)
  },
})

export default config
