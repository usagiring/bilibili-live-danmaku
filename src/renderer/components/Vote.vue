<template>
  <div class="vote-page">
    <!-- 顶部区域（白色背景） -->
    <div class="vote-header">
      <!-- Row 1: 操作栏 -->
      <div class="vote-toolbar">
        <div class="toolbar-left">
          <button
            class="btn btn-primary"
            :disabled="isWatching"
            @click="start">
            <Icon
              type="md-play"
              size="12" />
            开始
          </button>
          <button
            class="btn btn-danger"
            :disabled="!isWatching"
            @click="stop">
            <Icon
              type="md-square"
              size="12" />
            停止
          </button>
          <span
            v-if="isWatching && duration > 0"
            class="countdown-area">
            <Icon
              type="md-timer"
              size="14" />
            {{ countdown }}
          </span>
        </div>
        <button
          class="btn btn-default"
          @click="showVoteRecord">
          <Icon
            type="md-list"
            size="12" />
          记录
        </button>
      </div>

      <!-- Row 2: 定时 + 设置芯片 -->
      <div class="vote-chips">
        <span class="timer-inline">
          <span class="toolbar-label">定时</span>
          <InputNumber
            size="small"
            :style="{ width: '46px' }"
            :model-value="duration"
            :min="0"
            :step="10"
            :disabled="isWatching"
            @on-change="changeDuration" />
          <span class="toolbar-unit">秒</span>
        </span>
        <Tooltip
          placement="bottom"
          transfer>
          <span
            class="chip"
            :class="{ on: isAccurateMatch }"
            :style="{ pointerEvents: isWatching ? 'none' : 'auto', opacity: isWatching ? 0.5 : 1 }"
            @click="changeIsAccurateMatch">
            精确匹配
          </span>
          <template #content> 弹幕与关键字必须完全一致 </template>
        </Tooltip>
        <Tooltip
          placement="bottom"
          transfer>
          <span
            class="chip"
            :class="{ on: isAllowReVote }"
            :style="{ pointerEvents: isWatching ? 'none' : 'auto', opacity: isWatching ? 0.5 : 1 }"
            @click="changeAllowReVote"
            >允许改票</span
          >
          <template #content> 同一位用户投票记录以最后一次为准 </template>
        </Tooltip>
        <!-- <Button
          size="small"
          class="btn-xs"
          :disabled="!isWatching"
          style="margin-left: auto"
          @click="sendTestDanmaku">
          测试弹幕
        </Button> -->
      </div>
    </div>

    <!-- 主体: 侧边栏 + 图 -->
    <div class="vote-body">
      <!-- 左侧边栏 -->
      <div class="vote-sidebar">
        <div class="side-card">
          <div class="side-card-title">投票关键词</div>
          <div class="keyword-list">
            <div
              v-for="(item, index) in options"
              :key="index"
              class="keyword-row">
              <span
                class="kw-dot"
                :style="{ background: chartColors[index] }"></span>
              <div class="kw-inputs">
                <Input
                  :model-value="item.value"
                  :disabled="isWatching"
                  size="small"
                  placeholder="关键字"
                  @on-change="changeOptionKeyword(index, $event)" />
              </div>
              <Icon
                v-if="!isWatching"
                type="md-close-circle"
                size="16"
                color="#ed4014"
                class="kw-remove"
                @click="removeOption(index)" />
            </div>
          </div>
          <Button
            type="dashed"
            long
            size="small"
            :disabled="isWatching"
            @click="addOption"
            style="margin-top: 6px">
            <Icon type="md-add" /> 添加
          </Button>
        </div>

        <div class="side-card side-info">
          <div class="side-card-title">说明</div>
          <p>⚠️ 未设置Cookie时，仅以弹幕内容作为投票依据，同一用户可多次投票。</p>
        </div>
      </div>

      <!-- 右侧单图 -->
      <div class="vote-charts">
        <div class="chart-card">
          <div class="chart-top-bar">
            <span class="segmented">
              <span
                class="seg-item"
                :class="{ on: chartType === 'pie' }"
                @click="toggleChartType('pie')"
                >饼图</span
              >
              <span
                class="seg-item"
                :class="{ on: chartType === 'bar' }"
                @click="toggleChartType('bar')"
                >柱状图</span
              >
            </span>
            <div class="chart-stats">
              <span class="stat-item"
                >总票 <b>{{ totalVotes }}</b></span
              >
              <span class="stat-sep">|</span>
              <span class="stat-item"
                ><b>{{ totalUsers }}</b> 人</span
              >
              <span class="stat-sep">|</span>
              <span class="stat-item"
                >运行 <b>{{ elapsedDisplay }}</b></span
              >
            </div>
          </div>
          <div
            id="chart"
            class="chart-body"></div>
        </div>
      </div>
    </div>

    <!-- 投票记录弹窗 -->
    <Modal
      v-model="isShowVoteRecord"
      title="投票记录"
      scrollable
      footer-hide
      transfer
      :styles="{ height: '70%', overflow: 'auto' }">
      <div
        v-if="!Object.keys(userMap).length"
        style="text-align: center; color: #ccc; padding: 40px">
        暂无投票数据
      </div>
      <table
        v-else
        class="record-table">
        <thead>
          <tr>
            <th class="col-opt">选项</th>
            <th class="col-msg">弹幕</th>
            <th class="col-time">时间</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, uid) in userMap"
            :key="uid">
            <td class="col-opt">
              <span
                class="kw-tag"
                :style="{ background: chartColors[item.index], color: '#fff' }"
                >{{ item.keyword }}</span
              >
            </td>
            <td class="col-msg">{{ item.username }}: {{ item.content }}</td>
            <td class="col-time">{{ item.time }}</td>
          </tr>
        </tbody>
      </table>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, onBeforeUnmount, toRefs } from 'vue'
