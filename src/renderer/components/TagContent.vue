<template>
  <div class="tag-content">
    <!-- ROLE: 舰队身份 -->
    <template v-if="tagKey === 'ROLE'">
      <div class="tc-row">
        <span class="tc-label">舰队</span>
        <Select
          size="small"
          multiple
          :model-value="data.roles"
          style="width: 220px"
          filterable
          @on-change="v => emitChange({ roles: v })">
          <Option
            v-for="r in roleOptions"
            :key="r.key"
            :value="r.key"
            :label="r.label">
            {{ r.value }}
          </Option>
        </Select>
      </div>
    </template>

    <!-- FILTER: 文本匹配 -->
    <template v-if="tagKey === 'FILTER'">
      <div class="tc-row">
        <span class="tc-label">规则</span>
        <Input
          size="small"
          :model-value="data.filter"
          placeholder="支持正则表达式..."
          style="width: 200px"
          @on-change="e => emitChange({ filter: (e.target as any).value })" />
      </div>
    </template>

    <!-- GIFT: 指定礼物 -->
    <template v-if="tagKey === 'GIFT'">
      <div class="tc-row">
        <span class="tc-label">礼物</span>
        <Select
          size="small"
          multiple
          :model-value="data.giftIds"
          style="width: 200px"
          filterable
          @on-change="v => emitChange({ giftIds: v })">
          <Option
            v-for="g in giftOptions"
            :key="g.key"
            :value="g.key"
            :label="g.label">
            <img
              v-if="g.webp"
              :src="g.webp"
              style="vertical-align: middle; width: 20px; margin-right: 4px" />
            <span>{{ g.value }}</span>
          </Option>
        </Select>
      </div>
    </template>

    <!-- PRICE: 金额区间 -->
    <template v-if="tagKey === 'PRICE'">
      <div class="tc-row">
        <span class="tc-label">最低</span>
        <InputNumber
          size="small"
          :model-value="data.priceMin"
          :min="0"
          :step="100"
          style="width: 60px"
          @on-change="v => emitChange({ priceMin: v })" />
      </div>
    </template>

    <!-- TEXT_REPLY: 弹幕回复说明 -->
    <template v-if="tagKey === 'TEXT_REPLY'">
      <div class="tc-note">
        <p>需要在设置里输入用户Cookie</p>
        <p>默认要求Cookie用户是当前直播间主播</p>
      </div>
      <div class="tc-row">
        <Checkbox
          :model-value="data.allowAllUserDanmakuReply"
          @on-change="v => emitChange({ allowAllUserDanmakuReply: v })">
          允许任意用户回复
        </Checkbox>
      </div>
    </template>

    <!-- SPEAK_REPLY: 语音播放 -->
    <template v-if="tagKey === 'SPEAK_REPLY'">
      <div class="tc-row">
        <span class="tc-label">声音</span>
        <Select
          size="small"
          :model-value="data.voice"
          style="width: 160px"
          @on-change="v => emitChange({ voice: v })">
          <Option
            v-for="vo in voiceOptions"
            :key="vo.key"
            :value="vo.key"
            :label="vo.label">
            {{ vo.value }}
          </Option>
        </Select>
      </div>
      <div class="tc-row">
        <span class="tc-label">语速</span>
        <InputNumber
          size="small"
          :model-value="data.speed"
          :min="0.1"
          :max="2.0"
          :step="0.1"
          style="width: 70px"
          @on-change="v => emitChange({ speed: v })" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tagKey: string
  data: Record<string, any>
  giftOptions?: { key: string; value: string; label: string; webp?: string }[]
  voiceOptions?: { key: string; value: string; label: string }[]
}>()

const emit = defineEmits<{
  'value-change': [payload: Record<string, any>]
}>()

const roleOptions = [
  { key: 1, label: '总督', value: '总督' },
  { key: 2, label: '提督', value: '提督' },
  { key: 3, label: '舰长', value: '舰长' },
]

function emitChange(payload: Record<string, any>) {
  emit('value-change', payload)
}
</script>

<style scoped>
.tag-content {
  font-size: 12px;
}
.tc-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}
.tc-row:last-child {
  margin-bottom: 0;
}
.tc-label {
  color: #888;
  font-size: 11px;
  white-space: nowrap;
  min-width: 28px;
}
.tc-sep {
  color: #ccc;
  font-size: 11px;
}
.tc-note {
  font-size: 11px;
  color: #aaa;
  line-height: 1.6;
  margin-bottom: 8px;
}
.tc-note p {
  margin: 0;
}
</style>
