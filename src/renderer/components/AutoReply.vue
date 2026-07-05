<template>
  <div class="ar-page">
    <!-- Alert -->
    <div class="ar-alert">
      <Icon
        type="md-information-circle"
        :style="{ 'font-size': '16px', flexShrink: 0 }" />
      <span> 未设置Cookie时，弹幕回复不生效。可用占位符：{user} {gift} {comment} {superchat} {@user} </span>
    </div>

    <!-- Rule Cards -->
    <div class="ar-cards">
      <div
        v-for="(rule, index) in rules"
        :key="rule.id"
        class="rule-card"
        :class="{ disabled: !rule.isEnable }">
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
                v-for="(tag, ti) in rule.tags.filter((t: any) => isConditionTag(t))"
                :key="ti">
                <Poptip
                  v-if="hasSettings(tag.key)"
                  trigger="click"
                  placement="bottom-start"
                  transfer
                  word-wrap
                  width="100%">
                  <span class="chip chip-condition">
                    {{ conditionLabel(tag) }}
                    <span
                      class="chip-close"
                      @click.stop="removeTag(rule.id, ti)">
                      ×
                    </span>
                  </span>
                  <template #content>
                    <TagContent
                      :tag-key="tag.key"
                      :data="tag.data"
                      :gift-options="giftOpts[ti] || undefined"
                      :voice-options="voiceOptions"
                      @value-change="(payload: any) => onRuleTagChange(rule.id, ti, payload)" />
                  </template>
                </Poptip>
                <span
                  v-else
                  class="chip chip-condition">
                  {{ conditionLabel(tag) }}
                  <span
                    class="chip-close"
                    @click.stop="removeTag(rule.id, ti)"
                    >×</span
                  >
                </span>
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
                      v-for="ct in conditionTagDefs"
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
              <span
                v-for="(tag, ti) in rule.tags.filter((t: any) => isActionTag(t))"
                :key="ti"
                class="chip chip-action">
                {{ actionLabel(tag) }}
                <span
                  class="chip-close"
                  @click.stop="removeTag(rule.id, ti)">
                  ×
                </span>
              </span>
              <Poptip
                trigger="click"
                placement="bottom-start"
                transfer>
                <span class="add-chip">+ 回复</span>
                <template #content>
                  <div class="pop-menu">
                    <div
                      v-for="at in actionTagDefs"
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
    </div>

    <!-- Add button -->
    <button
      class="btn-add-rule"
      @click="addRule">
      <span style="font-size: 18px">+</span> 添加规则
    </button>
  </div>
</template>

<script setup lang="ts">
import { cloneDeep } from 'lodash'
import { computed, inject, reactive, ref } from 'vue'
import { useConfigStore } from '../store'
import config from '../service/config'
import { updateClientConfig, getGiftConfig } from '../service/api'
import TagContent from './TagContent.vue'
import { AutoReplyRule, ReplyRuleTag } from '../types'

const globalValue = inject<any>('globalValue', {})
const store = useConfigStore()

// ── Tag definitions ──
const roleOptions = [
  { key: 1, label: '总督', value: '总督' },
  { key: 2, label: '提督', value: '提督' },
  { key: 3, label: '舰长', value: '舰长' },
]

const conditionTagDefs = [
  { key: 'ROLE', name: '舰队成员' },
  { key: 'FILTER', name: '包含文本' },
  { key: 'GIFT', name: '指定礼物' },
  { key: 'MEDAL', name: '佩戴粉丝牌' },
  { key: 'PRICE', name: '金额阈值' },
]

const actionTagDefs = [
  { key: 'TEXT_REPLY', name: '弹幕回复' },
  { key: 'SPEAK_REPLY', name: '语音播放' },
]

const tagDefMap: Record<string, ReplyRuleTag> = {
  ROLE: { key: 'ROLE', name: '舰队', data: { roles: [] } },
  FILTER: { key: 'FILTER', name: '包含文本', data: { filter: '' } },
  GIFT: { key: 'GIFT', name: '指定礼物', data: { giftIds: [] } },
  MEDAL: { key: 'MEDAL', name: '佩戴粉丝牌' },
  PRICE: { key: 'PRICE', name: '金额阈值', data: { priceMin: 0 } },
  TEXT_REPLY: { key: 'TEXT_REPLY', name: '弹幕回复', data: { allowAllUserDanmakuReply: false } },
  SPEAK_REPLY: { key: 'SPEAK_REPLY', name: '语音播放', data: { voice: '', speed: 1.0 } },
}

