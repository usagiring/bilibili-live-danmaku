<template>
  <div :style="{ height: '100%' }">
    <div class="searcher-wrapper">
      <Input v-model="roomId" placeholder="房间号" clearable style="width: 150px" size="small" />
      <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="选择时间范围" style="width: 300px" size="small" :value="dateRange" @on-change="changeDateRange" @on-clear="clearDateRange"></DatePicker>
      <Button type="primary" shape="circle" icon="ios-search" :disabled="!roomId" @click="statistic"></Button>
    </div>
    <div class="statistic-content">
      <p>获得金瓜子: {{ goldTotal }}</p>
      <p>弹幕数: {{ commentCount }}</p>
      <p>互动人数: {{ interactUserCount }}</p>
      <p>送礼人数: {{ giftUserCount }}</p>
      <p>发送弹幕最多的人: {{ maxCommentUser }}</p>
      <p>赠送礼物最多的人: {{ maxGiftUser }}</p>
      <div id="chart"></div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { queryComments, queryInteracts, queryGifts, countComments } from '../../service/api'
import { countBy } from "lodash";
import * as echarts from "echarts";
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
      commentCount: 0, // 弹幕总数
      goldTotal: 0,
      giftUserCount: 0, // 送礼人数
      interactUserCount: 0, // 互动人数
      maxCommentUser: "",
      maxGiftUser: "",
    };
  },
  created() {
    this.roomId = this.$store.state.Config.realRoomId;
    const start = moment().startOf("day").toDate();
    const end = moment().endOf("day").toDate();
    this.dateRange = [start, end];
  },
  mounted() {
    this.statistic();
  },
  methods: {
    async statistic() {
      const [start, end] = this.dateRange;
      const query = {
        roomId: Number(this.roomId),
      };
      if (start) {
        query.sendAt = query.sendAt || {};
        query.sendAt.$gte = start - 0;
      }
      if (end) {
        query.sendAt = query.sendAt || {};
        query.sendAt.$lte = end - 0;
      }
      const { data: commentCount } = await countComments({ query })
      this.commentCount = commentCount;
      const giftQuery = {
        ...query,
        coinType: 1,
      };

      // --- gift ---
      let { data: gifts } = await queryGifts({
        query: giftQuery,
      })
      // let gifts = await giftDB.find(giftQuery);
      const giftUids = gifts.map((gift) => gift.uid);
      gifts = gifts.map((gift) => {
        gift.totalPrice = gift.count * gift.price;
        return gift;
      });
      const giftUserMap = gifts.reduce((map, gift) => {
        if (map[gift.uid]) {
          map[gift.uid] = map[gift.uid] + gift.totalPrice;
        } else {
          map[gift.uid] = gift.totalPrice;
        }
        return map;
      }, {});
      let goldTotal = 0;
      let maxGold = 0;
      let maxGiftUid;
      for (const key in giftUserMap) {
        if (giftUserMap[key] > maxGold) {
          maxGold = giftUserMap[key];
          maxGiftUid = key;
        }
        goldTotal = goldTotal + giftUserMap[key];
      }
      this.goldTotal = goldTotal.toFixed(1) * 1000;
      const maxGiftUser =
        gifts.find((gift) => Number(gift.uid) === Number(maxGiftUid)) || {};
      this.maxGiftUser = maxGiftUser.uname;
      this.giftUserCount = Object.keys(giftUserMap).length;

      // --- comment ---
      const { data: comments } = await queryComments({
        query,
        projection: { uid: 1, uname: 1, sendAt: 1 },
      })
      // const comments = await commentDB.find(query, {
      //   projection: { uid: 1, name: 1, sendAt: 1 },
      // });
      const commentUids = comments.map((c) => c.uid);
      const commentCountMap = countBy(commentUids);
      let maxCommentCount = 0;
      let maxCommentUid;
      for (const uid in commentCountMap) {
        if (commentCountMap[uid] > maxCommentCount) {
          maxCommentCount = commentCountMap[uid];
          maxCommentUid = uid;
        }
      }
      const maxCommentUser =
        comments.find((c) => c.uid === Number(maxCommentUid)) || {};
      this.maxCommentUser = maxCommentUser.uname;
      this.generateChart(comments);

      // --- interact ---
      const { data: interacts } = await queryInteracts({
        query,
        projection: { uid: 1 },
      })
      // const interacts = await interactDB.find(query, {
      //   projection: { uid: 1 },
      // });
      const interactUids = interacts.map((interact) => interact.uid);

      const countMap = commentUids
        .concat(giftUids)
        .concat(interactUids)
        .reduce((map, i) => {
          map[i] = 1;
          return map;
        }, {});
      this.interactUserCount = Object.keys(countMap).length;
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

    generateChart(comments) {
      this.initChartAndXAxis();

      const [start] = this.dateRange;
      const startDate = new Date(start);

      const data = new Array(this.times.length).fill(0);
      for (const comment of comments) {
        // 计算出与开始时间差，除以间隔时间，即index
        const delta = comment.sendAt - startDate.getTime();
        const index = Math.floor(delta / (60 * 1000));
        data[index]++;
      }

      const option = {
        tooltip: {
          trigger: "axis",
          position: function (pt) {
            return [pt[0], "10%"];
          },
        },
        title: {
          left: "center",
          text: "弹幕密度图",
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.times,
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
            data: data,
          },
        ],
      };

      this.chart.setOption(option);
    },

    // 抽离x轴逻辑
    // 选择时间范围变化触发x轴变化
    initChartAndXAxis() {
      if (!this.chart) {
        const chartDOM = document.getElementById("chart");
        this.chart = echarts.init(chartDOM);
      }

      if (!this.isDateRangeChanged && this.times && this.times.length) return;

      const [start, end] = this.dateRange;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const dateDelta = endDate - startDate;

      const tick = Math.ceil(dateDelta / (60 * 1000));

      const times = [];
      for (let i = 0; i < tick; i++) {
        const date = new Date(startDate.getTime() + i * 60 * 1000);
        const MM = date.getHours().toString().padStart(2, "0");
        const SS = date.getMinutes().toString().padStart(2, "0");
        times.push(`${MM}:${SS}`);
      }
      this.times = times;
      this.isDateRangeChanged = false;
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
.statistic-content {
  padding: 20px 40px;
}
.statistic-content > p {
  padding: 5px;
}
#chart {
  width: 100%;
  height: 300px;
}
</style>
