<template>
  <div :style="{ 'user-select': 'none' }">
    <div class="left-container">
      <div>
        <Button class="vote-button" :disabled="isWatching || !isConnected" @click="start">开始</Button>
        <Button class="vote-button" :disabled="!isWatching" @click="stop">停止</Button>
        <Button class="vote-button" @click="showVoteRecord">投票记录</Button>
      </div>

      <div :style="{ margin: '10px 0 10px 0' }">
        <Checkbox :model-value="isAccurateMatch" :disabled="isWatching" @on-change="changeIsAccurateMatch">精确匹配</Checkbox>
        <Tooltip placement="bottom" transfer>
          <Checkbox :model-value="allowReVote" :disabled="isWatching" @on-change="changeAllowReVote">允许改票</Checkbox>
          <template #content> 同一位用户投票记录以最后一次为准 </template>
        </Tooltip>
      </div>
      <div>
        <div class="keyword-container">关键字</div>
        <div class="content-container">描述</div>
      </div>
      <template v-for="(item, index) in options" :key="index">
        <div>
          <div class="keyword-container">
            <Input :model-value="item.keyword" :disabled="isWatching" @on-change="changeOptionKeyword(index, $event)" />
          </div>
          <div class="content-container">
            <Input :model-value="item.value" :disabled="isWatching" @on-change="changeOptionContent(index, $event)" />
            <span />
          </div>
          <div class="remove-icon-container">
            <Icon type="md-remove" @click="removeOption(index)" />
          </div>
        </div>
      </template>

      <div :style="{ 'margin-top': '5px' }">
        <Button type="primary" long :disabled="isWatching" @click="addOption">
          <Icon :style="{ 'font-weight': 'bold' }" type="md-add" />
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
      <div id="chart" />
    </div>

    <Modal v-model="isShowVoteRecord" title="投票记录" scrollable footer-hide lock-scroll transfer :styles="{ height: '70%', overflow: 'auto' }">
      <template v-for="(value, uid) in userMap" :key="uid">
        <p>{{ value.message }}</p>
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
import { dateFormat } from '../../service/util'

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
      colorPool: [],
    }
  },
  computed: {
    isConnected() {
      return this.$store.state.Config.isConnected
    },
    options() {
      return this.$store.state.Config.voteOptions
    },
    isAccurateMatch() {
      return this.$store.state.Config.isAccurateMatch
    },
    allowReVote() {
      return this.$store.state.Config.allowReVote
    },
    colors() {
      return this.$store.state.Config.colors.length ? this.$store.state.Config.colors : COLORS
    },
  },
  beforeMount() {
    this.colorPool = shuffle(this.colors)
  },
  beforeUnmount() {
    this.stop()
    if (chart) {
      chart.clear()
      chart = null
    }
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
      const color = this.colorPool.shift()
      this.colorPool.push(color)
      return color
    },
    onVoteMessage: async function (msg) {
      const message = JSON.parse(msg.data)
      if (message.cmd !== 'COMMENT') return
      const comment = message.payload

      if (this.userMap[comment.uid]) {
        // 如果允许改票...
        if (this.allowReVote) {
          const index = this.userMap[comment.uid].index
          this.data[index].value--
        } else {
          // 已经记录过的用户不再重复统计
          return
        }
      }

      let index
      if (this.isAccurateMatch) {
        index = this.keywords.findIndex((keyword) => {
          return keyword === comment.content
        })
      } else {
        index = this.optionRegexps.findIndex((regexp) => {
          return regexp.test(comment.content)
        })
      }
      if (!~index) return

      // 记录统计
      this.userMap[comment.uid] = {
        index,
        message: `${this.keywords[index]} | ${comment.uname}:${comment.content} | ${dateFormat(comment.sendAt)} `,
      }
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

    changeIsAccurateMatch(value) {
      const data = {
        isAccurateMatch: value,
      }
      // updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    changeAllowReVote(value) {
      const data = {
        allowReVote: value,
      }
      // updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
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
  margin: 5px 10px 0 0;
}

.option-input {
  vertical-align: top;
  display: inline-block;
}
.left-container {
  margin: 20px 0 0 25px;
  width: 325px;
  display: inline-block;
  vertical-align: top;
}
.keyword-container {
  width: 60px;
  display: inline-block;
  text-align: center;
  margin: 0px 5px 5px 0px;
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
  font-size: 20px;
  margin-left: 10px;
}

.right-container {
  display: inline-block;
  vertical-align: top;
  margin: 20px 0 0 20px;
}
</style>
