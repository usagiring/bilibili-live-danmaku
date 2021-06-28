import { DEFAULT_CONFIG } from '../../../service/const'
const state = Object.assign({}, DEFAULT_CONFIG)

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
