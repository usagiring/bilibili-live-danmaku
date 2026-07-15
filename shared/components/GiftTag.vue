<template>
  <div
    class="gift-tag"
    :style="{ background: color1 }">
    <div
      class="gift-tag-progress"
      :style="{ width: `${width}%`, background: color2 }" />
    <div class="gift-tag-content-wrapper">
      <Avatar
        class="gift-tag-avatar"
        :src="face"
        size="small" />
      <span v-if="type === 'anchor'">{{ count === 1 ? name : `${name}×${count}` }}</span>
      <span v-else>{{ formattedPrice }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ gift: any; face?: string; sendAt: number }>()
const color1 = computed(() => props.gift?.priceProperties?.colors?.[0])
const color2 = computed(() => props.gift?.priceProperties?.colors?.[1])
const type = computed(() => props.gift?.type)
const name = computed(() => props.gift?.name)
const count = computed(() => props.gift?.count)

const existsTime = ref(0)
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  existsTime.value = Date.now() - props.sendAt

  timer = setInterval(() => {
    existsTime.value = Date.now() - props.sendAt
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const width = computed(() => {
  const duration = props.gift?.priceProperties?.duration
  if (!existsTime.value || !duration) return 100
  return Math.max(0, Math.floor((1 - existsTime.value / duration) * 100))
})

const formattedPrice = computed(() => {
  const price = props.gift?.totalPrice || 0
  return `${Number.isSafeInteger(price) ? Number(price).toFixed(0) : Number(price).toFixed(1)}元`
})
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
  font-family: monospace;
  font-size: 13px;
}
.gift-tag-progress {
  z-index: -1;
  position: absolute;
  height: 100%;
}
.gift-tag-content-wrapper {
  padding: 0 6px;
  display: flex;
  align-items: center;
  gap: 2px;
  text-shadow:
    0 0 1px blue,
    0 0 1px green,
    0 0 1px red,
    0 0 1px gold;
}
</style>
