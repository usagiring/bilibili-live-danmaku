import { set as _set } from 'lodash'
import { reactive } from 'vue'

// 全局共享的客户端配置（响应式，任何组件 import 后读写即生效）
const config = reactive({
    id: '',
    rooms: [],
    windows: [],
    providers: [],

    signInMessage: '...',
    isNeedRefreshCookieCache: false,
    refreshToken: '',
    waitingSpeakerCount: 0,

    set(path: string, value: any) {
        _set(this, path, value)
    }
})

export default config