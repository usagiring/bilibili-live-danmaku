<template>
  <div :style="{ display: 'inline-block' }">
    <img v-if="role" class="guard-icon" :src="`${GUARD_ICON_MAP[role]}`" />

    <span :style="getStyle()">
      {{ medal.name }}
      <span :style="getLevelStyle()"> {{ medal.level < 10 ? `0${medal.level}` : medal.level }}</span>
    </span>
  </div>
</template>

<script setup>
import { GUARD_ICON_MAP } from '../../service/const'

const props = defineProps({
  medal: Object,
  role: String,
})

function getStyle() {
  return {
    background: props.medal?.color?.background,
    color: props.medal?.color?.text,
    border: `solid 0.5px ${props.medal?.color?.border}`,
    'font-size': '12px',
    'border-radius': '10px',
    padding: `2px 2.5px 2px ${props.role ? 15 : 4}px`,
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
.guard-icon {
  width: 22px;
  margin-right: -16px;
  position: relative;
  vertical-align: middle;
}
</style>