const tagsWithSettings = ['ROLE', 'FILTER', 'GIFT', 'PRICE', 'TEXT_REPLY', 'SPEAK_REPLY']
function hasSettings(key: string) {
  return tagsWithSettings.includes(key)
}

// gift options cache per condition chip
const giftOpts = reactive<Record<number, any[]>>({})

const triggerTypes = [
  { key: 'comment', label: '弹幕', value: '弹幕' },
  { key: 'gift', label: '礼物', value: '礼物' },
  { key: 'superchat', label: '醒目留言', value: '醒目留言' },
  { key: 'interact', label: '入场', value: '入场' },
]

const dropAcceptRules: Record<string, string[]> = {
  comment: ['ROLE', 'FILTER', 'MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY'],
  gift: ['ROLE', 'GIFT', 'PRICE', 'TEXT_REPLY', 'SPEAK_REPLY'],
  superchat: ['FILTER', 'TEXT_REPLY', 'SPEAK_REPLY'],
  interact: ['MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY'],
}

// ── State ──
const clientId = computed(() => store.id)
const roomId = computed(() => store.activeRoom!.id)
const rules = computed(() => Object.values(config.autoReplyRule).filter(r => r.roomId === roomId.value))

// Convert rules array to object for save
function rulesToObj(rules: any[]) {
  const obj: Record<string, any> = {}
  for (const r of rules) obj[r.id] = r
  return obj
}

const speechExpanded = reactive<Record<string, boolean>>({})

const voiceOptions = computed(() => globalValue?.voices?.map((v: any) => ({ key: v.name, label: v.name, value: v.name })) || [])

// ── Helpers ──
function isConditionTag(tag: any) {
  return conditionTagDefs.some(d => d.key === tag.key)
}
function isActionTag(tag: any) {
  return actionTagDefs.some(d => d.key === tag.key)
}
function ruleHasSpeech(rule: any) {
  return rule.tags?.some((t: any) => t.key === 'SPEAK_REPLY')
}
function getSpeechTag(rule: any) {
  return rule.tags?.find((t: any) => t.key === 'SPEAK_REPLY')
}
function getSpeechData(rule: any) {
  return getSpeechTag(rule)?.data || { voice: '', speed: 1.0 }
}

function conditionLabel(tag: any) {
  if (tag.key === 'ROLE') return '舰队：' + (roleNames(tag) || '未设置')
  if (tag.key === 'FILTER') return '包含文本：' + (tag.data?.filter || '未设置')
  if (tag.key === 'GIFT') return '指定礼物：' + (giftName(tag) || '未设置')
  if (tag.key === 'MEDAL') return '佩戴粉丝牌'
  if (tag.key === 'PRICE') return `金额阈值：${tag.data?.priceMin || 0} 元`
  return tag.name
}

function actionLabel(tag: any) {
  if (tag.key === 'TEXT_REPLY') return '弹幕回复'
  if (tag.key === 'SPEAK_REPLY') return '语音播放'
  return tag.name
}

