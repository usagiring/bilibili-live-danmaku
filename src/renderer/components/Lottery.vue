<template>
  <div>
    <div class="selector-wrapper">
      <Radio :value="isDanmaku" @on-change="selectDanmakuOrGift">弹幕</Radio>
    </div>
    <div class="selector-wrapper">
      <Radio :value="isGift" @on-change="selectDanmakuOrGift">礼物</Radio>
      <Select
        :style="{ width: '100px', display: 'inline-block' }"
        :value="gifts"
        @on-change="changeSelectGift"
        size="small"
      ></Select>
    </div>
    <Button>开始统计</Button>
  </div>
</template>

<script>
// 统计一段时间内送礼
// 检测开启天选自动开始统计
// 发送弹幕或者送礼抽奖
import emitter from "../../service/event";

export default {
  data() {
    return {
      isDanmaku: true,
      isGift: false,
      gifts: [
        {
          key: "font",
          value: "font",
          type: "default",
        },
      ],
    };
  },
  methods: {
    setting() {},
    start() {
      emitter.on("message", this.onGiftMessage);
    },

    async onGiftMessage(data) {
      if (!Array.isArray(data)) return;

      const gifts = data
        .map(parseGift)
        .filter(Boolean)
        .fitler((gift) => gift.type === "gift");
    },

    selectDanmakuOrGift() {
      [this.isDanmaku, this.isGift] = [this.isGift, this.isDanmaku]
    },
    changeSelectGift() {},
  },
};
</script>

<style scoped>
.selector-wrapper {
  width: 100%;
  height: 50px;
  border: 0.5px solid silver;
}
</style>
