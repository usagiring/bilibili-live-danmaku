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
      <div :style="{ display: 'inline-block', 'vertical-align': 'top' }">
        <Avatar :src="avatar" size="large" />
      </div>
      <div :style="{ display: 'inline-block' }">
        <p>{{ name }}</p>
        <template v-if="isGuardGift">
          <p>
            {{ giftNumber === 1 ? `${giftName}` : `${giftName}×${giftNumber}` }}
          </p>
        </template>
        <template v-else-if="totalPrice">
          <p>{{ `￥${totalPrice}` }}</p>
        </template>
      </div>
    </div>
    <div
      :style="{
        background: `${priceProperties.backgroundBottomColor}`,
        color: 'white',
      }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    "priceProperties",
    "avatar",
    "name",
    "giftName",
    "totalPrice",
    "giftNumber",
    "isGuardGift",
  ],
};
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  border: solid 0.5px rgba(66, 125, 158, 1);
  margin: 5px;
  overflow: hidden;
}
</style>
