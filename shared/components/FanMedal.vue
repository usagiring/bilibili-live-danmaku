<template>
  <div :style="{ display: 'inline-block' }">
    <img
      v-if="anchorIcon"
      class="anchor-icon"
      :src="`${anchorIcon}`" />

    <span :style="getStyle()">
      {{ medal?.name }}
      <span :style="getLevelStyle()"> {{ getLevelText(medal?.level) }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  medal: Object,
  anchorIcon: String,
})

function getLevelText(level: number) {
  return String(level).padStart(2, '0')
}

function getStyle() {
  return {
    background: props.medal?.color?.bg,
    color: props.medal?.color?.text,
    border: `solid 0.5px ${props.medal?.color?.border}`,
    'font-size': '12px',
    'border-radius': '10px',
    padding: `2px 2.5px 2px ${props.anchorIcon ? 15 : 4}px`,
  }
}
function getLevelStyle() {
  return {
    'border-radius': '10px',
    color: props.medal?.color?.level,
    background: '#FFFFFF',
    'font-size': '11px',
    padding: '1px 2px 1px 1px',
    'margin-left': '-2px',
  }
}
</script>

<style scoped>
.anchor-icon {
  width: 22px;
  margin-right: -16px;
  position: relative;
  vertical-align: middle;
}
</style>
