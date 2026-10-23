<template>
  <span class="segmented">
    <span
      v-for="item in WINDOW_TOP_LEVELS"
      :key="item.value"
      class="seg-item"
      :class="{ on: current === item.value }"
      :title="item.tip"
      @click="select(item.value)">
      {{ item.label }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WINDOW_TOP_LEVELS, normalizeTopLevel, type WindowTopLevel } from '../../service/const'

const props = withDefaults(
  defineProps<{
    modelValue?: string
  }>(),
  { modelValue: 'off' },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: WindowTopLevel): void }>()

const current = computed(() => normalizeTopLevel(props.modelValue))

function select(value: WindowTopLevel) {
  if (value === current.value) return
  emit('update:modelValue', value)
}
</script>

<style scoped>
.segmented {
  display: inline-flex;
  background: #f0f2f5;
  border-radius: 11px;
  padding: 2px;
}

.seg-item {
  height: 20px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #999;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.15s;
  user-select: none;
  white-space: nowrap;
}

.seg-item:hover {
  color: #2d8cf0;
}

.seg-item.on {
  background: #fff;
  color: #2d8cf0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}
</style>
