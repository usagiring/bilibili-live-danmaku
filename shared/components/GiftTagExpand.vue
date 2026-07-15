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
        <p>{{ formattedPrice }}</p>
      </div>
    </div>
    <div
      class="gift-tag-expand-bottom"
      :style="{ background: color2 }">
      <template v-if="type === 'superchat'">
        {{ content }}
        <template v-if="contentJPN && isShowSuperChatJpn">
          <div class="divider" />
          {{ contentJPN }}
        </template>
      </template>
      <template v-else>
        {{ `${name}×${count}` }}
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps([
  'username',
  'gift',
  'face',
  'content',
  'contentJPN',
  'isShowSuperChatJpn',
])
const color1 = computed(() => props.gift?.priceProperties?.colors?.[0])
const color2 = computed(() => props.gift?.priceProperties?.colors?.[1])
const name = computed(() => props.gift?.name)
const count = computed(() => props.gift?.count)
const type = computed(() => props.gift?.type)

const formattedPrice = computed(() => {
  const price = props.gift?.totalPrice || 0
  return `${Number.isSafeInteger(price) ? Number(price).toFixed(0) : Number(price).toFixed(1)}元`
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
  font-family: monospace;
}
.gift-tag-expand-top {
  display: flex;
  padding: 2px;
}
.gift-tag-expand-top-left {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  align-self: anchor-center;
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
