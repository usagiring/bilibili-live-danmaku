<template>
  <Poptip
    v-if="hasSettings(tag.key)"
    trigger="click"
    placement="bottom-start"
    transfer
    word-wrap
    width="100%">
    <ChipSpan
      :tag-kind="tag.kind"
      :tag-label="tag.display"
      @remove="$emit('remove')" />
    <template #content>
      <template v-if="tag.key === 'ROLE'"
        ><div class="tc-row">
          <span class="tc-label">舰队</span
          ><Select
            size="small"
            multiple
            :model-value="tag.data.roles"
            style="width: 220px"
            filterable
            @on-change="v => emitC({ roles: v })"
            ><Option
              v-for="r in roleOptions"
              :key="r.key"
              :value="r.key"
              :label="r.label">
              {{ r.value }}
            </Option>
          </Select>
        </div>
      </template>
      <template v-else-if="tag.key === 'FILTER'"
        ><div class="tc-row">
          <span class="tc-label">规则</span
          ><Input
            size="small"
            :model-value="tag.data.filter"
            placeholder="支持正则表达式..."
            style="width: 200px"
            @on-change="e => emitC({ filter: (e.target as any).value })" />
        </div>
      </template>
      <template v-else-if="tag.key === 'GIFT'"
        ><div class="tc-row">
          <span class="tc-label">礼物</span
          ><Select
            size="small"
            multiple
            :model-value="tag.data.giftIds"
            style="width: 200px"
            filterable
            @on-change="v => emitC({ giftIds: v })"
            ><Option
              v-for="g in giftOptions"
              :key="g.key"
              :value="g.key"
              :label="g.label"
              ><img
                v-if="g.webp"
                :src="g.webp"
                style="vertical-align: middle; width: 20px; margin-right: 4px" /><span>{{ g.value }}</span></Option
            ></Select
          >
        </div>
      </template>
      <template v-else-if="tag.key === 'PRICE'"
        ><div class="tc-row">
          <span class="tc-label">最低</span
          ><InputNumber
            size="small"
            :model-value="tag.data.priceMin"
            :min="0"
            :step="100"
            style="width: 60px"
            @on-change="v => emitC({ priceMin: v })" />
        </div>
      </template>
      <template v-else-if="tag.key === 'TEXT_REPLY'"
        ><div class="tc-note">
          <p>需要在设置里输入用户Cookie</p>
          <p>默认要求Cookie用户是当前直播间主播</p>
        </div>
        <div class="tc-row">
          <Checkbox
            :model-value="tag.data.allowAllUserDanmakuReply"
            @on-change="v => emitC({ allowAllUserDanmakuReply: v })"
            >允许任意用户回复</Checkbox
          >
        </div>
      </template>
      <template v-else-if="tag.key === 'SPEAK_REPLY'"
        ><div class="tc-row">
          <span class="tc-label">声音</span
          ><Select
            size="small"
            :model-value="tag.data.voice"
            style="width: 160px"
            @on-change="v => emitC({ voice: v })"
            ><Option
              v-for="vo in voiceOptions"
              :key="vo.key"
              :value="vo.key"
              :label="vo.label"
              >{{ vo.value }}</Option
            >
          </Select>
        </div>
        <div class="tc-row">
          <span class="tc-label">语速</span
          ><InputNumber
            size="small"
            :model-value="tag.data.speed"
            :min="0.1"
            :max="2.0"
            :step="0.1"
            style="width: 70px"
            @on-change="v => emitC({ speed: v })" /></div
      ></template>
    </template>
  </Poptip>
  <ChipSpan
    v-else
    :tag-kind="tag.kind"
    :tag-label="tag.display"
    @remove="$emit('remove')" />
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'

const ChipSpan = defineComponent({
  props: {
    tagKind: { type: String as () => 'condition' | 'action', default: 'condition' },
    tagLabel: String,
  },
  emits: ['remove'],
  setup(props, { emit }) {
    return () =>
      h('span', { class: ['chip', props.tagKind === 'condition' ? 'chip-condition' : 'chip-action'] }, [
        props.tagLabel,
        h(
          'span',
          {
            class: 'chip-close',
            onClick: (e: Event) => {
              e.stopPropagation()
              emit('remove')
            },
          },
          '×',
        ),
      ])
  },
})

const props = defineProps<{
  tag: ReplyRuleTag
  tagKind?: 'condition' | 'action'
  giftOptions?: { key: string; value: string; label: string; webp?: string }[]
  voiceOptions?: { key: string; value: string; label: string }[]
}>()

import { ReplyRuleTag } from '../types'

const roleOptions = [
  { key: 1, label: '总督', value: '总督' },
  { key: 2, label: '提督', value: '提督' },
  { key: 3, label: '舰长', value: '舰长' },
]

function hasSettings(k: string) {
  return ['ROLE', 'FILTER', 'GIFT', 'PRICE', 'TEXT_REPLY', 'SPEAK_REPLY'].includes(k)
}

const emit = defineEmits<{ 'value-change': [payload: Record<string, any>]; remove: [] }>()

function emitC(p: Record<string, any>) {
  emit('value-change', p)
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
.tc-note {
  font-size: 11px;
  color: #aaa;
  line-height: 1.6;
  margin-bottom: 8px;
}
.tc-note p {
  margin: 0;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  font-size: 11px;
  cursor: pointer;
  user-select: none;
}
.chip-condition {
  background: #f3e8ff;
  color: #7c3aed;
  border: 1px solid #e4d4f8;
}
.chip-action {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.chip-close {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  opacity: 0.5;
  transition: 0.1s;
}
.chip-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
</style>
