<template>
  <div :style="{ height: '100%' }">
    <div class="searcher-wrapper">
      <Input v-model="roomId" placeholder="房间号" clearable style="width: 150px" size="small" />
      <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="选择时间范围" style="width: 300px" size="small" :value="dateRange" @on-change="changeDateRange" @on-clear="clearDateRange" />
      <Button type="primary" shape="circle" icon="ios-search" :disabled="!roomId" @click="statistic" />
      <Button shape="circle" icon="md-download" :disabled="!roomId" @click="download" />
    </div>
    <div class="main-container">
      <div class="text-container">
        <p :style="{'max-width': '300px'}">数据仅供参考，实际数据请以官方数据为准。请注意舰长未区分续费与原价，统一以原价计算。</p>
        <p>获得金瓜子: {{ totalGold }}</p>
        <p>弹幕数: {{ totalComment }}</p>
        <p>送礼人数: {{ totalSendGiftUser }}</p>
        <p>赠送礼物最多的人: {{ topSendGiftUser.uname }}</p>
        <p>发送弹幕最多的人: {{ topCommentUser.uname }}</p>
      </div>
      <div id="wordcloud-chart">
        <Button type="primary" class="workclound-button" @click="generateWordCloud">生成词云</Button>
      </div>

      <div id="chart" />
    </div>
  </div>
</template>

<script type="module">
import moment from "moment";
import fs from 'fs'
import path from 'path'
import { strict as assert } from 'assert'
import * as remote from "@electron/remote";
const { dialog } = remote
import {
  statistic as statisticAPI,
  commentWordExtract,
  exportFile,
} from '../../service/api'
import { dateFormat } from '../../service/util'
import * as echarts from "echarts";
import 'echarts-wordcloud/dist/echarts-wordcloud.min.js';
// import 'echarts-wordcloud';

// import * as echarts from "echarts/core";
// import { LineChart } from "echarts/charts";
// import {
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
//   ToolboxComponent,
//   DataZoomComponent,
// } from "echarts/components";
// import { CanvasRenderer } from "echarts/renderers";
// echarts.use([
//   TitleComponent,
//   TooltipComponent,
//   GridComponent,
//   ToolboxComponent,
//   DataZoomComponent,
//   LineChart,
//   CanvasRenderer,
// ]);

