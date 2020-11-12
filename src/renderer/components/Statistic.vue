<template>
  <div :style="{ height: '100%' }">
    <div class="searcher-wrapper">
      <Input
        v-model="roomId"
        placeholder="房间号"
        clearable
        style="width: 150px"
        size="small"
      />
      <DatePicker
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        placeholder="选择时间范围"
        style="width: 300px"
        size="small"
        :value="dateRange"
        @on-change="changeDateRange"
        @on-clear="clearDateRange"
      ></DatePicker>
      <Button
        type="primary"
        shape="circle"
        icon="ios-search"
        @click="statistic"
      ></Button>
    </div>
    <div>
      <p>获得金瓜子: {{ goldTotal }}</p>
      <p>弹幕数: {{ commentCount }}</p>
      <p>互动人数: {{ interactUserCount }}</p>
      <p>送礼人数: {{ giftUserCount }}</p>
      <p>发送弹幕最多的人: {{ maxCommentUser }}</p>
      <p>赠送礼物最多的人: {{ maxGiftUser }}</p>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { commentDB, interactDB, giftDB, userDB } from "../../service/nedb";
import { uniq, countBy } from "lodash";

export default {
  data() {
    return {
      dateRange: [],
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
    console.log(start, end);
    this.dateRange = [start, end];
    this.statistic();
  },
  methods: {
    async statistic() {
      const [start, end] = this.dateRange;
      const query = {
        roomId: this.roomId,
      };
      if (start) {
        query.sendAt = query.sendAt || {};
        query.sendAt.$gte = start - 0;
      }
      if (end) {
        query.sendAt = query.sendAt || {};
        query.sendAt.$lte = end - 0;
      }
      const commentCount = await commentDB.count(query);
      this.commentCount = commentCount;
      const giftQuery = {
        ...query,
        coinType: "gold",
      };
      console.log(query, giftQuery);

      // --- gift ---
      let gifts = await giftDB.find(giftQuery);
      gifts = gifts.map((gift) => {
        gift.totalPrice = gift.giftNumber * gift.price;
        return gift;
      });
      const giftUserMap = gifts.reduce((map, gift) => {
        return Object.assign(map, { [gift.uid]: gift.totalPrice });
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
      const maxGiftUser = gifts.find((gift) => gift.uid === Number(maxGiftUid));
      this.maxGiftUser = maxGiftUser.name;
      const giftUids = gifts.map((gift) => gift.uid);
      this.giftUserCount = Object.keys(giftUserMap).length;

      // --- comment ---
      const comments = await commentDB.find(query, {
        projection: { uid: 1, name: 1 },
      });
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
      const maxCommentUser = comments.find(
        (c) => c.uid === Number(maxCommentUid)
      );
      this.maxCommentUser = maxCommentUser.name;

      // --- interact ---
      const interacts = await interactDB.find(query, {
        projection: { uid: 1 },
      });
      const interactUids = interacts.map((interact) => interacts.uid);
      this.interactUserCount = uniq([
        ...giftUids,
        ...commentUids,
        ...interactUids,
      ]).length;
    },

    changeDateRange([startTime, endTime]) {
      this.dateRange = [new Date(startTime), new Date(endTime)];
    },
    clearDateRange() {
      this.dateRange = []
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
</style>
