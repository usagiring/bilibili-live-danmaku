import { EXAMPLE_MESSAGES } from '../../../service/const'

const state = {
  messages: [],
  gifts: [],
  exampleMessages: [...EXAMPLE_MESSAGES],
  exampleGifts: []
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

  UPDATE_MESSAGE(state, payload) {
    const index = payload.index || state.messages.findIndex(message => message.id === payload.id)
    if (!~index) return
    delete payload.index
    const message = state.messages[index]
    const newMessage = Object.assign({}, message, payload)
    state.messages.splice(index, 1, newMessage)
  },

  UPDATE_EXAMPLE_MESSAGE(state, payload) {
    const index = payload.index || state.exampleMessages.findIndex(message => message.id === payload.id)
    if (!~index) return
    delete payload.index
    const message = state.exampleMessages[index]
    const newMessage = Object.assign({}, message, payload)
    state.exampleMessages.splice(index, 1, newMessage)
  },

  ADD_EXAMPLE_GIFT(state, payload) {
    if (state.exampleGifts.length > 99) {
      state.exampleGifts = [...state.exampleGifts.slice(1), payload]
    } else {
      state.exampleGifts = [...state.exampleGifts, payload]
    }
  },

  ADD_GIFT(state, payload) {
    if (state.gifts.length > 99) {
      state.gifts = [...state.gifts.slice(1), payload]
    } else {
      state.gifts = [...state.gifts, payload]
    }
  },

  UPDATE_GIFT(state, payload) {
    const index = payload.index || state.gifts.findIndex(gift => gift.id === payload.id)
    if (!~index) return
    delete payload.index
    const gift = state.gifts[index]
    const newGift = Object.assign({}, gift, payload)
    state.gifts.splice(index, 1, newGift)
  },

  CLEAR_MESSAGE(state) {
    state.messages = []
    state.gifts = []
  },

  RESTORE_EXAMPLE_MESSAGE(state) {
    state.exampleMessages = [...EXAMPLE_MESSAGES],
      state.exampleGifts = []
  },

  GIFT_TIMER(state, payload) {
    state.gifts = state.gifts
      .map(gift => {
        gift.existsTime = payload.now - gift.sendAt;
        return gift;
      })

    state.exampleGifts = state.exampleGifts
      .map(gift => {
        gift.existsTime = payload.now - gift.sendAt;
        return gift;
      })
  }
}

