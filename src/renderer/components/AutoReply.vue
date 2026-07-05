<template>
  <div class="ar-page">
    <!-- Rule Cards -->
    <div class="ar-cards">
      <draggable
        v-model="rulesLocal"
        handle=".drag-handle"
        item-key="id"
        ghost-class="rule-card--ghost"
        @change="onDragChange">
        <template #item="{ element: rule }">
          <div class="rule-card">
            <div class="rule-header">
              <span class="drag-handle">☰</span>
              <label class="toggle-sm">
                <input
                  type="checkbox"
                  :checked="rule.isEnable"
                  @change="toggleEnable(rule.id)" />
                <span class="track-sm"><span class="thumb-sm"></span></span>
              </label>
              <span
                class="rule-summary"
                :class="{ empty: !ruleSummary(rule) }">
                {{ ruleSummary(rule) || '未配置触发条件和回复方式' }}
              </span>
              <button
                class="btn-del"
                @click="removeRule(rule.id)">
                ×
              </button>
            </div>
            <div class="rule-body">
              <!-- 触发类型 -->
              <div class="rule-row">
                <span class="label">触发</span>
                <Select
                  :model-value="rule.type"
                  size="small"
                  style="width: 120px"
                  @on-change="(key: string) => changeRuleType(rule.id, key)">
                  <Option
                    v-for="t in triggerTypes"
                    :key="t.key"
                    :value="t.key"
                    :label="t.label">
                    {{ t.value }}
                  </Option>
                </Select>
              </div>

              <!-- 条件 chips -->
              <div class="rule-row">
                <span class="label">条件</span>
                <div class="chip-row">
                  <template
                    v-for="tag in rule.tags.filter(t => t.kind === 'condition')"
                    :key="tag.id">
                    <ReplyRuleTag
                      :tag="tag"
                      tag-kind="condition"
                      :gift-options="giftOptions"
                      :voice-options="voiceOptions"
                      @value-change="(payload: any) => onRuleTagChange(rule.id, tag.id, payload)"
                      @remove="removeTag(rule.id, tag.id)" />
                  </template>
                  <Poptip
                    trigger="click"
                    placement="bottom-start"
                    width="100"
                    transfer>
                    <span class="add-chip">+ 条件</span>
                    <template #content>
                      <div class="pop-menu">
                        <div
                          v-for="ct of getTagOption({ kind: 'condition', type: rule.type, tags: rule.tags })"
                          :key="ct.key"
                          class="pop-item"
                          @click="addRuleTag(rule.id, ct.key)">
                          <span class="pop-dot cond"></span> {{ ct.name }}
                        </div>
                      </div>
                    </template>
                  </Poptip>
                </div>
              </div>

              <!-- 回复方式 chips -->
              <div class="rule-row">
                <span class="label">回复</span>
                <div class="chip-row">
                  <template
                    v-for="(tag, ti) in rule.tags.filter(t => t.kind === 'action')"
                    :key="tag.id">
                    <ReplyRuleTag
                      :tag="tag"
                      tag-kind="action"
                      :voice-options="voiceOptions"
                      @value-change="(payload: any) => onRuleTagChange(rule.id, tag.id, payload)"
                      @remove="removeTag(rule.id, tag.id)" />
                  </template>
                  <Poptip
                    trigger="click"
                    placement="bottom-start"
                    transfer>
                    <span class="add-chip">+ 回复</span>
                    <template #content>
                      <div class="pop-menu">
                        <div
                          v-for="at in getTagOption({ kind: 'action', type: rule.type, tags: rule.tags })"
                          :key="at.key"
                          class="pop-item"
                          @click="addRuleTag(rule.id, at.key)">
                          <span class="pop-dot act"></span> {{ at.name }}
                        </div>
                      </div>
                    </template>
                  </Poptip>
                </div>
              </div>

              <!-- 回复模板 -->
              <div class="rule-row">
                <span class="label">模板</span>
                <Input
                  :model-value="rule.text"
                  placeholder="回复内容，支持 {user} {comment} 占位符..."
                  size="small"
                  style="flex: 1"
                  @on-change="(e: any) => changeText(rule.id, e.target.value)" />
              </div>
            </div>
          </div>
        </template>
      </draggable>

      <button
        class="btn-add-rule"
        @click="addRule">
        <span style="font-size: 14px">+</span> 添加规则
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { computed, inject, reactive, onBeforeMount, ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { useConfigStore } from '../store'
import config from '../service/config'
import { updateClientConfig, getGiftList } from '../service/api'
import ReplyRuleTag from './ReplyRuleTag.vue'
import type { AutoReplyRule, ReplyRuleTag as IReplyRuleTag } from '../types'

const store = useConfigStore()
const synth = window.speechSynthesis

const tagDefs: IReplyRuleTag[] = [
  { id: '', key: 'ROLE', name: '舰队成员', kind: 'condition', display: '舰队成员：未设置', data: { roles: [] } },
  { id: '', key: 'FILTER', name: '包含文本', kind: 'condition', display: '包含文本：未设置', data: { filter: '' } },
  { id: '', key: 'GIFT', name: '指定礼物', kind: 'condition', display: '指定礼物：未设置', data: { giftIds: [] } },
  { id: '', key: 'MEDAL', name: '佩戴粉丝牌', kind: 'condition', display: '佩戴粉丝牌' },
  { id: '', key: 'PRICE', name: '金额', kind: 'condition', display: '金额 ≥ 0', data: { priceMin: 0 } },
  { id: '', key: 'TEXT_REPLY', name: '弹幕回复', kind: 'action', display: '弹幕回复', data: { allowAllUserDanmakuReply: false } },
  { id: '', key: 'SPEAK_REPLY', name: '语音播放', kind: 'action', display: '语音播放', data: { voice: '', speed: 1.0 } },
]

const triggerTypes = [
  { key: 'comment', label: '弹幕', value: '弹幕' },
  { key: 'gift', label: '礼物', value: '礼物' },
  { key: 'superchat', label: '醒目留言', value: '醒目留言' },
  { key: 'interact', label: '入场', value: '入场' },
]

const giftOptions = reactive<any[]>([])

const clientId = computed(() => store.id)
const room = computed(() => store.activeRoom)
const rules = computed(() =>
  Object.values(config.autoReplyRule)
    .filter(r => r.roomId === room.value!.id)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
)

// ── Drag & Drop (vuedraggable) ──
const rulesLocal = ref<AutoReplyRule[]>([])

watch(
  rules,
  val => {
    rulesLocal.value = [...val]
  },
  { immediate: true },
)

function onDragChange() {
  rulesLocal.value.forEach((r, i) => {
    if (config.autoReplyRule[r.id]?.sortOrder !== i) {
      config.autoReplyRule[r.id] = { ...r, sortOrder: i }
    }
  })
  // Persist the full object so all rules are synced
  updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: 'autoReplyRule', value: config.autoReplyRule }],
  }).catch(() => {})
}

