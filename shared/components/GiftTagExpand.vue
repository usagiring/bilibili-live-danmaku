<template>
  <div
    class="gift-tag-expand"
    :style="{ border: `1px solid ${color2}` }">
    <div
      class="gift-tag-expand-top"
      :style="{ background: color1 }">
      <Avatar
        class="gift-tag-expand-top-left"
        :src="face" />
      <div class="gift-tag-expand-top-right">
        <p>{{ username }}</p>
        <p v-if="type === 2">{{ count === 1 ? name : `${name}×${count}` }}</p>
        <p v-else-if="totalPrice">{{ formattedPrice }}</p>
      </div>
    </div>
    <div
      class="gift-tag-expand-bottom"
      :style="{ background: color2 }">
      <template v-if="type === 3">
        {{ gift.content }}
        <template v-if="contentJPN && isShowSuperChatJpn">
          <div class="divider" />
          {{ contentJPN }}
        </template>
      </template>
      <template v-else>
        {{ `${username} 赠送了 ${count} 个 ${name}` }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

const props = defineProps(['username', 'gift', 'face', 'isShowSuperChatJpn'])
const { priceProperties, totalPrice, name, count, type, contentJPN } = toRefs(props.gift)
const color1 = computed(() => priceProperties.value?.colors[0] ?? 'transparent')
const color2 = computed(() => priceProperties.value?.colors[1] ?? 'transparent')

const formattedPrice = computed(() => {
  const price = totalPrice.value
  return `￥${Number.isSafeInteger(price) ? Number(price).toFixed(0) : Number(price).toFixed(1)}`
})
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
