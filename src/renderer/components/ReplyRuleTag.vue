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
            @on-change="v => changeRole(v)"
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
            @on-change="e => changeFilter((e.target as any).value)" />
        </div>
      </template>
      <template v-else-if="tag.key === 'GIFT'"
        ><div class="tc-row">
          <span class="tc-label">礼物</span>
          <Select
            size="small"
            multiple
            :model-value="tag.data.giftIds"
            style="width: 200px"
            filterable
            @on-change="v => changeGift(v)">
            <Option
              v-for="g in giftOptions"
              :key="g.key"
              :value="g.key"
              :label="g.value">
              <img
                v-if="g.webp"
                :src="g.webp"
                style="vertical-align: middle; width: 20px; margin-right: 4px" />
              <span>{{ g.value }}</span>
            </Option>
          </Select>
        </div>
      </template>
      <template v-else-if="tag.key === 'PRICE'"
        ><div class="tc-row">
          <span class="tc-label">金额 ≥ </span>
          <InputNumber
            size="small"
            :model-value="tag.data.priceMin"
            :min="0"
            :step="10"
            style="width: 60px"
            @on-change="v => changePrice(v)" />
        </div>
      </template>
      <template v-else-if="tag.key === 'MEDAL'"
        ><div class="tc-row">
          <span class="tc-label">粉丝牌 ≥</span>
          <InputNumber
            size="small"
            :model-value="tag.data?.level"
            :min="1"
            style="width: 60px"
            placeholder="1"
            @on-change="v => changeMedal(v)" />
        </div>
      </template>
      <template v-else-if="tag.key === 'TEXT_REPLY'"
        ><div class="tc-note">
          <p>弹幕回复需要在设置里输入用户Cookie</p>
          <p>默认要求用户Cookie是当前直播间主播</p>
        </div>
        <div class="tc-row">
          <Checkbox
            :model-value="tag.data.allowAllUserDMReply"
            @on-change="v => changeTextReply(v)">
            允许任意用户回复
          </Checkbox>
        </div>
      </template>
      <template v-else-if="tag.key === 'SPEAK_REPLY'">
        <div class="tc-col">
          <div class="tc-row">
            <span class="tc-label">声音</span
            ><Select
              size="small"
              :model-value="tag.data.voice"
              style="width: 150px"
              filterable
              @on-change="v => changeVoice(v)">
              <Option
                v-for="vo in voiceOptions"
                :key="vo.key"
                :value="vo.key"
                :label="vo.label">
                {{ vo.value }}
                <span style="color: #bbb; font-size: 10px">{{ vo.lang }}</span>
              </Option>
            </Select>
          </div>
          <div class="tc-row">
            <span class="tc-label">语速</span>
            <InputNumber
              size="small"
              :model-value="tag.data.speed"
              :min="0.1"
              :max="2.0"
              :step="0.1"
              style="width: 70px"
              @on-change="v => changeVoiceSpeed(v)" />
          </div>
        </div>
      </template>
    </template>
  </Poptip>
  <ChipSpan
    v-else
    :tag-kind="tag.kind"
    :tag-label="tag.display"
    @remove="$emit('remove')" />
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { ReplyRuleTag } from '../types'

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
  voiceOptions?: { key: string; value: string; label: string; lang: string }[]
}>()

const emit = defineEmits<{ 'value-change': [payload: Record<string, any>]; remove: [] }>()

const roleOptions = [
  { key: 3, label: '总督', value: '总督' },
  { key: 2, label: '提督', value: '提督' },
  { key: 1, label: '舰长', value: '舰长' },
]

function hasSettings(k: string) {
  return ['ROLE', 'FILTER', 'GIFT', 'PRICE', 'MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY'].includes(k)
}

function changeRole(v: number[]) {
  const labels = roleOptions.filter(r => v.includes(r.key)).map(r => r.value)
  const display = `舰队成员：${labels.length ? labels.join('，') : '未设置'}`
  emit('value-change', { display, data: { roles: v } })
}

function changeFilter(filter: string) {
  const display = `文本包含：${filter}`
  emit('value-change', { display, data: { filter } })
}

function changeGift(giftIds: string[]) {
  const labels = props.giftOptions?.filter(g => giftIds.includes(g.key)).map(g => g.value) || []
  const display = `指定礼物：${labels.length ? labels.join('，') : '未设置'}`
  emit('value-change', { display, data: { giftIds } })
}

function changePrice(priceMin: number) {
  if (!priceMin || !Number.isFinite(priceMin)) priceMin = 0
  const display = `金额 ≥ ${priceMin} 元`
  emit('value-change', { display, data: { priceMin } })
}

function changeMedal(level: number) {
  if (!level || !Number.isFinite(level) || level < 1) level = 1
  const display = `粉丝牌 ≥ ${level} 级`
  emit('value-change', { display, data: { level } })
}

function changeTextReply(allowAllUserDMReply: boolean) {
  emit('value-change', { data: { allowAllUserDMReply } })
}

function changeVoice(voice: string) {
  emit('value-change', { data: { voice } })
}

function changeVoiceSpeed(speed: number) {
  emit('value-change', { data: { speed } })
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
.tc-col {
  display: flex;
  flex-direction: column;
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
