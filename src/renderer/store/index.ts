import { createPinia, defineStore } from 'pinia'
import { computed, reactive, toRefs, toRaw } from 'vue'
import { set as _set } from 'lodash'
import { ClientConfig, Room, StoreConfig } from '../types'

export const useConfigStore = defineStore('config', () => {
  // ── State ──
  const state = reactive<StoreConfig>({
    id: '',
    rooms: [],
    // windows: [],
    // providers: [],

    // messageConfig: {
    //   isRealTimeMode: false,
    //   isShowUserId: true,
    //   isShowSendAt: true,
    //   isShowInteract: true,
    // },

    // signInMessage: '...',
    // isNeedRefreshCookieCache: false,
    // refreshToken: '',
    // waitingSpeakerCount: 0,
  })

  // ── Getters ──
  const activeRoom = computed((): Room | null => {
    return state.rooms?.find(room => room.isActive) || state.rooms[0] || null
  })

  function set(path, value: any) {
    _set(state, path, value)
  }

  return {
    ...toRefs(state),
    activeRoom,
    // replaceState,
    set,
  }
})

const pinia = createPinia()

export default pinia
