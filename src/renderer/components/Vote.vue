<template>
  <div>
    <Row>
      <i-col span="7">
        <Input
          class="option-input"
          :value="optionstring"
          @on-change="changeInput"
          type="textarea"
          :rows="7"
          placeholder="输入备选项，使用换行分隔"
          :disabled="isWatching"
          :style="{ width: '90%', padding: '5px' }"
        />
        <Tooltip placement="top">
          <Icon type="md-alert" class="info-icon" />
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
        </Tooltip>
      </i-col>
      <i-col span="2">
        <Button
          class="vote-button"
          @click="start"
          :disabled="isWatching || !isConnected"
          >开始</Button
        >
        <Button class="vote-button" @click="stop" :disabled="!isWatching"
          >停止</Button
        >
        <Button class="vote-button" @click="showVoteRecord">记录</Button>
      </i-col>
      <i-col span="15">
        <ButtonGroup size="default" :style="{ 'padding-top': '5px' }">
          <Button @click="barChart" :disabled="!isWatching">
            <Icon type="md-podium" />
          </Button>
          <Button @click="pieChart" :disabled="!isWatching">
            <Icon type="md-pie" />
          </Button>
        </ButtonGroup>
        <div id="chart"></div>
      </i-col>
    </Row>
    <Modal
      v-model="modal1"
      scrollable
      footer-hide
      lock-scroll
      transfer
      :styles="{ height: '70%', overflow: 'auto' }"
    >
      <template v-for="(value, uid) in userMap">
        <p :key="uid">
          {{ value }}
        </p>
      </template>
    </Modal>
  </div>
</template>

<script>
// import * as echarts from "echarts";
import * as echarts from "echarts/core";
import { BarChart, PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  PieChart,
  CanvasRenderer,
]);

import { shuffle } from "lodash";
import { parseComment } from "../../service/bilibili-live-ws";
import emitter from "../../service/event";
import { COLORS } from "../../service/const";
let colorPool = shuffle(COLORS);

// example: {} 内会被匹配，其他作为文字展示
// {A}: 选项A
// {B}: 选项B
// {这是一个选项所有文本都会参与匹配}

export default {
  data() {
    return {
      chart: null,
      isWatching: false,
      type: "bar",
      modal1: false,
      userMap: {},
    };
  },
  computed: {
    isConnected() {
      return this.$store.state.Config.isConnected;
    },
    optionstring() {
      return this.$store.state.Config.optionstring;
    },
    options() {
      const optionArray = this.optionstring.split(/\n/g);
      return optionArray.reduce((map, optionString) => {
        const left = optionString.indexOf("{");
        const right = optionString.lastIndexOf("}");
        // 如果没找到直接返回map
        if (!~left || !~right) return map;
        if (right < left) return map;
        const keyword = optionString.substring(left + 1, right);
        map[keyword] = optionString.substring(right + 1);
        return map;
      }, {});
    },

    keywords() {
      return Object.keys(this.options);
    },
    descriptions() {
      return Object.values(this.options);
    },
    regexps() {
      return this.keywords.map((keyword) => new RegExp(keyword, "i"));
    },
  },
  beforeDestroy() {
    this.stop();
  },
  methods: {
    init() {
      this.userMap = {};
      const chartDOM = document.getElementById("chart");
      if (!this.chart) {
        this.chart = echarts.init(chartDOM);
      }
      const data = this.descriptions.map((description, index) => {
        return {
          name: this.keywords[index],
          value: 0,
          itemStyle: {
            color: this.randomPickColor(),
          },
        };
      });
      this.data = data;
      this.type === "bar" ? this.barChart() : this.pieChart();
    },

    start() {
      this.init();

      this.isWatching = true;

      emitter.on("message", this.onVoteMessage);
    },
    stop() {
      const listenerCount = emitter.listenerCount("message");
      // 如果只有1个监听者，即主监听器，不处理
      if (listenerCount <= 1) return;
      emitter.removeListener("message", this.onVoteMessage);
      this.isWatching = false;
    },

    makeChart(options = {}) {
      const chartOptions = {};

      if (this.type === "pie") {
        Object.assign(chartOptions, {
          series: [
            {
              name: "计数",
              type: "pie",
              minShowLabelAngle: 1,
              label: {
                show: true,
                position: "outside",
                formatter: "{b}: {d}%",
              },
              data: this.data,
            },
          ],
          legend: {
            orient: "vertical",
            left: "left",
          },
          grid: {
            top: 0,
            left: 0,
            rigth: 0,
          },
        });
      }

      if (this.type === "bar") {
        Object.assign(chartOptions, {
          tooltip: {
            show: true,
            // formatter: '{b}: {c}'
          },
          series: [
            {
              name: "计数",
              type: "bar",
              barWidth: 30,
              itemStyle: {
                borderType: "solid",
                // borderColor: "silver",
                // borderWidth: 1,
                barBorderRadius: [0, 20, 20, 0], //（顺时针左上，右上，右下，左下）
              },
              data: this.data,
            },
          ],
          xAxis: {
            type: "value",
            splitLine: {
              // show: false,
            },
            axisTick: {
              show: false,
            },
          },
          yAxis: {
            type: "category",
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
        });
      }

      this.chart.setOption(chartOptions);
    },

    barChart() {
      this.type = "bar";
      this.chart.clear();
      this.chart.resize({
        height: 160 + this.keywords.length * 30,
      });
      this.makeChart();
    },
    pieChart() {
      this.type = "pie";
      this.chart.clear();
      this.makeChart();
    },

    showVoteRecord() {
      this.modal1 = true;
    },
    randomPickColor() {
      const color = colorPool.shift();
      colorPool.push(color);
      return color;
    },
    onVoteMessage: async function (data) {
      if (!Array.isArray(data)) return;
      const comments = data
        .filter((msg) => msg.cmd === "DANMU_MSG")
        .map(parseComment);

      for (const comment of comments) {
        // 已经记录过的用户不再重复统计
        if (this.userMap[comment.uid]) continue;
        const index = this.regexps.findIndex((regexp) => {
          return regexp.test(comment.comment);
        });
        if (!~index) continue;
        // 记录统计
        this.userMap[
          comment.uid
        ] = `${comment.name}(${comment.uid}): ${comment.comment} -> ${this.keywords[index]}`;
        console.log(
          `${comment.name}(${comment.uid}): ${comment.comment} -> ${this.keywords[index]}`
        );
        // 输入图表
        this.data[index].value++;
        this.makeChart();
      }
    },

    changeInput(e) {
      this.$store.dispatch("UPDATE_CONFIG", {
        optionstring: e.target.value,
      });
    },
  },
};
</script>

<style scoped>
.description-text {
  white-space: normal;
  width: 200px;
  font-size: 12px;
}

#chart {
  width: 600px;
  /* height: 250px; */
}

.vote-button {
  margin-top: 5px;
}

.option-input {
  vertical-align: top;
  display: inline-block;
}

.info-icon {
  display: inline-block;
  padding-top: 8px;
}
</style>
