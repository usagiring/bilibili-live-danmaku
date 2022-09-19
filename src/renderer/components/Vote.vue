<template>
  <div :style="{ 'user-select': 'none' }">
    <div>
      <Button class="vote-button" :disabled="isWatching || !isConnected" @click="start">开始</Button>
      <Button class="vote-button" :disabled="!isWatching" @click="stop">停止</Button>
      <Button class="vote-button" @click="showVoteRecord">投票记录</Button>
    </div>

    <div class="left-container">
      <div>
        <div class="keyword-container">关键字</div>
        <div class="content-container">描述</div>
      </div>
      <template v-for="(item, index) in options" :key="index">
        <div>
          <div class="keyword-container">
            <Input :model-value="item.keyword" :disabled="isWatching" :style="{ padding: '5px' }" @on-change="changeOptionKeyword(index, $event)" />
          </div>
          <div class="content-container">
            <Input :model-value="item.value" :disabled="isWatching" :style="{ padding: '5px' }" @on-change="changeOptionContent(index, $event)" />
            <span />
          </div>
          <div class="remove-icon-container">
            <Icon type="md-remove" @click="removeOption(index)" />
          </div>
        </div>
      </template>

      <div :style="{ padding: '5px'}">
        <Button type="primary" long :disabled="isWatching" @click="addOption">
          <Icon :style="{'font-weight': 'bold'}" type="md-add" />
        </Button>
      </div>
    </div>
    <div class="right-container">
      <ButtonGroup size="default" :style="{ 'padding-top': '5px' }">
        <Button :disabled="!isWatching" @click="makeBarChart">
          <Icon type="md-podium" />
        </Button>
        <Button :disabled="!isWatching" @click="makePieChart">
          <Icon type="md-pie" />
        </Button>
      </ButtonGroup>
      <!-- <Tooltip placement="top">
        <Icon type="md-help" class="info-icon" :style="{'font-size': '16px', 'vertical-align': 'middle'}" />
        <div slot="content">
          <div class="description-text">
            <p>
              使用方法: 输入 "{关键字} + 备注" 其中 {}
              内会被匹配，其他作为文字展示。多个选项使用换行分隔。
            </p>
            <p>例如:</p>
            <p>{A} 选项A</p>
            <p>{B} 选项B</p>
            <p>{这是一个选项所有文本都会参与匹配}</p>
          </div>
        </div>
      </Tooltip>-->
      <div id="chart" />
    </div>

    <Modal v-model="isShowVoteRecord" title="投票记录" scrollable footer-hide lock-scroll transfer :styles="{ height: '70%', overflow: 'auto' }">
      <template v-for="(value, uid) in userMap" :key="uid">
        <p>{{ value }}</p>
      </template>
    </Modal>
  </div>
</template>

<script>
import { toRaw } from 'vue'
import * as echarts from 'echarts'

// ISSUE: echart 5.0.2 按需引入 electron 打包报错
// https://github.com/apache/echarts/issues/14321

// import * as echarts from "echarts/core";
// import { BarChart, PieChart } from "echarts/charts";
// import {
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
// } from "echarts/components";
// import { CanvasRenderer } from "echarts/renderers";
// echarts.use([
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
//   BarChart,
//   PieChart,
//   CanvasRenderer,
// ]);

import { shuffle, cloneDeep } from 'lodash'
import ws from '../../service/ws'
import { COLORS } from '../../service/const'
let colorPool = shuffle(COLORS)
let chart = null

