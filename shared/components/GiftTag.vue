<template>
  <div
    class="gift-tag"
    :style="{ background: gift.priceProperties.backgroundColor }">
    <div
      class="gift-tag-progress"
      :style="{ width: `${widthCalculator(gift)}%`, background: gift.priceProperties.backgroundBottomColor }" />
    <div class="gift-tag-content-wrapper">
      <Avatar
        class="gift-tag-avatar"
        :src="gift.avatar"
        size="small" />
      <template v-if="gift.type === 2">
        <span>{{ gift.count === 1 ? `${gift.name}` : `${gift.name}×${gift.count}` }}</span>
      </template>
      <template v-else-if="gift.totalPrice">
        <span>{{
          `￥${Number.isSafeInteger(gift.totalPrice) ? Number(gift.totalPrice).toFixed(0) : Number(gift.totalPrice).toFixed(1)}`
        }}</span>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GiftTag',
  props: ['gift'],

  methods: {
    widthCalculator(item) {
      if (Number(item.existsTime) && Number(item.priceProperties.time)) {
        return Math.floor((1 - item.existsTime / item.priceProperties.time) * 100)
      } else {
        return 100
      }
    },
  },
}
</script>

<style scoped>
.gift-tag {
  line-height: 32px;
  border-radius: 20px;
  height: 32px;
  margin-right: 3px;
  color: white;
  position: relative;
  z-index: 1;
  overflow: hidden;
}
.gift-tag-progress {
  z-index: -1;
  position: absolute;
  height: 100%;
}
.gift-tag-avatar {
  margin-top: -2px;
}
.gift-tag-content-wrapper {
  padding: 0 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
