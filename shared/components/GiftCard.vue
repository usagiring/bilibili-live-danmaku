<template>
  <div
    class="message-super-chat"
    :style="{ border: `solid 0.5px ${color1}` }">
    <div
      class="gift-card-header"
      :style="{ background: color2 }">
      <Avatar
        class="gift-card-avatar"
        :src="face"
        size="large" />
      <div class="gift-card-info">
        <p>{{ username }}</p>
        <p v-if="type === 2">{{ count === 1 ? name : `${name}×${count}` }}</p>
        <p v-else-if="totalPrice">{{ formattedPrice }}</p>
      </div>
    </div>
    <div
      class="gift-card-footer"
      :style="{ background: color1 }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

const props = defineProps(['gift', 'face', 'username'])

const { priceProperties, totalPrice, name, count, type } = toRefs(props.gift)
const color1 = computed(() => priceProperties.value?.colors[0])
const color2 = computed(() => priceProperties.value?.colors[1])

const formattedPrice = computed(() => {
  const price = totalPrice.value
  return `￥${Number.isSafeInteger(price) ? Number(price).toFixed(0) : Number(price).toFixed(1)}`
})
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  margin: 5px;
  overflow: hidden;
}
.gift-card-header {
  display: flex;
  align-items: flex-start;
  padding: 10px;
}
.gift-card-avatar {
  flex-shrink: 0;
}
.gift-card-info {
  margin-left: 5px;
}
.gift-card-info p {
  margin: 0;
  color: inherit;
}
.gift-card-footer {
  padding: 6px 10px;
  color: #fff;
}
</style>
