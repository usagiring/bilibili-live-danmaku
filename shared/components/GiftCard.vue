<template>
  <div
    class="message-super-chat"
    :style="{ border: `solid 0.5px ${color2}` }">
    <div
      class="gift-card-header"
      :style="{ background: color1 }">
      <Avatar
        class="gift-card-avatar"
        :src="face"
        size="large" />
      <div class="gift-card-info">
        <p>{{ username }}</p>
        <p v-if="type === 'anchor'">{{ count === 1 ? name : `${name}×${count}` }}</p>
        <p v-else>{{ formattedPrice }}</p>
      </div>
    </div>
    <div
      class="gift-card-footer"
      :style="{ background: color2 }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

const props = defineProps(['gift', 'face', 'username'])

const { priceProperties, totalPrice, name, count, type, webp } = toRefs(props.gift)
const color1 = computed(() => priceProperties?.value?.colors[0])
const color2 = computed(() => priceProperties?.value?.colors[1])

const formattedPrice = computed(() => {
  const price = totalPrice?.value || 0
  return `￥${Number.isSafeInteger(price) ? Number(price).toFixed(0) : Number(price).toFixed(1)}`
})
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  margin: 5px;
  overflow: hidden;
  font-family: monospace;
  font-size: 12px;
}
.gift-card-header {
  display: flex;
  align-items: flex-start;
  padding: 2px 4px;
  gap: 6px;
}
.gift-card-avatar {
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  align-self: anchor-center;
}

.gift-card-info p {
  margin: 0;
  color: inherit;
}
.gift-card-img {
  width: 18px;
  height: 18px;
  vertical-align: middle;
  margin-left: 4px;
}
.gift-card-footer {
  color: #fff;
}
</style>
