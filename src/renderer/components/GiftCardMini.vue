<template>
  <div
    :style="{ border: `solid 0.5px ${priceProperties.backgroundBottomColor}` }"
    class="message-super-chat"
  >
    <div
      :style="{
        background: `${priceProperties.backgroundColor}`,
        padding: '10px',
      }"
    >
      <span v-if="showTime" class="date-style">
        {{ dateFormat(sendAt) }}
      </span>
      <Avatar :src="avatar" size="small" />
      <span>{{ name }}</span>
      <template v-if="isGuardGift">
        <!-- wired space -->
        <span class="price-style">{{
          giftNumber === 1 ? `${giftName}` : `${giftName}×${giftNumber}`
        }}</span>
      </template>
      <template v-else-if="totalPrice">
        <span class="price-style">{{ `¥${totalPrice}` }}</span>
      </template>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { dateFormat } from "../../service/util";

export default {
  props: [
    "priceProperties",
    "avatar",
    "name",
    "giftName",
    "totalPrice",
    "giftNumber",
    "isGuardGift",
    "sendAt",
    "showTime"
  ],
  methods: {
    dateFormat: dateFormat,
  },
};
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
</style>
