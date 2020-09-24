<template>
  <div>
    <Row>
      <i-col span="6">
        <Input v-model="keystring" type="textarea" :rows="7" placeholder="输入备选项，使用换行分隔" />
      </i-col>
      <i-col span="3">
        <Button @click="start">开始统计</Button>
      </i-col>
      <i-col span="15">
        <ButtonGroup size="default">
          <Button>
            <Icon type="md-podium" />
          </Button>
          <Button>
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

export default {
  data() {
    return {
      keystring: "",
      chart: null
    };
  },
  methods: {
    start() {
      const keywords = this.keystring.split(/\n/g);
      if (!this.chart) {
        this.chart = echarts.init(document.getElementById("chart"));
      }
      // initial
      makeChart(keywords, []);

      data = keywords.map((_) => 0);
      userMap = {};
      // this.$Message.info("开始统计弹幕");
      this.isWatching = true;
    },

    // if (userMap[uid]) return;
    // const regexps = keywords.map(
    //   keyword => new RegExp(keyword, "i")
    // );
    // const index = regexps.findIndex(regexp => {
    //   return !!~msg.search(regexp);
    // });
    // if (!~index) return;

    // userMap[uid] = name;
    // data[index]++;

    makeChart(keywords, data) {
      chart.setOption({
        tooltip: {},
        xAxis: {},
        yAxis: {
          data: keywords,
        },
        series: [
          {
            name: "计数",
            type: "bar",
            data: data,
          },
        ],
      });
    },
  },
};
</script>

<style scoped>
</style>
