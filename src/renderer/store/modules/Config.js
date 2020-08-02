// {role}_{prop}: { [property: string]: string }
const state = {
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
  }
}

const actions = {

  async UPDATE_STYLE({ commit }, payload) {
    commit('UPDATE_STYLE', payload)
  },

  async UPDATE_CONTAINER_STYLE({ commit }, payload) {
    commit('UPDATE_CONTAINER_STYLE', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