import * as echarts from 'echarts'
import { shuffle } from 'lodash'
import { sse } from '../service/sse-client'
import { COLORS } from '../../service/const'
import config from '../service/config'
import { updateClientConfig } from '../service/api'
import { Message } from '@tokine/shared/types.js'
import { dateFormat } from '@tokine/shared'

// ── module-level state ──
let chartData: any[] = []
let keywords: string[] = []
let optionRegexps: RegExp[] = []
let colorPool: string[] = shuffle(COLORS)
let chartRef: echarts.EChartsType | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
let countdownEnd = 0
let elapsedTimer: ReturnType<typeof setInterval> | null = null

const { options, isAccurateMatch, isAllowReVote, duration } = toRefs(config.voteConfig)
const clientId = computed(() => config.id)
// ── local reactive state ──
const isWatching = ref(false)
const isShowVoteRecord = ref(false)
const userMap = ref<Record<string, any>>({})
const countdown = ref('')
const chartType = ref<'pie' | 'bar'>('pie')
const totalVotes = ref(0)
const totalUsers = ref(0)
const activeOptions = ref(0)
const elapsedSeconds = ref(0)

// ── computed ──
// const isConnected = computed(() => store.isConnected)
// const options = computed(() => store.voteOptions)

const chartColors = computed(() => {
  const pool = COLORS
  return options.value.map((_: any, i: number) => pool[i % pool.length])
})
const elapsedDisplay = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

// ── lifecycle ──
onBeforeMount(() => {})

onBeforeUnmount(() => {
  stop()
  if (chartRef) {
    chartRef.dispose()
    chartRef = null
  }
})

// ── methods ──
function initChart() {
  const dom = document.getElementById('chart')
  if (dom && !chartRef) chartRef = echarts.init(dom)
  makeChart()
}

function start() {
  isWatching.value = true
  keywords = options.value.map((o: any) => o.value).filter(Boolean)
  optionRegexps = keywords.map((k: string) => new RegExp(k, 'i'))
  chartData = keywords.map((keyword: string, i: number) => ({
    name: keyword,
    value: 0,
    itemStyle: { color: chartColors.value[i] || randomPickColor() },
  }))

  totalVotes.value = 0
  totalUsers.value = 0
  activeOptions.value = keywords.length
  elapsedSeconds.value = 0
  userMap.value = {}

  initChart()
  sse.on('MESSAGE', onMessage)

  elapsedTimer = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)

  if (duration.value > 0) {
    countdownEnd = Date.now() + duration.value * 1000
    tickCountdown()
    countdownTimer = setInterval(tickCountdown, 1000)
  }
}

