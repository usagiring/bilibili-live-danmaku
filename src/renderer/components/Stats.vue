<template>
  <div :style="{ height: '100%' }">
    <div class="searcher-wrapper">
      <Input
        v-model="roomId"
        placeholder="房间号"
        clearable
        style="width: 120px"
        size="small" />
      <DatePicker
        class="space-left-5px"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        placeholder="选择时间范围"
        style="width: 280px"
        size="small"
        :model-value="dateRange"
        @on-change="changeDateRange"
        @on-clear="clearDateRange" />
      <Button
        class="space-left-5px"
        type="primary"
        shape="circle"
        icon="ios-search"
        :disabled="!roomId"
        @click="stats" />
    </div>
    <div :style="{ padding: '10px 20px 0 20px' }">
      <Alert type="info">
        <Icon
          type="md-information-circle"
          :style="{ 'font-size': '16px' }" />
        <span> 数据仅供参考，实际数据请以官方数据为准。请注意舰长未区分续费与原价，统一以原价计算。未设置Cookie时，部分数据不支持。 </span>
      </Alert>
    </div>

    <div :style="{ padding: '0px 25px 0 25px' }">
      <Button
        type="primary"
        class="workclound-button"
        shape="circle"
        icon="md-cloud"
        @click="generateWordCloud"
        >生成词云</Button
      >
      <Button
        class="space-left-5px"
        shape="circle"
        icon="md-download"
        :disabled="!roomId"
        @click="download"
        >礼物导出</Button
      >
    </div>

    <div class="main-container">
      <div
        class="text-container"
        :style="{ width: '300px' }">
        <p>获得金瓜子: {{ totalGold }}</p>
        <p>弹幕数: {{ totalComment }}</p>
        <p>送礼人数: {{ totalSendGiftUser }}</p>
      </div>

      <div id="chart" />
    </div>

    <Drawer
      title="弹幕词云"
      placement="bottom"
      height="70"
      :closable="true"
      v-model="isShowWordCloud">
      <div id="wordcloud-chart"></div>
    </Drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const totalGold = ref(0)
const totalComment = ref(0)
const totalSendGiftUser = ref(0)

const isShowWordCloud = ref(false)

let chart: echarts.ECharts | null = null
let wordCloudChart: echarts.ECharts | null = null

onMounted(async () => {
  roomId.value = String(store.activeRoom?.realId || store.activeRoom?.id || '')
  const start = dayjs().startOf('day').toDate()
  const end = dayjs().endOf('day').toDate()
  dateRange.value = [start, end]
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

  totalGold.value = data.totalGold
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
}

async function download() {
  try {
    const filePath = await window.ipcRenderer.invoke(IPC_CHOOSE_DIRECTORY)
    if (!filePath) return
    const [start, end] = dateRange.value
    const fileName = `${roomId.value}_${dateFormat(new Date(), 'YYYYMMDD_HHmmss')}.csv`
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
.searcher-wrapper {
  height: 35px;
  position: relative;
  padding: 0px 30px;
  border-bottom: 1px solid lightgray;
}
.main-container {
  position: relative;
  padding: 10px 20px 0 20px;
}
.text-container {
  display: inline-block;
  vertical-align: top;
}
.text-container > p {
  padding: 10px;
}
#chart {
  width: 100%;
  height: 300px;
}

#wordcloud-chart {
  position: relative;
  vertical-align: middle;
  right: 0px;
  top: 0px;
  display: inline-block;
  height: 500px;
  width: 800px;
}

/* .workclound-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
} */
.space-left-5px {
  margin-left: 5px;
}
</style>