export default {
  data() {
    return {
      roomId: 0,
      dateRange: [],
      isDateRangeChanged: true,

      totalGold: 0,
      totalComment: 0, // 弹幕总数
      totalSendGiftUser: 0, // 送礼人数

      topSendGiftUser: {}, // 发送礼物最多的人
      topCommentUser: {}, // 发送弹幕最多的人

      chart: null,
    };
  },
  created() {
    this.roomId = this.$store.state.Config.realRoomId;
    const start = moment().startOf("day").toDate();
    const end = moment().endOf("day").toDate();
    this.dateRange = [start, end];
  },
  mounted() {
    this.statistic()
  },
  methods: {
    async statistic() {
      const [start, end] = this.dateRange;
      const { data } = await statisticAPI({
        roomId: this.roomId,
        start: start,
        end: end
      });
      this.topSendGiftUser = data.topSendGiftUser
      this.topCommentUser = data.topCommentUser

      this.totalGold = data.totalGold
      this.totalSendGiftUser = data.totalSendGiftUser
      this.totalComment = data.totalComment

      this.generateChart(data.chart)
      // this.wordCloudChart.dispose()
    },

    changeDateRange([startTime, endTime]) {
      this.dateRange = [new Date(startTime), new Date(endTime)];
      this.isDateRangeChanged = true;
    },
    clearDateRange() {
      setTimeout(() => {
        this.dateRange = [];
      }, 0);
    },

    generateChart(chartOption) {
      if (!this.chart) {
        const chartDOM = document.getElementById("chart");
        this.chart = echarts.init(chartDOM);
      }

      if (!this.isDateRangeChanged && chartOption.times && chartOption.times.length) return;

      this.isDateRangeChanged = false;

      const option = {
        tooltip: {
          trigger: "axis",
          position: function (pt) {
            return [pt[0], "10%"];
          },
        },
        grid: {
          left: "5%",
          right: "5%",
          top: "10%",
        },
        // title: {
        //   left: "center",
        //   text: "弹幕密度图",
        // },
        // toolbox: {
        //   feature: {
        //     restore: {},
        //     saveAsImage: {},
        //   },
        // },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartOption.times,
        },
        yAxis: {
          type: "value",
          boundaryGap: false,
        },
        dataZoom: [
          {
            type: "inside",
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
            name: "弹幕数量",
            type: "line",
            symbol: "none",
            sampling: "lttb",
            itemStyle: {
              color: "rgb(255, 70, 131)",
            },
            lineStyle: {
              width: 1,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgb(255, 158, 68)",
                },
                {
                  offset: 1,
                  color: "rgb(255, 70, 131)",
                },
              ]),
            },
            data: chartOption.data,
          },
        ],
      };

      this.chart.setOption(option);
    },

    async generateWordCloud() {
      if (!this.wordCloudChart) {
        const chartDOM = document.getElementById("wordcloud-chart");
        this.wordCloudChart = echarts.init(chartDOM);
      }

      const [start, end] = this.dateRange;
      const { data } = await commentWordExtract({
        roomId: this.roomId,
        start,
        end,
      })

      const chartData = []
      for (const key in data) {
        chartData.push({
          name: key,
          value: data[key]
        })
      }

      this.wordCloudChart.setOption({
        grid: {
          left: "0%",
          right: "0%",
          top: "0%",
          bottom: "0%",
        },
        series: [{
          type: 'wordCloud',

          // The shape of the "cloud" to draw. Can be any polar equation represented as a
          // callback function, or a keyword present. Available presents are circle (default),
          // cardioid (apple or heart shape curve, the most known polar equation), diamond (
          // alias of square), triangle-forward, triangle, (alias of triangle-upright, pentagon, and star.

          shape: 'heart',

          // A silhouette image which the white area will be excluded from drawing texts.
          // The shape option will continue to apply as the shape of the cloud to grow.

          // maskImage: maskImage,

          // Folllowing left/top/width/height/right/bottom are used for positioning the word cloud
          // Default to be put in the center and has 75% x 80% size.

          // left: 'center',
          // top: 'center',
          width: '100%',
          height: '100%',
          // right: null,
          // bottom: null,

          // Text size range which the value in data will be mapped to.
          // Default to have minimum 12px and maximum 60px size.

          sizeRange: [12, 60],

          // Text rotation range and step in degree. Text will be rotated randomly in range [-90, 90] by rotationStep 45

          rotationRange: [-90, 90],
          rotationStep: 45,

          // size of the grid in pixels for marking the availability of the canvas
          // the larger the grid size, the bigger the gap between words.

          gridSize: 8,

          // set to true to allow word being draw partly outside of the canvas.
          // Allow word bigger than the size of the canvas to be drawn
          drawOutOfBound: true,

          // If perform layout animation.
          // NOTE disable it will lead to UI blocking when there is lots of words.
          layoutAnimation: true,

          // Global text style
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            // Color can be a callback function or a color string
            color: function () {
              // Random color
              return 'rgb(' + [
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160),
                Math.round(Math.random() * 160)
              ].join(',') + ')';
            }
          },
          // emphasis: {
          //   focus: 'self',

          //   textStyle: {
          //     textShadowBlur: 10,
          //     textShadowColor: '#333'
          //   }
          // },

          // Data is an array. Each array item must have name and value property.
          // data: [{
          //   name: 'Farrah Abraham',
          //   value: 366,
          //   // Style of single text
          //   textStyle: {
          //   }
          // }]
          data: chartData
        }]
      });
    },

    async download() {
      try {
        const filePath = await this.choosePath()
        console.log(filePath)
        if (!filePath) return
        const [start, end] = this.dateRange
        const data = await exportFile({
          roomId: this.roomId,
          start,
          end,
        })
        try {
          const stat = fs.statSync(filePath)
          assert.ok(stat.isDirectory())
        } catch (e) {
          console.log(e)
          fs.mkdirSync(filePath)
        }
        const output = path.join(filePath, `./${this.roomId}_${dateFormat(new Date(), 'YYYYMMDD_HHmmss')}_.csv`)
        const ws = fs.createWriteStream(output)
        // data.pipe(ws)
        ws.write(data)
        ws.end()
        this.$Message.success('导出成功')
      } catch (e) {
        this.$Message.error('导出失败')
      }
    },

    async choosePath() {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (!result.canceled) {
        const path = result.filePaths[0]
        return path
      }
    },
  },
};
</script>

<style scoped>
.searcher-wrapper {
  height: 35px;
  position: relative;
  padding: 1px 30px;
  border-bottom: 1px solid silver;
}
.main-container {
  position: relative;
  padding: 10px 40px 0 40px;
}
.text-container {
  display: inline-block;
  vertical-align: middle;
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
  height: 330px;
  width: 700px;
}

.workclound-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
