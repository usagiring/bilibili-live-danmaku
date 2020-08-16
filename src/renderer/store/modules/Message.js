import Vue from 'vue'

const state = {
  messages: [],
  exampleMessages: [
    {
      id: 1,
      type: "comment",
      uid: "12345",
      name: "其妙",
      comment: "草",
      role: "captain"
    },
    {
      id: 2,
      uid: "12346",
      name: "马自立",
      type: "comment",
      comment: "我就是Hololive！！！",
      role: "normal"
    },
    {
      id: 3,
      type: "comment",
      uid: "12346",
      name: "马自立",
      type: "comment",
      comment: "我就是Hololive！！！",
      role: "normal"
    },
    {
      id: 4,
      uid: "12346",
      name: "马自立",
      type: "comment",
      comment: "我就是Hololive！！！",
      role: "normal"
    },
    {
      id: 5,
      uid: "12345",
      name: "Res",
      type: "comment",
      comment: "草",
      role: "captain"
    }
  ],
}

const mutations = {
  ADD_EXAMPLE_MESSAGE({ exampleMessages }, payload) {
    exampleMessages.push(payload)
  },

  ADD_MESSAGE(state, payload) {
    // 最多保留100条弹幕
    if (state.messages.length > 99) {
      state.messages = [...state.messages.slice(1), payload]
    } else {
      state.messages = [...state.messages, payload]
    }
  },

  CLEAR_MESSAGE(state) {
    Vue.set(state, 'messages', []);
  },

  POP() {
    messages.pop()
  }
}

const actions = {
  async ADD_EXAMPLE_MESSAGE({ commit }, payload) {
    commit('ADD_EXAMPLE_MESSAGE', payload)
  },
  async ADD_MESSAGE({ commit }, payload) {
    commit('ADD_MESSAGE', payload)
  },
  async CLEAR_MESSAGE({ commit }) {
    commit('CLEAR_MESSAGE')
  }
}

export default {
  state,
  mutations,
  actions
}
