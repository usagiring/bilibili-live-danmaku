<template>
  <div
    :class="`comment-similar-badge animated ${animateKey}`"
    :style="{ background: `${randomColor}` }">
    {{ number }}
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { shuffle } from 'lodash'
import { COLORS } from '../service/const'

const props = defineProps<{ number: number }>()
const animateKey = ref('')

const colorPool = shuffle(COLORS)
const randomColor = computed(() => {
  const color = colorPool.shift()!
  colorPool.push(color)
  return color
})
</script>

<style scoped>
.comment-similar-badge {
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: inline-block;
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  background: orange;
  color: white;
  padding-right: 1px;
}
</style>
