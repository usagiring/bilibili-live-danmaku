import { DEFAULT_CONFIG, DEFAULT_STYLE } from '../../../service/const'
// const state = DEFAULT_CONFIG
const state = () => ({
  ...DEFAULT_CONFIG,
  ...DEFAULT_STYLE,
})

const mutations = {
  UPDATE_STYLE(state, payload) {
    const objKey = `${payload.prop}_lv${payload.role}`
    state[objKey] = { ...state[objKey], ...payload.style }
  },

  UPDATE_CONFIG(state, payload) {
    for (const key in payload) {
      state[key] = payload[key]
    }
  },
}

const actions = {
  async UPDATE_STYLE({ commit }, payload) {
    commit('UPDATE_STYLE', payload)
  },

  async UPDATE_CONFIG({ commit }, payload) {
    commit('UPDATE_CONFIG', payload)
  },
}

export default {
  state,
  mutations,
  actions
}