function stop() {
  isWatching.value = false
  sse.off('MESSAGE', onMessage)
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
    countdown.value = ''
  }
  if (elapsedTimer) {
    clearInterval(elapsedTimer)
    elapsedTimer = null
  }
}

function tickCountdown() {
  const remaining = Math.max(0, Math.ceil((countdownEnd - Date.now()) / 1000))
  if (remaining <= 0) {
    countdown.value = ''
    stop()
    return
  }
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  countdown.value = `${m}:${String(s).padStart(2, '0')}`
}

function toggleChartType(type: 'pie' | 'bar') {
  if (chartType.value === type) return
  chartType.value = type
  makeChart()
}

function makeChart() {
  if (!chartRef) return
  chartRef.clear()
  chartRef.setOption(chartType.value === 'pie' ? pieOption() : barOption(), true)
}

function pieOption() {
  return {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: '24', fontWeight: 'bold', formatter: '{b}: {d}%' } },
        labelLine: { show: false },
        data: chartData,
      },
    ],
  }
}

function barOption() {
  return {
    xAxis: { max: 'dataMax' },
    yAxis: { type: 'category', data: keywords, inverse: true },
    series: [
      {
        realtimeSort: true,
        type: 'bar',
        data: chartData,
        label: { show: true, position: 'right', valueAnimation: true },
      },
    ],
    legend: { show: false },
    animationDuration: 300,
    animationDurationUpdate: 500,
  }
}

function updateChart() {
  if (chartRef) chartRef.setOption({ series: [{ data: chartData }] })
  totalVotes.value = chartData.reduce((sum, d) => sum + d.value, 0)
  totalUsers.value = Object.keys(userMap.value).length
  activeOptions.value = chartData.filter(d => d.value > 0).length
}

function showVoteRecord() {
  isShowVoteRecord.value = true
}

function sendTestDanmaku() {
  if (!keywords.length) return
  const kw = keywords[Math.floor(Math.random() * keywords.length)]
  const testNames = ['小明', '小红', '小刚', '阿强', '丽丽', '大壮', '花花', '阿杰']
  onMessage({
    id: Math.floor(Math.random() * 100000),
    // userId: String(Math.floor(Math.random() * 100000)),
    userId: '0',
    username: testNames[Math.floor(Math.random() * testNames.length)],
    content: kw,
    sendAt: Date.now(),
    category: 'comment',
    roomId: '*',
  } as Message)
}

function randomPickColor() {
  const c = colorPool.shift()!
  colorPool.push(c)
  return c
}

function onMessage(msg: Message) {
  if (msg.category !== 'comment') return
  if (msg.userId) {
    if (userMap.value[msg.userId]) {
      if (isAllowReVote.value) {
        chartData[userMap.value[msg.userId].index].value--
      } else {
        return
      }
    }
  }

  const idx = isAccurateMatch.value ? keywords.findIndex(k => k === msg.content) : optionRegexps.findIndex(r => r.test(msg.content))
  if (!~idx) return

  userMap.value[msg.userId || String(msg.id)] = {
    index: idx,
    keyword: keywords[idx],
    username: msg.username,
    content: msg.content,
    time: dateFormat(msg.sendAt),
  }
  chartData[idx].value++
  updateChart()
}

// ── 持久化 ──
function saveVoteConfig(key: string, value: any) {
  const path = `voteConfig.${key}`
  config.set(path, value)
  updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: path, value }],
  }).catch((e: any) => console.error(e))
}

function addOption() {
  const opts = [...options.value, { value: '', description: '' }]
  config.voteConfig.options = opts
  saveVoteConfig('options', opts)
}

function removeOption(index: number) {
  if (isWatching.value) return
  const opts = [...options.value]
  opts.splice(index, 1)
  config.voteConfig.options = opts
  saveVoteConfig('options', opts)
}

