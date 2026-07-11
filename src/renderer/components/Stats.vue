<template>
  <div class="stats-page">
    <!-- 搜索栏 -->
    <div class="searcher-wrapper">
      <div class="search-row">
        <span class="filter-label">时间范围</span>
        <DatePicker
          type="datetimerange"
          format="yyyy-MM-dd HH:mm"
          placeholder="选择时间范围"
          style="width: 280px"
          size="small"
          :model-value="dateRange"
          @on-change="changeDateRange"
          @on-clear="clearDateRange" />
        <Button
          type="primary"
          shape="circle"
          icon="ios-search"
          style="width: 28px; height: 28px"
          :disabled="!roomId"
          @click="stats" />
        <span class="row-sep"></span>
        <button
          class="btn btn-default"
          :disabled="!roomId"
          @click="generateWordCloud">
          <Icon
            type="md-cloud"
            size="12" />
          弹幕词云
        </button>
        <button
          class="btn btn-default"
          :disabled="!roomId"
          @click="download">
          <Icon
            type="md-download"
            size="12" />
          礼物导出
        </button>
      </div>
    </div>

    <!-- 提示 -->
    <div class="action-bar">
      <Alert
        type="info"
        style="flex: 1; margin: 0">
        <Icon
          type="md-information-circle"
          :style="{ 'font-size': '16px' }" />
        <span> 数据仅供参考，实际数据请以官方数据为准。</span>
      </Alert>
    </div>

    <!-- 统计卡片 + 图表 -->
    <div class="main-container">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ Number(totalPrice) * 10 }}</div>
          <div class="stat-label"><Icon type="md-battery-charging" /> 电池</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalComment }}</div>
          <div class="stat-label"><Icon type="md-chatboxes" /> 弹幕数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ totalSendGiftUser }}</div>
          <div class="stat-label"><Icon type="md-people" /> 送礼人数</div>
        </div>
      </div>

      <div id="chart" />
    </div>

    <Drawer
      title="弹幕词云"
      placement="bottom"
      height="70"
      :closable="true"
      v-model="isShowWordCloud">
      <div
        id="wordcloud-chart"
        style="width: 100%; height: 100%"></div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import { getStats, commentWordExtract, exportFile } from '../service/api'
import { useConfigStore } from '../store'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
// import 'echarts-wordcloud/dist/echarts-wordcloud.min.js'
import { Message as $Message } from 'view-ui-plus'
import { IPC_CHOOSE_DIRECTORY, IPC_GIFT_STATS_EXPORT } from '../../service/const'
import { dateFormat } from '@tokine/shared'

const store = useConfigStore()

const roomId = ref('')
const dateRange = ref<Date[]>([])
const isDateRangeChanged = ref(true)

const totalPrice = ref(0)
const totalComment = ref(0)
const totalSendGiftUser = ref(0)

const isShowWordCloud = ref(false)

let chart: echarts.ECharts | null = null
let wordCloudChart: echarts.ECharts | null = null

onMounted(async () => {
  roomId.value = String(store.activeRoom?.realId || store.activeRoom?.id || '')
  const now = dayjs()
  const today4am = now.startOf('day').add(4, 'hour')
  const start = now.isBefore(today4am) ? today4am.subtract(1, 'day') : today4am
  const end = start.add(1, 'day')
  dateRange.value = [start.toDate(), end.toDate()]
  await stats()
})

async function stats() {
  const [startTime, endTime] = dateRange.value
  const { data } = await getStats({
    roomId: roomId.value,
    startTime: startTime.getTime(),
    endTime: endTime.getTime(),
  })
  // topSendGiftUser.value = data.topSendGiftUser
  // topCommentUser.value = data.topCommentUser

  totalPrice.value = data.totalPrice
  totalSendGiftUser.value = data.totalSendGiftUser
  totalComment.value = data.totalComment

  generateChart(data.chart)
}

function changeDateRange([startTime, endTime]: [Date, Date]) {
  dateRange.value = [new Date(startTime), new Date(endTime)]
  isDateRangeChanged.value = true
}

function clearDateRange() {
  setTimeout(() => {
    dateRange.value = []
  }, 0)
}

function generateChart(chartOption: any) {
  if (!chart) {
    const chartDOM = document.getElementById('chart')
    chart = echarts.init(chartDOM!)
  }

  if (!isDateRangeChanged.value && chartOption.times && chartOption.times.length) return

  isDateRangeChanged.value = false

  const option = {
    tooltip: {
      trigger: 'axis',
      position: function (pt: any[]) {
        return [pt[0], '10%']
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartOption.times,
    },
    yAxis: {
      type: 'value',
      boundaryGap: false,
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 10,
      },
      {
        start: 0,
        end: 10,
      },
    ],
    series: [
      {
        name: '弹幕数量',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        itemStyle: {
          color: 'rgb(255, 70, 131)',
        },
        lineStyle: {
          width: 1,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgb(255, 158, 68)',
            },
            {
              offset: 1,
              color: 'rgb(255, 70, 131)',
            },
          ]),
        },
        data: chartOption.data,
      },
    ],
  }

  chart.setOption(option)
}

async function generateWordCloud() {
  if (!wordCloudChart) {
    const chartDOM = document.getElementById('wordcloud-chart')
    wordCloudChart = echarts.init(chartDOM!)
  }

  isShowWordCloud.value = true

  const [start, end] = dateRange.value
  const { data } = await commentWordExtract({
    roomId: roomId.value,
    startTime: dayjs(start).valueOf(),
    endTime: dayjs(end).valueOf(),
  })

  const chartData: { name: string; value: number }[] = []
  for (const key in data) {
    if (data[key] < 3) continue
    chartData.push({
      name: key,
      value: data[key],
    })
  }

  wordCloudChart.setOption({
    grid: {
      left: '0%',
      right: '0%',
      top: '0%',
      bottom: '0%',
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'heart',
        width: '100%',
        height: '100%',
        sizeRange: [12, 60],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: true,
        layoutAnimation: true,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return (
              'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')'
            )
          },
        },
        data: chartData,
      },
    ],
  })

  await nextTick()
  wordCloudChart.resize()
}

async function download() {
  try {
    const filePath = await window.ipcRenderer.invoke(IPC_CHOOSE_DIRECTORY)
    if (!filePath) return
    const [start, end] = dateRange.value
    const fileName = `${roomId.value}_${Date.now()}.csv`
    await window.ipcRenderer.invoke(IPC_GIFT_STATS_EXPORT, {
      filePath,
      roomId: roomId.value,
      startTime: dayjs(start).valueOf(),
      endTime: dayjs(end).valueOf(),
      fileName,
    })
    $Message.success('导出成功')
  } catch (e) {
    console.error(e)
    $Message.error('导出失败')
  }
}
</script>

<style scoped>
.stats-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── 搜索栏（参考 Message 页）── */
.searcher-wrapper {
  height: 30px;
  overflow: visible;
  position: relative;
  z-index: 3;
  padding: 0 14px;
  background: #fff;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
}

.filter-label {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  min-width: 52px;
}

.row-sep {
  width: 1px;
  height: 14px;
  background: #ddd;
  flex-shrink: 0;
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

.btn-default {
  background: #fff;
  color: #2d8cf0;
}

.btn-default:hover {
  background: rgba(45, 140, 240, 0.06);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── 提示 ── */
.action-bar {
  padding: 10px 14px 6px;
}

/* ── 主体 ── */
.main-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.stat-card {
  padding: 12px 10px;
  background: #fff;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

#chart {
  width: 100%;
  height: 300px;
}

#wordcloud-chart {
  width: 100%;
  height: 100%;
}
</style>
