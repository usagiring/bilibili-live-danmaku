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

  CLEAR_TEXT_STROKE_VERSION_0_4_8(state, payload) {
    const array = [
      {
        prop: 'name',
        role: '0',
      },
      {
        prop: 'comment',
        role: '0',
      },
      {
        prop: 'name',
        role: '1',
      },
      {
        prop: 'comment',
        role: '1',
      },
      {
        prop: 'name',
        role: '2',
      },
      {
        prop: 'comment',
        role: '2',
      },
      {
        prop: 'name',
        role: '3',
      },
      {
        prop: 'comment',
        role: '3',
      },
      {
        prop: 'name',
        role: 'admin',
      },
      {
        prop: 'comment',
        role: 'admin',
      }
    ]
    array.forEach(i => {
      const objKey = `${i.prop}_lv${i.role}`
      const newData = { ...state[objKey] }
      delete newData['-webkit-text-stroke-width']
      delete newData['-webkit-text-stroke-color']
      state[objKey] = newData
    })
  }
}

const actions = {
  async UPDATE_STYLE({ commit }, payload) {
    commit('UPDATE_STYLE', payload)
  },

  async UPDATE_CONFIG({ commit }, payload) {
    commit('UPDATE_CONFIG', payload)
  },

  async CLEAR_TEXT_STROKE_VERSION_0_4_8({ commit }) {
    commit('CLEAR_TEXT_STROKE_VERSION_0_4_8')
  }
}

export default {
  state,
  mutations,
  actions
}
