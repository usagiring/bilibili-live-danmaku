// {role}_{prop}: { [property: string]: string }
const state = {
  isShowAvatar: true,
  isShowMemberShipIcon: true,
  avatarSize: 24,

  container_style: {
    background: "rgba(0, 0, 0, 0.3)"
  },

  normal_message: {

  },
  normal_name: {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'white',
    color: 'white'
  },
  normal_comment: {
    'font-size': '12px',
    color: 'white'
  },

  captain_message: {

  },
  captain_name: {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'green',
    color: 'white'
  },
  captain_comment: {
    'font-size': '12px',
    color: 'white'
  },

  admiral_name: {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'green',
    color: 'white'
  },
  admiral_comment: {
    'font-size': '12px',
    color: 'white'
  },

  governor_name: {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'green',
    color: 'white'
  },
  governor_comment: {
    'font-size': '12px',
    color: 'white'
  },

}

const mutations = {
  UPDATE_STYLE(state, payload) {
    const objKey = `${payload.role}_${payload.prop}`
    state[objKey] = { ...state[objKey], ...payload.style }
  },

  UPDATE_CONTAINER_STYLE(state, payload) {
    state['container_style'] = { ...state['container_style'], ...payload.style }
  },

  UPDATE_CONFIG(state, payload) {
    for (const key in payload) {
      state[key] = payload[key]
    }
  }
}

const actions = {

  async UPDATE_STYLE({ commit }, payload) {
    commit('UPDATE_STYLE', payload)
  },

  async UPDATE_CONTAINER_STYLE({ commit }, payload) {
    commit('UPDATE_CONTAINER_STYLE', payload)
  },

  async UPDATE_CONFIG({ commit }, payload) {
    commit('UPDATE_CONFIG', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
