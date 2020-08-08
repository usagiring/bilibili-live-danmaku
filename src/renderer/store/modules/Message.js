const state = {
  messages: [],
  exampleMessages: [
    {
      id: 1,
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
      uid: "12346",
      name: "马自立",
      type: "gift",
      comment: "我就是Hololive！！！",
      role: "normal"
    },
    {
      id: 4,
      uid: "12346",
      name: "马自立",
      type: "super-chat",
      comment: "我就是Hololive！！！",
      role: "normal"
    },
    {
      id: 5,
      uid: "12345",
      name: "Res",
      comment: "草",
      role: "captain"
    }
  ],
}

const mutations = {
  ADD_EXAMPLE_MESSAGE({ exampleMessages }, payload) {
    exampleMessages.push(payload)
  },
  ADD_MESSAGE({ messages }, payload) {
    messages.push(payload)
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
}

export default {
  state,
  mutations,
  actions
}
