import Vue from 'vue'

const state = {
  messages: [],
  exampleMessages: [
    {
      id: 1,
      type: "comment",
      uid: "12345",
      name: "oooovknkdnkjedbiowq",
      comment: "草",
      avatar: "https://static.hdslb.com/images/member/noface.gif",
      role: "captain"
    },
    {
      id: 2,
      uid: "12346",
      name: "fojfwqpojpofsc",
      type: "comment",
      comment: "我就是Hololive！！！",
      avatar: "https://static.hdslb.com/images/member/noface.gif",
      role: "normal"
    },
    {
      id: 6,
      uid: "12345",
      name: "fjsojjfowqrwsfwq",
      type: "superChat",
      comment: "草草草草草草草草草草草",
      price: 50,
      avatar: "https://static.hdslb.com/images/member/noface.gif",
      role: "normal"
    },
    {
      id: 7,
      type: "gift",
      uid: 12345,
      name: 'fjsojjfowqrwsfwq',
      avatar: "https://static.hdslb.com/images/member/noface.gif",

      price: 442.1,
      giftNumber: 50,
      giftName: '小红花'
    }
  ],
}

const mutations = {
  ADD_EXAMPLE_MESSAGE(state, payload) {
    if (state.exampleMessages.length > 40) {
      state.exampleMessages = [...state.exampleMessages.slice(1), payload]
    } else {
      state.exampleMessages = [...state.exampleMessages, payload]
    }
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
