<template>
  <div>
    <Row>
      <i-col span="6">
        <p>
          使用方法: 输入 "{关键字} + 备注" 其中 {}
          内会被匹配，其他作为文字展示。多个选项使用换行分隔
        </p>
        <p>例如:</p>
        <p>{A}: 选项A</p>
        <p>{B}: 选项B</p>
        <p>{这是一个选项所有文本都会参与匹配}</p>
        <Input
          v-model="keystring"
          type="textarea"
          :rows="7"
          placeholder="输入备选项，使用换行分隔"
          :disabled="isWatching"
        />
      </i-col>
      <i-col span="3">
        <Button @click="start" :disabled="isWatching">开始</Button>
        <Button @click="stop" :disabled="!isWatching">停止</Button>
      </i-col>
      <i-col span="15">
        <ButtonGroup size="default">
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
  </div>
</template>

<script>
import * as echarts from "echarts";
import emitter, {
  init,
  close,
  parseComment,
  parseInteractWord,
  parseGift,
} from "../../service/bilibili-live-ws";
let userMap = {};

// example: {} 内会被匹配，其他作为文字展示
// {A}: 选项A
// {B}: 选项B
// {这是一个选项所有文本都会参与匹配}

export default {
  data() {
    return {
      optionstring: "",
      chart: null,
      isWatching: false,
    };
  },
  methods: {
    init() {
      userMap = {};
      if (!this.chart) {
        this.chart = echarts.init(document.getElementById("chart"));
      }
      this.makeChart({ options, data: [], type: "bar" });
      data = options.map((_) => 0);
    },
    start() {
      this.init();

      this.isWatching = true;
      const options = this.optionstring.split(/\n/g);

      const keywords = options
        .map((option) => {
          const left = ~option.indexOf("{");
          const right = ~option.lastIndexOf("}");
          if (left && right && right > left) {
            const keyword = option.substring(left, right);
            return keyword;
          }
        })
        .filter(Boolean);
      const regexps = keywords.map((keyword) => new RegExp(keyword, "i"));

      emitter.on("message", async (data) => {
        const comments = data
          .filter((msg) => msg.cmd === "DANMU_MSG")
          .map(parseComment);

        for (const comment of comments) {
          console.log(`${comment.name}(${comment.uid}): ${comment.comment}`);
          // 已经记录过的用户不再重复统计
          if (userMap[comment.uid]) return;
          const index = ~regexps.findIndex((regexp) => {
            return regexp.test(comment.comment);
          });
          if (!index) return;
          // 记录统计
          userMap[
            uid
          ] = `${comment.name}(${comment.uid}): ${comment.comment} -> ${keywords[index]}`;
          // TODO 输入图表
          data[index]++;
          this.makeChart(keywords, data);
        }
      });
    },
    stop() {
      const listenerCount = emitter.listenerCount("message");
      // 如果只有1个监听者，即主监听器，不处理
      if (listenerCount <= 1) return;
      emitter.off("message", () =>
        console.log("eventName: message, remove one listener")
      );
      this.isWatching = false;
    },

    makeChart({ type = "bar", keywords, data }) {
      this.chart.setOption({
        tooltip: {},
        xAxis: {},
        yAxis: {
          data: keywords,
        },
        series: [
          {
            name: "计数",
            type,
            data,
          },
        ],
      });
    },

    barChart() {
      this.makeChart({ type: "bar" });
    },
    pieChart() {
      this.makeChart({ type: "pie" });
    },
  },
};
</script>

<style scoped>
</style>