onBeforeMount(async () => {
  const data = await getGiftList({ roomId: room.value!.id, roomUserId: room.value!.userId })
  const gifts = data.data
  for (const option of gifts) {
    option.label = option.id
    option.key = option.id
    option.value = option.name
    giftOptions.push(option)
  }
  // Object.assign(giftOptions, data)
})

const voiceOptions = ref<{ key: string; label: string; value: string }[]>([])

loadVoices()
synth.onvoiceschanged = loadVoices

function loadVoices() {
  const voices = synth.getVoices()
  if (voices.length) {
    voiceOptions.value = voices.map(v => ({ key: v.name, label: v.name, value: `${v.name} (${v.lang})` }))
  }
}

function ruleSummary(rule: any) {
  if (!rule.type) return ''
  const trigger = triggerTypes.find(t => t.key === rule.type)?.value || rule.type
  const conds = (rule.tags || []).filter(tag => tag.kind === 'condition').map(tag => tag.display)
  const acts = (rule.tags || []).filter(tag => tag.kind === 'action').map(tag => tag.display)
  let s = `当收到「${trigger}」`
  if (conds.length) s += '满足' + conds.map(c => `「${c}」`).join('')
  if (acts.length) s += '时，触发' + acts.map(a => `「${a}」`).join('')
  return s
}

function getTagOption({ kind, type, tags }: { kind: 'condition' | 'action'; type: string; tags?: IReplyRuleTag[] }) {
  let options = cloneDeep(tagDefs)
  options = options.filter(t => !tags?.some(tag => tag.key === t.key))
  if (kind === 'condition') {
    options = options.filter(t => t.kind === 'condition')
  } else {
    options = options.filter(t => t.kind === 'action')
  }
  if (type === 'comment') {
    options = options.filter(t => ['ROLE', 'FILTER', 'MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY'].includes(t.key))
  } else if (type === 'gift') {
    options = options.filter(t => ['ROLE', 'GIFT', 'MEDAL', 'PRICE', 'TEXT_REPLY', 'SPEAK_REPLY'].includes(t.key))
  } else if (type === 'superchat') {
    options = options.filter(t => ['ROLE', 'FILTER', 'MEDAL', 'PRICE', 'TEXT_REPLY', 'SPEAK_REPLY'].includes(t.key))
  } else if (type === 'interact') {
    options = options.filter(t => ['ROLE', 'TEXT_REPLY', 'SPEAK_REPLY'].includes(t.key))
  }

  return options
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function upsert(rule: AutoReplyRule) {
  config.autoReplyRule[rule.id] = rule
  updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: `autoReplyRule.${rule.id}`, value: rule }],
  }).catch(() => {})
}

function remove(id: string) {
  delete config.autoReplyRule[id]
  updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: `autoReplyRule`, value: config.autoReplyRule }],
  }).catch(() => {})
}

function addRule() {
  const id = uid()
  const rule: AutoReplyRule = { id, roomId: room.value!.id, type: '', text: '', isEnable: false, tags: [], sortOrder: rules.value.length }
  upsert(rule)
}

