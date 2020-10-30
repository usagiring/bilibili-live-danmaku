<template>
  <div>
    <Row>
      <i-col span="7">
        <Input
          class="option-input"
          v-model="optionstring"
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
        <Button class="vote-button" @click="start" :disabled="isWatching"
          >开始</Button
        >
        <Button class="vote-button" @click="stop" :disabled="!isWatching"
          >停止</Button
        >
        <Button class="vote-button" @click="showVoteRecord">记录</Button>
      </i-col>
      <i-col span="15">
        <ButtonGroup size="default" :style="{ 'padding-top': '5px' }">
          <Button @click="barChart">
            <Icon type="md-podium" />
          </Button>
          <Button @click="pieChart">
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
        <p :key="uid" class="">
          {{ value }}
        </p>
      </template>
    </Modal>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { shuffle } from "lodash";
import emitter, {
  init,
  close,
  parseComment,
  parseInteractWord,
  parseGift,
} from "../../service/bilibili-live-ws";
import { EXAMPLE_MESSAGES, DEFAULT_AVATAR, COLORS } from "../../service/const";
let colorPool = shuffle(COLORS);

// TEST
const __EXAMPLE_MESSAGES = [...EXAMPLE_MESSAGES].concat([
  {
    id: 203,
    type: "comment",
    uid: "12345",
    name: "bli_22222222222",
    comment: "AAAAA",
    avatar: DEFAULT_AVATAR,
    role: 3,
    similar: 0,
  },
  {
    id: 204,
    type: "comment",
    uid: "12345",
    name: "bli_22222222222",
    comment: "BBB",
    avatar: DEFAULT_AVATAR,
    role: 3,
    similar: 0,
  },
  {
    id: 205,
    type: "comment",
    uid: "333333",
    name: "bli_333333",
    comment: "cc",
    avatar: DEFAULT_AVATAR,
    role: 3,
    similar: 0,
  },
]);

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
      userMap: {
        1231321: "222313-> fwfdfsdf",
        1231322: "222313-> fwfdfsdf",
        1231323: "222313-> fwfdfsdf",
        1231324: "222313-> fwfdfsdf",
        1231325: "222313-> fwfdfsdf",
        1231326: "222313-> fwfdfsdf",
        1231327: "222313-> fwfdfsdf",
        1231328: "222313-> fwfdfsdf",
        1231329: "222313-> fwfdfsdf",
        12313: "222313-> fwfdfsdf",
        12314: "222313-> fwfdfsdf",
        1231334: "222313-> fwfdfsdf",
        1231344: "222313-> fwfdfsdf",
        1231354: "222313-> fwfdfsdf",
        1231364: "222313-> fwfdfsdf",
        1231374: "222313-> fwfdfsdf",
        1231384: "222313-> fwfdfsdf",
        1231394: "222313-> fwfdfsdf",
        1231304: "222313-> fwfdfsdf",
        123234: "222313-> fwfdfsdf",
        1233304: "222313-> fwfdfsdf",
        1234304: "222313-> fwfdfsdf",
        1235304: "222313-> fwfdfsdf",
        1236304: "222313-> fwfdfsdf",
        1237304: "222313-> fwfdfsdf",
        1238304: "222313-> fwfdfsdf",
        1239304: "222313-> fwfdfsdf",
        1230304: "222313-> fwfdfsdf",
        1241304: "222313-> fwfdfsdf",
        1251304: "222313-> fwfdfsdf",
        1261304: "222313-> fwfdfsdf",
        1271304: "222313-> fwfdfsdf",
        1281304: "222313-> fwfdfsdf",
      },
    };
  },
  computed: {
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
          label: {
            formatter: description,
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

      // TEST
      // emitter.emit("message", __EXAMPLE_MESSAGES);
    },
    stop() {
      const listenerCount = emitter.listenerCount("message");
      // 如果只有1个监听者，即主监听器，不处理
      if (listenerCount <= 1) return;
      emitter.removeListener("message", this.onVoteMessage);
      this.isWatching = false;
    },

    makeChart({ type = "bar" }) {
      const series = [
        {
          name: "计数",
          type,
          barWidth: 30,
          label: {
            show: true,
            align: "right",
            // verticalAlign: 'top'
          },
          itemStyle: {
            borderType: "solid",
            // borderColor: "silver",
            // borderWidth: 1,
            barBorderRadius: [0, 20, 20, 0], //（顺时针左上，右上，右下，左下）
          },
          data: this.data,
        },
      ];
      
      const options = {
        series: series,
      };

      if (type === "pie") {
        Object.assign(options, {
          legend: {
            orient: "vertical",
            left: "left",
          },
        });
      }

      if (type === "bar") {
        Object.assign(options, {
          xAxis: {
            type: "value",
            splitLine: {
              show: false,
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
        });
      }

      this.chart.setOption(options);
    },

    barChart() {
      this.chart.clear();
      this.chart.resize({
        height: 160 + this.keywords.length * 30,
      });
      this.makeChart({ type: "bar" });
    },
    pieChart() {
      this.chart.clear();
      this.makeChart({ type: "pie" });
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

      // TEST
      // const comments = data.filter((msg) => msg.type === "comment");

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
