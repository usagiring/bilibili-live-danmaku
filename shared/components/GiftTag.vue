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
      <span v-if="type === 2">{{ count === 1 ? name : `${name}×${count}` }}</span>
      <span v-else-if="totalPrice">{{ formattedPrice }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, toRefs } from 'vue'

const props = defineProps<{ gift: any; face?: string; sendAt: number }>()
const { priceProperties, totalPrice, name, count, type } = toRefs(props.gift)
const color1 = computed(() => priceProperties.value?.colors[0])
const color2 = computed(() => priceProperties.value?.colors[1])

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
  const duration = priceProperties.value?.duration
  if (!existsTime.value || !duration) return 100
  return Math.max(0, Math.floor((1 - existsTime.value / duration) * 100))
})

const formattedPrice = computed(() => {
  const price = totalPrice.value
  return `￥${Number.isSafeInteger(price) ? Number(price).toFixed(0) : Number(price).toFixed(1)}`
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
}
.gift-tag-progress {
  z-index: -1;
  position: absolute;
  height: 100%;
}
.gift-tag-avatar {
  margin-top: -2px;
}
.gift-tag-content-wrapper {
  padding: 0 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