function removeRule(id: string) {
  remove(id)
}

function toggleEnable(id: string) {
  const rule = config.autoReplyRule[id]
  upsert({ ...rule, isEnable: !rule.isEnable })
}

function changeRuleType(id: string, type: string) {
  const rule = config.autoReplyRule[id]
  upsert({ ...rule, type })
}

function changeText(id: string, text: string) {
  const rule = config.autoReplyRule[id]
  upsert({ ...rule, text })
}

function addRuleTag(ruleId: string, key: string) {
  const tag: IReplyRuleTag = cloneDeep(tagDefs.find(t => t.key === key))
  tag.id = uid()
  const rule = config.autoReplyRule[ruleId]
  const tags = rule.tags || []
  tags.push(tag)

  upsert({ ...rule, tags: rule.tags })
}
function removeTag(ruleId: string, tagId: string) {
  const rule = config.autoReplyRule[ruleId]
  if (!rule) return
  const tags = [...(rule.tags || [])].filter(t => t.id !== tagId)
  upsert({ ...rule, tags })
}

function onRuleTagChange(ruleId: string, tagId: string, payload: Partial<IReplyRuleTag>) {
  const rule = config.autoReplyRule[ruleId]
  const tags = rule.tags || []
  const tag = tags.find(t => t.id === tagId) || {}
  Object.assign(tag, payload)

  upsert({ ...rule, tags })
}
</script>

<style scoped>
.ar-page {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 14px;
  box-sizing: border-box;
}

/* ── Alert ── */
.ar-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: #e8f4fd;
  border: 1px solid #bbd4f5;
  border-radius: 8px;
  font-size: 12px;
  color: #515a6e;
  margin-bottom: 12px;
  flex-shrink: 0;
}

/* ── Cards container ── */
.ar-cards {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* ── Rule Card ── */
.rule-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  margin-bottom: 10px;
  overflow: hidden;
  border: 1px solid transparent;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.rule-card:hover {
  border-color: #e8eaec;
}
.rule-card--ghost {
  opacity: 0.4;
  border-color: #2d8cf0;
  box-shadow: 0 0 0 2px rgba(45, 140, 240, 0.15);
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid #f5f5f5;
  background: #fafbfc;
}
.drag-handle {
  color: #ccc;
  cursor: grab;
  font-size: 14px;
  user-select: none;
}
.drag-handle:active {
  cursor: grabbing;
}

.rule-summary {
  flex: 1;
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.rule-summary.empty {
  color: #ccc;
  font-style: italic;
}

.btn-del {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #ccc;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.15s;
}
.btn-del:hover {
  color: #ed4014;
  background: rgba(237, 64, 20, 0.06);
}

.rule-body {
  padding: 12px 14px;
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.rule-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  min-width: 32px;
}

/* ── Toggle ── */
.toggle-sm {
  position: relative;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}
.toggle-sm input {
  display: none;
}
.toggle-sm .track-sm {
  position: absolute;
  inset: 0;
  background: #ddd;
  border-radius: 20px;
  transition: 0.2s;
  cursor: pointer;
}
.toggle-sm .thumb-sm {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
.toggle-sm input:checked + .track-sm {
  background: #19be6b;
}
.toggle-sm input:checked + .track-sm .thumb-sm {
  transform: translateX(16px);
}

/* ── Chips ── */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
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
.chip-gear {
  font-size: 10px;
  opacity: 0.4;
  cursor: pointer;
}
.chip-gear:hover {
  opacity: 0.7;
}

.add-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  font-size: 11px;
  border: 1px dashed #ccc;
  color: #999;
  background: transparent;
  cursor: pointer;
  transition: 0.15s;
}
.add-chip:hover {
  border-color: #2d8cf0;
  color: #2d8cf0;
}

/* ── Popover menu ── */
.pop-menu {
  padding: 4px;
  min-width: 140px;
}
.pop-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: #555;
  white-space: nowrap;
}
.pop-item:hover {
  background: #f0f2f5;
  color: #333;
}
.pop-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pop-dot.cond {
  background: #7c3aed;
}
.pop-dot.act {
  background: #16a34a;
}

/* ── Sub settings ── */
.sub-row {
  padding-left: 40px;
  margin-top: -4px;
}
.sub-settings {
  display: flex;
  gap: 16px;
  align-items: center;
  background: #f9fafb;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #f0f0f0;
}
.sub-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.sub-label {
  font-size: 11px;
  color: #999;
}

.speed-ctl {
  display: inline-flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}
.speed-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}
.speed-btn:hover {
  background: #f0f2f5;
}
.speed-val {
  width: 32px;
  text-align: center;
  font-size: 12px;
  color: #333;
  font-weight: 600;
}

/* ── Add rule button ── */
.btn-add-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 30px;
  border: 1px dashed #ddd;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  color: #999;
  font-size: 12px;
  cursor: pointer;
  transition: 0.15s;
  flex-shrink: 0;
}
.btn-add-rule:hover {
  border-color: #2d8cf0;
  color: #2d8cf0;
}
</style>