function changeOptionKeyword(index: number, val: any) {
  const v = typeof val === 'string' ? val : (val?.target?.value ?? '')
  const opts = [...options.value]
  opts[index] = { ...opts[index], value: v }
  config.voteConfig.options = opts
  saveVoteConfig('options', opts)
}

function changeIsAccurateMatch() {
  const val = !config.voteConfig.isAccurateMatch
  config.voteConfig.isAccurateMatch = val
  saveVoteConfig('isAccurateMatch', val)
}

function changeAllowReVote() {
  const val = !config.voteConfig.isAllowReVote
  config.voteConfig.isAllowReVote = val
  saveVoteConfig('isAllowReVote', val)
}

function changeDuration(val: number) {
  config.voteConfig.duration = val
  saveVoteConfig('duration', val)
}
</script>

<style scoped>
/* ── 页面容器 ── */
.vote-page {
  padding: 12px 14px;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── 顶部区域 ── */
.vote-header {
  background: #fff;
  border-radius: 10px;
  padding: 12px 16px 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

/* ── Row 1: 操作栏 ── */
.vote-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

/* ── 方形按钮（参考 Config 页）── */
.btn {
  height: 22px;
  border: 1px solid #2d8cf0;
  border-radius: 4px;
  padding: 0 8px;
  font-size: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
}

.btn-primary {
  background: #2d8cf0;
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background: #2b85e4;
}

.btn-default {
  background: #fff;
  color: #2d8cf0;
}

.btn-default:hover {
  background: rgba(45, 140, 240, 0.06);
}

.btn-danger {
  background: #fff;
  color: #ed4014;
  border-color: #ed4014;
}

.btn-danger:hover {
  background: rgba(237, 64, 20, 0.06);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.countdown-area {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  color: #ed4014;
  font-weight: bold;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  background: rgba(237, 64, 20, 0.06);
  border-radius: 4px;
}
.toolbar-label {
  font-size: 11px;
  color: #808695;
}
.toolbar-unit {
  font-size: 10px;
  color: #bbb;
}

/* ── Row 2: 芯片 + 定时 ── */
.vote-chips {
  display: flex;
  gap: 6px;
  align-items: center;
}
.timer-inline {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.chip {
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  border: 1px solid #ddd;
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
  user-select: none;
  transition: 0.15s;
}
.chip.on {
  background: rgba(45, 140, 240, 0.08);
  border-color: #2d8cf0;
  color: #2d8cf0;
}

/* ── 主体 ── */
.vote-body {
  display: flex;
  gap: 14px;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ── 侧边栏 ── */
.vote-sidebar {
  width: 250px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}
.side-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px 14px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}
.side-card-title {
  font-size: 11px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}
.keyword-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.keyword-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.kw-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
.kw-inputs {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.kw-remove {
  cursor: pointer;
  flex-shrink: 0;
}
.side-info p {
  font-size: 11px;
  color: #999;
  line-height: 1.7;
  margin: 0;
}

/* ── 图表区 ── */
/* ── 分段胶囊切换（参考 Config.vue）── */
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
}
.seg-item.on {
  background: #fff;
  color: #2d8cf0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* ── 图表区 ── */
.vote-charts {
  flex: 1;
  min-height: 0;
}
.chart-card {
  height: 100%;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chart-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}
.chart-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #999;
}
.stat-item b {
  color: #333;
  font-weight: 600;
}
.stat-sep {
  color: #e0e0e0;
}
.chart-body {
  flex: 1;
  min-height: 0;
}

/* ── 弹窗 ── */
.record-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.record-table thead th {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 2px solid #e8eaec;
  color: #808695;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.record-table tbody td {
  padding: 7px 10px;
  border-bottom: 1px solid #f5f5f5;
  color: #515a6e;
}
.record-table tbody tr:hover td {
  background: #f8f9fb;
}
.col-opt {
  width: 80px;
}
.col-msg {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.col-time {
  width: 120px;
  white-space: nowrap;
}
.kw-tag {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.6;
}
</style>
