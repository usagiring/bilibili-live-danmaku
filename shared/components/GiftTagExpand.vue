<template>
  <div
    class="gift-tag-expand"
    :style="{ border: `1px solid ${gift.priceProperties.backgroundBottomColor}` }">
    <div
      class="gift-tag-expand-top"
      :style="{ background: gift.priceProperties.backgroundColor }">
      <Avatar
        class="gift-tag-expand-top-left"
        :src="gift.avatar" />
      <div class="gift-tag-expand-top-right">
        <p>{{ gift.uname }}</p>
        <template v-if="gift.type === 2">
          <p>{{ gift.count === 1 ? `${gift.name}` : `${gift.name}×${gift.count}` }}</p>
        </template>
        <template v-else-if="gift.totalPrice">
          <p>
            {{
              `￥${Number.isSafeInteger(gift.totalPrice) ? Number(gift.totalPrice).toFixed(0) : Number(gift.totalPrice).toFixed(1)}`
            }}
          </p>
        </template>
      </div>
    </div>
    <div
      class="gift-tag-expand-bottom"
      :style="{ background: gift.priceProperties.backgroundBottomColor }">
      <template v-if="gift.type === 3">
        {{ gift.content }}
        <template v-if="gift.contentJPN && isShowSuperChatJpn">
          <div class="divider" />
          {{ gift.contentJPN }}
        </template>
      </template>
      <template v-else>
        {{ `${gift.uname} 赠送了 ${gift.count} 个 ${gift.name}` }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ gift: any; isShowSuperChatJpn?: boolean }>()
</script>

<style scoped>
.gift-tag-expand {
  border-radius: 10px;
  margin-right: 3px;
  width: 200px;
  font-size: 12px;
  position: relative;
  z-index: 9999;
  overflow: hidden;
}
.gift-tag-expand-top {
  display: flex;
  padding: 6px;
}
.gift-tag-expand-top-left {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.gift-tag-expand-top-right {
  margin-left: 6px;
  flex: 1;
}
.gift-tag-expand-top-right p {
  margin: 0;
  font-size: 12px;
  color: white;
}
.gift-tag-expand-bottom {
  padding: 6px;
  font-size: 12px;
  color: white;
}
.divider {
  border-top: 1px solid;
  width: 100%;
  margin: 4px 0;
}
</style>