function ruleSummary(rule: any) {
  if (!rule.type) return ''
  const trigger = triggerTypes.find(t => t.key === rule.type)?.value || rule.type
  const conds = (rule.tags || []).filter(isConditionTag).map(conditionLabel)
  const acts = (rule.tags || []).filter(isActionTag).map(actionLabel)
  const tmpl = rule.text ? ' ' + rule.text : ''
  let s = `当「${trigger}」`
  if (conds.length) s += '满足' + conds.map(c => `「${c}」`).join('')
  if (acts.length) s += '时，触发' + acts.map(a => `「${a}」`).join('')
  s += tmpl
  return s
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function makeTag(key: string) {
  return { id: uid(), ...cloneDeep(tagDefMap[key]) }
}

// ── Save ──
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

// ── Actions ──
function addRule() {
  const id = uid()
  const rule: AutoReplyRule = { id, roomId: roomId.value, type: '', text: '', isEnable: false, tags: [] }
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

async function addRuleTag(ruleId: string, key: string) {
  const tag: ReplyRuleTag = cloneDeep(tagDefMap[key])

  // const tagIndex = (_rules[ruleIndex].tags || []).length
  // if (key === 'GIFT') {
  //   try {
  //     const { data: gc } = await getGiftConfig(roomId.value)
  //     const opts: any[] = []
  //     for (const [k, v] of Object.entries(gc as Record<string, any>)) {
  //       opts.push({ key: k, value: v.name, label: v.name, webp: v.webp })
  //     }
  //     giftOpts[tagIndex] = opts
  //   } catch {
  //     /* ignore */
  //   }
  // }
  const rule = config.autoReplyRule[ruleId]
  const tags = rule.tags || []
  tags.push(tag)

  upsert({ ...rule, tags: rule.tags })
}

// async function addAction(ruleIndex: number, key: string) {
//   const _rules: any[] = cloneDeep(rules.value)
//   const tag = makeTag(key)
//   _rules[ruleIndex].tags = _rules[ruleIndex].tags || []
//   _rules[ruleIndex].tags.push(tag)
//   if (key === 'SPEAK_REPLY') speechExpanded[ruleIndex] = true
//   config.autoReplyRule = { ...cloneDeep(config.autoReplyRule), ...rulesToObj(_rules) }
//   upsert()
// }

function removeTag(ruleId: string, tagIndex: number) {
  const rule = config.autoReplyRule[ruleId]
  if (!rule) return
  const tags = [...(rule.tags || [])]
  tags.splice(tagIndex, 1)
  upsert({ ...rule, tags })
}

function onRuleTagChange(ruleId: string, tagIndex: number, data: any) {
  const rule = config.autoReplyRule[ruleId]
  const tags = rule.tags || []
  const tag = tags[tagIndex]
  tag.data = { ...tag.data, ...data }
  upsert({ ...rule, tags })
}

// function updateSpeechData(index: number, data: any) {
//   const _rules: any[] = cloneDeep(rules.value)
//   const tag = getSpeechTag(_rules[index])
//   if (tag) tag.data = { ...tag.data, ...data }
//   config.autoReplyRule = { ...cloneDeep(config.autoReplyRule), ...rulesToObj(_rules) }
//   upsert()
// }

// function changeSpeed(index: number, delta: number) {
//   const _rules: any[] = cloneDeep(rules.value)
//   const tag = getSpeechTag(_rules[index])
//   if (tag) {
//     const sp = Math.max(0.1, Math.min(2.0, (tag.data.speed || 1.0) + delta))
//     tag.data.speed = Math.round(sp * 10) / 10
//   }
//   config.autoReplyRule = { ...cloneDeep(config.autoReplyRule), ...rulesToObj(_rules) }
//   upsert()
// }

// ── Transfer fns ──
function roleNames(tag: any) {
  const keys: number[] = tag.data?.roles || []
  return keys
    .map((k: number) => roleOptions.find(o => o.key === k)?.value)
    .filter(Boolean)
    .join(', ')
}

function giftName(tag: any) {
  const ids: string[] = tag.data?.giftIds || []
  // gift opts are stored by tag key, find matching names from giftOpts
  const opts: any[] = []
  for (const key of Object.keys(giftOpts)) {
    opts.push(...(giftOpts[Number(key)] || []))
  }
  return ids
    .map((k: string) => opts.find((o: any) => o.key === k)?.value || '')
    .filter(Boolean)
    .join(', ')
}
</script>

<style scoped>
.ar-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 14px;
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
  transition: border-color 0.15s;
}
.rule-card:hover {
  border-color: #e8eaec;
}
.rule-card.disabled {
  opacity: 0.55;
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
  gap: 6px;
  width: 100%;
  height: 36px;
  border: 1px dashed #ccc;
  border-radius: 10px;
  background: transparent;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  transition: 0.15s;
  flex-shrink: 0;
  margin-top: 4px;
}
.btn-add-rule:hover {
  border-color: #2d8cf0;
  color: #2d8cf0;
  background: rgba(45, 140, 240, 0.03);
}
</style>