const actions = {
  async ADD_EXAMPLE_MESSAGE({ state, commit, rootState }, payload) {
    const combineSimilarTime = rootState.Config.combineSimilarTime
    if (combineSimilarTime && payload.type === 'comment') {
      const messages = [...state.exampleMessages].reverse();
      let update;
      for (const message of messages) {
        const timePoint = payload.sendAt - combineSimilarTime;
        // 如果已扫描到超过设定时间点之前的弹幕，直接跳出
        if (message.sendAt < timePoint) {
          break;
        }
        if (
          message.sendAt > timePoint &&
          message.comment === payload.comment
        ) {
          update = message;
          break;
        }
      }
      if (update) {
        commit("UPDATE_EXAMPLE_MESSAGE", {
          id: update.id,
          similar: update.similar ? update.similar + 1 : 1,
        });
        return;
      }
    }

    // 礼物叠加处理
    if (payload.type === 'gift') {
      const messages = [...state.exampleMessages].reverse();
      const giftIndex = messages.findIndex(message => message.batchComboId === payload.batchComboId)
      if (~giftIndex) {
        const gift = messages[giftIndex]
        const giftNumber = gift.giftNumber + payload.giftNumber

        const update = {
          id: gift.id,
          giftNumber,
          index: messages.length - 1 - giftIndex
        }
        gift.price = gift.price || 0
        const totalPrice = Number((giftNumber || 1) * gift.price)
        update.totalPrice = Number.isInteger(totalPrice) ? totalPrice : totalPrice.toFixed(1)
        const showGiftThreshold = rootState.Config.showGiftThreshold
        if (update.totalPrice >= showGiftThreshold) {
          commit('ADD_EXAMPLE_GIFT', Object.assign({}, gift, update))
        }
        commit('UPDATE_EXAMPLE_MESSAGE', update)
        return
      }
    }
    // FIX: 某些场景下SC会推送两次信息，判断SuperChatId相同则不发送重复SC
    if (payload.type === 'superChat') {
      const messages = [...state.exampleMessages].reverse();

      const scIndex = messages.findIndex(message => message.superChatId === payload.superChatId)
      if (~scIndex) {
        if (payload.commentJPN) {
          commit('UPDATE_EXAMPLE_MESSAGE', {
            index: messages.length - 1 - scIndex,
            commentJPN: payload.commentJPN
          })
        }
        return
      }
    }

    payload.price = payload.price || 0
    const totalPrice = Number((payload.giftNumber || 1) * payload.price)
    payload.totalPrice = Number.isInteger(totalPrice) ? totalPrice : totalPrice.toFixed(1)
    const showGiftThreshold = rootState.Config.showGiftThreshold
    if (payload.totalPrice >= showGiftThreshold) {
      commit('ADD_EXAMPLE_GIFT', payload)
    }

    commit('ADD_EXAMPLE_MESSAGE', payload)
  },
  ADD_MESSAGE({ state, commit, rootState }, payload) {
    const combineSimilarTime = rootState.Config.combineSimilarTime

    if (combineSimilarTime && payload.type === 'comment') {
      const messages = [...state.messages].reverse();
      let update;
      for (const message of messages) {
        const timePoint = payload.sendAt - combineSimilarTime;
        // 如果已扫描到超过设定时间点之前的弹幕，直接跳出
        if (message.sendAt < timePoint) {
          break;
        }
        if (
          message.sendAt > timePoint &&
          message.comment === payload.comment
        ) {
          update = message;
          break;
        }
      }
      if (update) {
        commit("UPDATE_MESSAGE", {
          id: update.id,
          similar: update.similar ? update.similar + 1 : 1,
        });
        return;
      }
    }

    // 礼物叠加处理
    if (payload.type === 'gift') {
      const messages = [...state.messages].reverse();
      const giftIndex = messages.findIndex(message => message.id === payload.id)
      if (~giftIndex) {
        const gift = messages[giftIndex]
        const giftNumber = payload.giftNumber
        // 如果此时金额大于设定值，推送到gift栏
        const update = {
          id: gift.id,
          giftNumber,
          index: messages.length - 1 - giftIndex
        }
        gift.price = gift.price || 0
        const totalPrice = Number((giftNumber || 1) * gift.price)
        update.totalPrice = Number.isInteger(totalPrice) ? totalPrice : totalPrice.toFixed(1)
        const showGiftThreshold = rootState.Config.showGiftThreshold
        // 这里也需要叠加处理
        if (update.totalPrice >= showGiftThreshold) {
          const gifts = [...state.gifts]
          const existsGiftIndex = gifts.findIndex(_ => _.id === gift.id)
          if (~existsGiftIndex) {
            commit('UPDATE_GIFT', {
              id: gift.id,
              index: existsGiftIndex,
              totalPrice: update.totalPrice,
              giftNumber
            })
          } else {
            commit('ADD_GIFT', Object.assign({}, gift, update))
          }
        }

        commit('UPDATE_MESSAGE', update)
        return
      }
    }

    // FIX: 某些场景下SC会推送两次信息，判断SuperChatId相同则不发送重复SC
    if (payload.type === 'superChat') {
      const messages = [...state.messages].reverse();

      const scIndex = messages.findIndex(message => message.id === payload.id)
      if (~scIndex) {
        if (payload.commentJPN) {
          commit('UPDATE_MESSAGE', {
            index: messages.length - 1 - scIndex,
            commentJPN: payload.commentJPN
          })
        }
        return
      }
    }

    // TODO: refactor
    if (payload.type === 'gift' || payload.type === 'superChat') {
      payload.price = payload.price || 0
      const totalPrice = Number((payload.giftNumber || 1) * payload.price)
      payload.totalPrice = Number.isInteger(totalPrice) ? totalPrice : totalPrice.toFixed(1)
      const showGiftThreshold = rootState.Config.showGiftThreshold
      if (payload.totalPrice >= showGiftThreshold) {
        commit('ADD_GIFT', payload)
      }
    }

    commit('ADD_MESSAGE', payload)
  },
  CLEAR_MESSAGE({ commit }) {
    commit('CLEAR_MESSAGE')
  },

  RESTORE_EXAMPLE_MESSAGE({ commit }) {
    commit('RESTORE_EXAMPLE_MESSAGE')
  },

  GIFT_TIMER({ commit }, payload) {
    commit('GIFT_TIMER', payload)
  }
}

export default {
  state,
  mutations,
  actions
}