export default {
  data() {
    return {
      isWatching: false,
      type: 'bar',
      isShowVoteRecord: false,
      userMap: {},
      keywords: [],
      optionRegexps: [],
    }
  },
  computed: {
    isConnected() {
      return this.$store.state.Config.isConnected
    },
    options() {
      return this.$store.state.Config.voteOptions
    },
  },
  beforeUnmount() {
    this.stop()
  },
  methods: {
    initChart() {
      this.userMap = {}
      const chartDOM = document.getElementById('chart')
      if (!chart) {
        chart = echarts.init(chartDOM)
      }
      this.type === 'bar' ? this.makeBarChart() : this.makePieChart()
    },

    start() {
      this.isWatching = true
      this.keywords = this.options.map((option) => option.keyword).filter(Boolean)
      this.optionRegexps = this.keywords.map((keyword) => new RegExp(keyword, 'i'))
      this.data = this.keywords.map((keyword, index) => {
        return {
          name: keyword,
          value: 0,
          itemStyle: {
            color: this.randomPickColor(),
          },
        }
      })

      this.initChart()

      ws.addEventListener('message', this.onVoteMessage)
      // emitter.on("message", this.onVoteMessage);

      // setInterval(() => {
      //   for (let i = 0; i < this.data.length; i++) {
      //     this.data[i].value = this.data[i].value + Math.floor(Math.random() * 10)
      //   }
      //   this.updateChartData()
      // }, 3000)
    },
    stop() {
      this.isWatching = false
      ws.removeEventListener('message', this.onVoteMessage)
    },

    makeChart(options = {}) {
      const chartOptions = {}

      if (this.type === 'pie') {
        Object.assign(chartOptions, {
          series: [
            {
              name: '计数',
              type: 'pie',
              minShowLabelAngle: 1,
              label: {
                show: true,
                position: 'outside',
                formatter: '{b}: {d}%',
              },
              data: this.data,
            },
          ],
          legend: {
            orient: 'vertical',
            left: 'left',
          },
          grid: {
            top: 0,
            left: 0,
            rigth: 0,
          },
        })
      }

      if (this.type === 'bar') {
        Object.assign(chartOptions, {
          tooltip: {
            show: true,
            // formatter: '{b}: {c}'
          },
          series: [
            {
              name: '计数',
              type: 'bar',
              barWidth: 30,
              itemStyle: {
                borderType: 'solid',
                // borderColor: "silver",
                // borderWidth: 1,
                barBorderRadius: [0, 20, 20, 0], //（顺时针左上，右上，右下，左下）
              },
              data: this.data,
            },
          ],
          xAxis: {
            type: 'value',
            splitLine: {
              // show: false,
            },
            axisTick: {
              show: false,
            },
          },
          yAxis: {
            type: 'category',
            data: this.keywords,
            axisTick: {
              show: false,
            },
          },
          grid: {
            top: 20,
            left: 5,
            rigth: 20,
          },
        })
      }

      chart.setOption(chartOptions)
    },

    makePieChart() {
      this.type = 'pie'
      chart.clear()

      const option = {
        tooltip: {
          trigger: 'item',
        },
        // legend: {
        //   top: '5%',
        //   left: 'center'
        // },
        legend: {
          orient: 'vertical',
          left: 'left',
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold',
                formatter: '{b}: {d}%',
              },
            },
            labelLine: {
              show: false,
            },
            data: this.data,
          },
        ],
      }

      chart.setOption(option)
    },

    makeBarChart() {
      this.type = 'bar'
      chart.clear()
      // this.chart.resize({
      //   height: 160 + this.keywords.length * 30,
      // })

      const option = {
        xAxis: {
          max: 'dataMax',
        },
        yAxis: {
          type: 'category',
          data: this.keywords,
          // data: ['A', 'B', 'C', 'D', 'E'],
          inverse: true,
          animationDuration: 300,
          animationDurationUpdate: 300,
          // max: 2 // only the largest 3 bars will be displayed
        },
        series: [
          {
            realtimeSort: true,
            // name: 'X',
            type: 'bar',
            data: this.data,
            label: {
              show: true,
              position: 'right',
              valueAnimation: true,
            },
          },
        ],
        legend: {
          show: false,
        },
        animationDuration: 0,
        animationDurationUpdate: 3000,
        animationEasing: 'linear',
        animationEasingUpdate: 'linear',
      }

      chart.setOption(option)
    },

    updateChartData() {
      chart.setOption({
        series: [
          {
            data: this.data,
          },
        ],
      })
    },

    showVoteRecord() {
      this.isShowVoteRecord = true
    },
    randomPickColor() {
      const color = colorPool.shift()
      colorPool.push(color)
      return color
    },
    onVoteMessage: async function (msg) {
      const message = JSON.parse(msg.data)
      if (message.cmd !== 'COMMENT') return
      const comment = message.payload
      // 已经记录过的用户不再重复统计
      if (this.userMap[comment.uid]) return
      const index = this.optionRegexps.findIndex((regexp) => {
        return regexp.test(comment.content)
      })
      if (!~index) return
      // 记录统计
      this.userMap[
        comment.uid
      ] = `${comment.uname}(${comment.uid}): ${comment.content} -> ${this.keywords[index]}`
      // 输入图表
      this.data[index].value++
      this.updateChartData()
    },

    addOption() {
      const options = [
        ...this.options.map(toRaw),
        {
          keyword: '',
          value: '',
        },
      ]
      this.$store.dispatch('UPDATE_CONFIG', {
        voteOptions: options,
      })
    },

    removeOption(index) {
      if (this.isWatching) return
      const options = [...this.options.map(toRaw)]
      options.splice(index, 1)
      this.$store.dispatch('UPDATE_CONFIG', {
        voteOptions: options,
      })
    },

    changeOptionKeyword(index, e) {
      const options = cloneDeep(this.options)
      options[index].keyword = e.target.value
      this.$store.dispatch('UPDATE_CONFIG', {
        voteOptions: options,
      })
    },

    changeOptionContent(index, e) {
      const options = cloneDeep(this.options)
      options[index].content = e.target.value
      this.$store.dispatch('UPDATE_CONFIG', {
        voteOptions: options,
      })
    },
  },
}
</script>

<style scoped>
.description-text {
  white-space: normal;
}

#chart {
  width: 600px;
  height: 600px;
}

.vote-button {
  margin: 5px 0 0 15px;
}

.option-input {
  vertical-align: top;
  display: inline-block;
}
.left-container {
  margin-top: 15px;
  width: 325px;
  margin-left: 10px;
  display: inline-block;
  vertical-align: top;
}
.keyword-container {
  width: 80px;
  display: inline-block;
  text-align: center;
}
.content-container {
  width: 220px;
  display: inline-block;
  text-align: center;
}
.remove-icon-container {
  color: crimson;
  font-weight: bold;
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
}

.right-container {
  display: inline-block;
  vertical-align: top;
  margin-left: 10px;
}
</style>
