<template>
  <div>
    <div class="selector-wrapper">
      <div
        class="selector-content"
        :style="isDanmaku && { border: '2px solid orange' }"
      >
        <Radio class="" :value="isDanmaku" @on-change="selectDanmakuOrGift"
          >弹幕</Radio
        >
        <span class="inline-text">牌子等级大于</span>
        <InputNumber
          v-model="medalLevel"
          :min="0"
          size="small"
          :style="{ width: '55px' }"
        />
        <Input
          v-model="danmakuText"
          size="small"
          placeholder="弹幕..."
          style="width: 300px"
        />
      </div>
      <div
        class="selector-content"
        :style="isGift && { border: '2px solid orange' }"
      >
        <Radio :value="isGift" @on-change="selectDanmakuOrGift">礼物</Radio>
        <Select
          :style="{ width: '200px', display: 'inline-block' }"
          :value="gifts"
          @on-change="changeSelectGift"
          filterable
          size="small"
        >
          <Option
            v-for="gift in giftSelectors"
            :value="gift.value"
            :key="gift.key"
          >
            <img
              :style="{ 'vertical-align': 'middle', width: '30px' }"
              :src="gift.webp"
            />
            <span>{{ gift.label }}</span>
          </Option>
        </Select>
      </div>
    </div>
    <Button @click="start">开始</Button>
    <Button @click="inoru">祈愿</Button>
    <div>
      <template v-for="info of userGiftsSorted">
        {{ `${info.name}(${info.uid}): ${info.giftNumber}` }}

      </template>
    </div>
  </div>
</template>

<script>
// 统计一段时间内送礼
// 检测开启天选自动开始统计
// 发送弹幕或者送礼抽奖
import { sortBy } from 'lodash' 
import { GIFT_CONFIG_MAP } from "../../service/const";
import emitter from "../../service/event";
const giftSelectors = [];
for (const key in GIFT_CONFIG_MAP) {
  giftSelectors.push({
    key: key,
    value: key,
    label: GIFT_CONFIG_MAP[key].name,
    webp: GIFT_CONFIG_MAP[key].webp,
  });
}

export default {
  data() {
    return {
      isDanmaku: true,
      isGift: false,
      giftSelectors: giftSelectors,
      medalLevel: 0,
      danmakuText: "",
      selectedGiftId: 0,
      userGiftMap: {},
      gifts: [],
      userGiftsSorted: [],
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
      console.log('2132')
      // emitter.on("message", this.onLotteryMessage);
      this.onLotteryMessage([])
    },
    stop() {
      // const listenerCount = emitter.listenerCount("message");
      // // 如果只有1个监听者，即主监听器，不处理
      // if (listenerCount <= 1) return;
      emitter.removeListener("message", this.onLotteryMessage);
    },

    async onLotteryMessage(data) {
      if (!Array.isArray(data)) return;
      if (this.isDanmaku) {
      }
      if (this.isGift) {
        const gifts = [
          {
            giftId: 1,
            giftNumber: 1,
            uid: 1,
            name: 'u1'
          },
          {
            giftId: 2,
            giftNumber: 1,
            uid: 2,
            name: 'u2'
          },
          {
            giftId: 1,
            giftNumber: 2,
            uid: 1,
            name: 'u1'
          }
        ]
        // const gifts = data
        //   .map(parseGift)
        //   .fitler(
        //     (gift) =>
        //       gift &&
        //       gift.type === "gift" &&
        //       `${gift.giftId}` === `${selectedGiftId}`
          // );

        gifts.forEach((gift) => {
          const { uid, name, giftNumber } = gift;
          if (!this.userGiftMap[uid]) {
            this.userGiftMap[uid] = {
              uid,
              name,
              giftNumber: giftNumber,
            };
          } else {
            this.userGiftMap[uid].giftNumber =
              this.userGiftMap[uid].giftNumber + giftNumber;
          }
          this.gifts.push(gift);
        });

        this.userGiftsSorted  = sortBy(Object.values(this.userGiftMap), '-giftNumber')
        console.log(this.userGiftsSorted, this.gifts)
      }
    },

    selectDanmakuOrGift() {
      [this.isDanmaku, this.isGift] = [this.isGift, this.isDanmaku];
    },
    changeSelectGift(value) {
      console.log(value);
    },
    inoru() {
      const index = parseInt(Math.random() * this.gifts.length);
      return this.gifts[index]
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
</style>
