<template>
  <div :style="{ border: `solid 0.5px ${priceProperties.backgroundBottomColor}` }" class="message-super-chat">
    <div
      :style="{
        background: `${priceProperties.backgroundColor}`,
        padding: '10px',
      }"
    >
      <span v-if="showTime" class="date-style">{{ dateFormat(sendAt) }}</span>
      <Avatar class="space-left-2px" :src="avatar" size="small" />
      <span class="space-left-2px">{{ uname }}</span>

      <slot />
      <template v-if="type === 2">
        <!-- wired space -->
        <span class="price-style space-left-2px">{{ count === 1 ? `${name}` : `${name}×${count}` }}</span>
      </template>
      <template v-else-if="totalPrice">
        <span class="price-style space-left-2px">{{ `¥${Number.isSafeInteger(totalPrice) ? Number(totalPrice).toFixed(0) : Number(totalPrice).toFixed(1)}` }}</span>
      </template>
    </div>
  </div>
</template>

<script>
import { dateFormat } from '../service/util'

export default {
  props: ['priceProperties', 'avatar', 'uname', 'name', 'totalPrice', 'count', 'type', 'sendAt', 'showTime'],
  methods: {
    dateFormat: dateFormat,
  },
}
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  border: solid 0.5px rgba(66, 125, 158, 1);
  margin: 5px;
  overflow: hidden;
}
.date-style {
  font-size: 12px;
  font-family: inherit;
  font-weight: bold;
}
.price-style {
  font-size: 12px;
  font-weight: bold;
  border: 1px solid Khaki;
  background: LemonChiffon;
  padding: 0 3px;
  margin: 0px;
}
.space-left-2px {
  margin-left: 2px;
}
</style>
