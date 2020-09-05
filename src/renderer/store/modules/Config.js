// {role}_{prop}: { [property: string]: string }
const state = {
  isShowAvatar: true,
  isShowMemberShipIcon: true,
  avatarSize: 24,
  combineSimilarTime: 3000,
  showGiftThreshold: 30,
  isShowInteractInfo: false,
  showGiftCardThreshold: 0,
  isShowSilverGift: false,

  container_style: {
    background: "rgba(0, 0, 0, 0.3)"
  },

  '0_message': {

  },
  '0_name': {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'white',
    color: 'white'
  },
  '0_comment': {
    'font-size': '12px',
    color: 'white'
  },

  '3_message': {

  },
  '3_name': {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'green',
    color: 'white'
  },
  '3_comment': {
    'font-size': '12px',
    color: 'white'
  },

  '2_name': {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'green',
    color: 'white'
  },
  '2_comment': {
    'font-size': '12px',
    color: 'white'
  },

  '1_name': {
    'font-size': '12px',
    '-webkit-text-stroke-width': '1px',
    '-webkit-text-stroke-color': 'green',
    color: 'white'
  },
  '1_comment': {
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
