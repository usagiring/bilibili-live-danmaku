<template>
  <div
    class="message-super-chat"
    :style="{ border: `solid 0.5px ${color2}` }">
    <div
      class="gift-card-mini-header"
      :style="{ background: color1 }">
      <span
        v-if="isShowSendAt"
        class="date-style"
        >{{ dateFormat(sendAt) }}</span
      >
      <Avatar
        class="space-left-2px"
        :src="face"
        size="small" />
      <span class="username-style">{{ username }}</span>
      <slot />
      <span
        v-if="type === 'anchor'"
        class="price-style space-left-2px">
        {{ count === 1 ? name : `${name}×${count}` }}
      </span>
      <span
        v-else-if="totalPrice"
        class="price-style space-left-2px"
        >{{ formattedPrice }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { dateFormat } from '../service/util'

const props = defineProps(['gift', 'face', 'username', 'isShowSendAt', 'sendAt'])

const { priceProperties, totalPrice, name, count, type } = toRefs(props.gift)
const color1 = computed(() => priceProperties.value?.colors[0])
const color2 = computed(() => priceProperties.value?.colors[1])

const formattedPrice = computed(() => `¥${totalPrice.value}`)
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  margin: 5px;
  overflow: hidden;
}
.gift-card-mini-header {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 2px;
}
.date-style {
  font-size: 12px;
  font-family: inherit;
  font-weight: bold;
  flex-shrink: 0;
  white-space: nowrap;
}
.username-style {
  flex-shrink: 0;
  white-space: nowrap;
  margin-left: 2px;
}
.price-style {
  font-size: 12px;
  font-weight: bold;
}
.space-left-2px {
  margin-left: 2px;
}
</style>
