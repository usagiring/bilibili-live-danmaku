<template>
  <div>
    <div class="selector-wrapper">
      <div class="selector-content" :style="isDanmaku && { border: '2px solid orange' }">
        <Radio class="" :value="isDanmaku" @on-change="selectDanmakuOrGift">弹幕</Radio>
        <span class="inline-text">牌子等级大于</span>
        <InputNumber v-model="medalLevel" :min="0" size="small" :style="{ width: '55px' }" />
        <Input v-model="danmakuText" size="small" placeholder="弹幕..." style="width: 300px" />
      </div>
      <div class="selector-content" :style="isGift && { border: '2px solid orange' }">
        <Radio :value="isGift" @on-change="selectDanmakuOrGift">礼物</Radio>
        <Select :style="{ width: '400px', display: 'inline-block' }" v-model="selectedGiftIds" filterable multiple size="small">
          <Option v-for="gift in giftSelectors" :value="gift.key" :key="gift.key" :label="gift.label">
            <img :style="{ 'vertical-align': 'middle', width: '30px' }" :src="gift.webp" />
            <span>{{ gift.value }}</span>
            <span :style="{color: 'silver'}">{{ `id: ${gift.key}` }}</span>
          </Option>
        </Select>
      </div>
      <div class="selector-content">
        <Input placeholder="一些描述..." v-model="description"></Input>
      </div>
    </div>
    <div class="button-cotainer">
      <template v-if="isRunning">
        <Button @click="iNoRu" type="primary">少女祈愿中</Button>
      </template>
      <template v-else>
        <Button @click="start" type="primary">祈愿</Button>
      </template>
      <div :style="{ float: 'right' }">
        <Checkbox :value="isShowProbability" @on-change="showProbability">显示概率</Checkbox>
        <Button @click="showHistoryModal">中奖记录</Button>
      </div>
      <span v-if="isDanmaku && isShowProbability" :style="{ 'margin': '0px 10px' }">总数: {{ count }}</span>
      <span v-if="isGift && isShowProbability" :style="{ 'margin': '0px 10px' }">总价值: {{ totalPrice.toFixed(1) }}</span>
      <span :style="{ 'margin-left': '30px' }" v-if="aTaRi.name">
        恭喜 <span :style="{ color: 'crimson', 'font-weight': 'bold', cursor: 'pointer' }" @click="openBiliUserSpace(aTaRi.uid)"> {{ aTaRi.name }} </span>
      </span>
    </div>

    <div class="candidate-container">
      <template v-if="isDanmaku">
        <div v-for="info of userComments" class="candidate" :key="`${info.uid}`">
          <Avatar :src="info.avatar" size="small" />
          {{`${info.name}: ${info.comment}`}}
          <span :style="{'margin-left': '5px'}" v-if="isShowProbability">
            {{`( ${count ? (1 / count * 100).toFixed(2) : 0}% )`}}
          </span>
        </div>
      </template>
      <template v-else>
        <div v-for="info of userGifts" class="candidate" :key="`${info.uid}:${info.giftId}`">
          <Avatar :src="info.avatar" size="small" />
          {{`${info.name}: 赠送了 ${info.giftNumber} 个 ${info.giftName}`}}
          <span :style="{'margin-left': '5px'}" v-if="isShowProbability">
            {{`( ${totalPrice ? Number((info.price / totalPrice) * 100).toFixed(2): 0}% )`}}
          </span>
        </div>
      </template>
    </div>

    <Modal v-model="historyModal" title="中奖记录" scrollable lock-scroll transfer :styles="{ overflow: 'auto' }">
      <template v-for="history in histories">
        <p :key="history.uid">
          {{ `${history.name}(${history.uid}) ${history.time}` }}
          <span :style="{color: 'gray'}">
            {{ history.description }}
          </span>
        </p>
      </template>
      <div slot="footer">
        <Button type="error" @click="removeAllHistory">清空</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { shell } from "electron";
import { getRandomItem, dateFormat } from '../../service/util'
import { DEFAULT_AVATAR } from "../../service/const";
import { getGiftConfig } from "../../service/api";
import { queryLotteryHistories, addLotteryHistory, deleteLotteryHistories } from '../../service/api'
import ws from '../../service/ws'

