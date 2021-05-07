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
        <Select :style="{ width: '200px', display: 'inline-block' }" v-model="selectedGiftId" filterable size="small">
          <Option v-for="gift in giftSelectors" :value="gift.key" :key="gift.key" :label="gift.label">
            <img :style="{ 'vertical-align': 'middle', width: '30px' }" :src="gift.webp" />
            <span>{{ gift.value }}</span>
            <span :style="{color: 'silver'}">{{ gift.key }}</span>
          </Option>
        </Select>
      </div>
    </div>
    <div class="button-cotainer">
      <template v-if="isRunning">
        <Button @click="stop" type="primary">少女祈愿中</Button>
      </template>
      <template v-else>
        <Button @click="start" type="primary">祈愿</Button>
      </template>

      <span :style="{ 'margin': '0px 10px' }">总数: {{ count }}</span>
      <span :style="{ 'margin': '0px 10px' }">总金瓜子: {{ totalPrice }}</span>
      <span :style="{ 'margin-left': '30px' }" v-if="aTaRi.name">
        恭喜 <span :style="{ color: 'crimson', 'font-weight': 'bold' }"> {{ aTaRi.name }} </span>
      </span>
    </div>

    <div class="candidate-container">
      <template v-for="info of userGiftsSorted">
        <div class="candidate" :key="info.uid">
          <Avatar :src="info.avatar" size="small" />
          {{`${info.name}(${info.uid}): 赠送了 ${info.giftNumber} 个 ${info.giftName}, 权重: ${Number((info.price / totalPrice) * 100).toFixed(2)}%;`}}
        </div>
      </template>
    </div>
  </div>
</template>

<script>
// 统计一段时间内送礼
// 检测开启天选自动开始统计
// 发送弹幕或者送礼抽奖
import { sortBy } from "lodash";
import { GIFT_CONFIG_MAP, DEFAULT_AVATAR } from "../../service/const";
import emitter from "../../service/event";
import { parseGift } from "../../service/bilibili-live-ws";
const giftSelectors = [];
for (const key in GIFT_CONFIG_MAP) {
  giftSelectors.push({
    key: key,
    value: GIFT_CONFIG_MAP[key].name,
    label: GIFT_CONFIG_MAP[key].name,
    webp: GIFT_CONFIG_MAP[key].webp,
  });
}

export default {
  data() {
    return {
      isDanmaku: true,
      isGift: false,
      giftSelectors,
      medalLevel: 0,
      danmakuText: "",
      selectedGiftId: 0,
      userGiftMap: {},
      gifts: [],
      userGiftsSorted: [],
      count: 0,
      totalPrice: 0,
      isRunning: false,
      aTaRi: {}
    };
  },
  components: {
    // userGiftsSorted() {
    //   return sortBy(Object.values(this.userGiftMap), '-giftNumber')
    // }
  },
  beforeDestroy() {
    this.stop();
  },
  methods: {
    start() {
      emitter.on("message", this.onLotteryMessage)
      // this.onLotteryMessage([]);
      this.isRunning = true;
    },
    stop() {
      emitter.removeListener("message", this.onLotteryMessage);
      this.aTaRi = this.iNoRu()
      console.log(this.aTaRi)
      this.isRunning = false;
    },

    async onLotteryMessage(data) {
      if (!Array.isArray(data)) return;
      if (this.isDanmaku) {
      }
      if (this.isGift) {
        // const gifts = [
        //   {
        //     giftId: 1,
        //     giftNumber: 1,
        //     uid: 1,
        //     name: "u1",
        //     price: 300,
        //     giftName: "测试",
        //   },
        //   {
        //     giftId: 2,
        //     giftNumber: 1,
        //     uid: 2,
        //     name: "u2",
        //     price: 200,
        //     giftName: "测试",
        //   },
        //   {
        //     giftId: 1,
        //     giftNumber: 2,
        //     uid: 1,
        //     name: "u1",
        //     price: 100,
        //     giftName: "测试",
        //   },
        // ];
        const gifts = data
          .map(parseGift)
          .filter((gift) => {
            return gift && gift.type === "gift" && `${gift.giftId}` === `${this.selectedGiftId}`
          });

        gifts.forEach((gift) => {
          const {
            uid,
            name,
            giftName,
            giftNumber = 1,
            avatar = DEFAULT_AVATAR,
          } = gift;
          let { price } = gift
          // 价值为0，例如辣条等，算做1
          if (!price) price = 1
          if (!this.userGiftMap[uid]) {
            this.userGiftMap[uid] = {
              uid,
              name,
              avatar,
              giftName,
              giftNumber: giftNumber,
              price: giftNumber * price,
            };
          } else {
            this.userGiftMap[uid].giftNumber =
              this.userGiftMap[uid].giftNumber + giftNumber;
            this.userGiftMap[uid].price =
              this.userGiftMap[uid].price + giftNumber * price;
          }
          this.count = this.count + giftNumber;
          this.totalPrice = this.totalPrice + giftNumber * price;
          this.gifts.push(gift);
        });

        this.userGiftsSorted = sortBy(
          Object.values(this.userGiftMap),
          "-giftNumber"
        );
      }
    },

    selectDanmakuOrGift() {
      [this.isDanmaku, this.isGift] = [this.isGift, this.isDanmaku];
    },
    iNoRu() {
      console.log(this.gifts)
      const index = parseInt(Math.random() * this.gifts.length);
      return this.gifts[index] || {};
    },
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
  padding: 10px;
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
