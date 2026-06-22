<template>
  <div
    :class="`comment-similar-badge animated`"
    :style="{ background: `${color}` }">
    {{ number }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  number: number
  color: string
}>()
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
