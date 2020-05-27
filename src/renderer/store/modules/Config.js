// {role}_{type}: { [property: string]: string }
const state = {
  message: {
    'font-size': '12px'
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
    const objKey = `${payload.role}_${payload.type}`
    state[objKey] = { ...state[objKey], ...payload.style }
  },
  UPDATE_MESSAGE_STYLE(state, payload) {
    state.message = { ...state.message, ...payload }
  }
}

const actions = {
  UPDATE_MESSAGE_STYLE({ commit }, payload) {
    commit('UPDATE_MESSAGE_STYLE', payload)
  },

  async UPDATE_STYLE({ commit }, payload) {
    commit('UPDATE_STYLE', payload)
  },
}

export default {
  state,
  mutations,
  actions
}