export default {
  data() {
    return {
      description: '',
      isDanmaku: true,
      isGift: false,
      historyModal: false,
      histories: [],
      giftSelectors: [],
      medalLevel: 0,
      danmakuText: "",
      selectedGiftIds: [],
      userGiftMap: {},
      // gifts: [],
      userCommentMap: {},
      userComments: [],
      isShowProbability: false,
      // userGiftsSorted: [],
      // count: 0,
      // totalPrice: 0,
      isRunning: false,
      aTaRi: {},
    };
  },
  computed: {
    userGifts() {
      return Object.values(this.userGiftMap)
    },
    // userComments() {
    //   return Object.values(this.userCommentMap)
    // },
    count() {
      return this.userComments.length
    },
    totalPrice() {
      return Object.values(this.userGiftMap).reduce((sum, userGift) => {
        return sum + userGift.price
      }, 0)
    },
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
  },
  async mounted() {
    const { data: giftConfig } = await getGiftConfig()
    for (const key in giftConfig) {
      const { name, webp } = giftConfig[key]
      this.giftSelectors.push({
        key: key,
        value: name,
        label: name,
        webp: webp,
      });
    }
  },
  beforeDestroy() {
    this.stop();
  },
  methods: {
    init() {
      this.userGiftMap = {}
      this.aTaRi = {}
      this.userCommentMap = {}
      this.userComments = []
    },
    start() {
      this.init()
      // emitter.on("message", this.onLotteryMessage)
      ws.addEventListener('message', this.onLotteryMessage)
      this.isRunning = true;
    },
    async stop() {
      ws.removeEventListener("message", this.onLotteryMessage);
    },

    async onLotteryMessage(msg) {
      const data = JSON.parse(msg.data)
      if (this.isDanmaku && data.cmd === 'COMMENT') {
        const comment = data.payload
        // 已经记录过的用户不再重复统计
        if (this.userCommentMap[comment.uid]) return;
        // 当前房间粉丝牌等级过滤
        if (this.medalLevel) {
          if (comment.medalRoomId !== this.realRoomId || comment.medalLevel < this.medalLevel) return
        }
        const regexp = new RegExp(this.danmakuText, "i")
        const isMatch = regexp.test(comment.comment)
        if (!isMatch) return;

        // 记录统计
        const history = {
          uid: comment.uid,
          name: comment.name,
          comment: comment.comment,
          avatar: comment.avatar || DEFAULT_AVATAR,
        }
        this.userCommentMap[comment.uid] = history
        this.userComments = [history, ...this.userComments]
      }
      if (this.isGift && data.cmd === 'GIFT') {
        const gift = data.payload
        if (!this.selectedGiftIds.includes(`${gift.giftId}`)) return

        const {
          uid,
          name,
          giftId,
          giftName,
          giftNumber = 1,
          price = 0,
          avatar = DEFAULT_AVATAR,
        } = gift;
        const key = `${uid}:${giftId}`
        const userGift = this.userGiftMap[key]
        // test: 小心心
        // if (giftId === 30607) {
        //   price = 1
        // }
        if (!userGift) {
          // 计算属性需要完全替换
          this.userGiftMap = {
            ...this.userGiftMap,
            [key]: {
              uid,
              giftId,
              name,
              avatar,
              giftName,
              giftNumber: giftNumber,
              price: giftNumber * price,
            }
          }
        } else {
          userGift.giftNumber = userGift.giftNumber + giftNumber
          userGift.price = userGift.price + giftNumber * price
          this.userGiftMap = Object.assign(this.userGiftMap, {
            [key]: userGift
          })
        }
      }
    },

    selectDanmakuOrGift() {
      [this.isDanmaku, this.isGift] = [this.isGift, this.isDanmaku];
    },
    async iNoRu() {
      this.stop()
      this.isRunning = false

      if (this.isDanmaku) {
        const withProbability = this.userComments.map(comment => {
          comment.probability = 1 / this.count
          return comment
        })
        const randomItem = getRandomItem(withProbability)
        if (!randomItem) return
        this.aTaRi = randomItem
        await addLotteryHistory(Object.assign({}, this.aTaRi, {
          time: Date.now(),
          description: this.description
        }))
        // await lotteryDB.insert(Object.assign({}, this.aTaRi, {
        //   time: Date.now(),
        //   description: this.description
        // }))
      }
      if (this.isGift) {
        const userPriceMap = {}
        for (const key in this.userGiftMap) {
          const [uid] = key.split(':')
          const userGift = this.userGiftMap[key]

          if (!userPriceMap[uid]) {
            userPriceMap[uid] = {
              uid,
              name: userGift.name,
              price: userGift.price
            }
          } else {
            userPriceMap[uid].price = userPriceMap[uid].price + userGift.price
          }
        }

        // 附加概率
        for (const key in userPriceMap) {
          userPriceMap[key].probability = Number((userPriceMap[key].price / this.totalPrice).toFixed(3))
        }

        const randomItem = getRandomItem(Object.values(userPriceMap))
        if (!randomItem) return

        this.aTaRi = randomItem
        this.isRunning = false;
        await addLotteryHistory(Object.assign({}, this.aTaRi, {
          time: Date.now(),
          description: this.description
        }))

        // await lotteryDB.insert(Object.assign({}, this.aTaRi, {
        //   time: Date.now(),
        //   description: this.description
        // }))
      }
    },

    showProbability(value) {
      this.isShowProbability = value
    },

    openBiliUserSpace(userId) {
      shell.openExternal(`https://space.bilibili.com/${userId}`);
    },

    async showHistoryModal() {
      this.historyModal = true

      const { data: histories } = await queryLotteryHistories({})
      // const histories = await lotteryDB.find({})
      this.histories = histories.map(history => {
        history.time = dateFormat(history.time)
        return history
      })
    },
    async removeAllHistory() {
      await deleteLotteryHistories({})
      // await lotteryDB.deleteMany({})
      this.histories = []
    },

    async autoWatchLottery() {
      ws.addEventListener('message', this.onLotteryMessage)
    }
  },
};
</script>

<style scoped>
.selector-wrapper {
  padding: 10px;
}
.inline-text {
  display: inline-block;
  vertical-align: middle;
}
.selector-content {
  margin: 5px 20px;
  padding: 5px 10px;
  border: 2px solid white;
}
.button-cotainer {
  padding: 15px;
  margin: 0 20px;
  border-top: 1px solid silver;
}
.candidate-container {
  margin: 0px 35px;
}
.candidate {
  padding: 2px;
}
</style>
