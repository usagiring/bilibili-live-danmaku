<template>
  <div class="query-component">
    <div class="searcher-wrapper">
      <Input v-model="roomId" placeholder="房间号" clearable style="width: 150px" size="small" />
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
      <Input v-model="userId" placeholder="UserId" clearable style="width: 100px" size="small" />
      <Button type="primary" shape="circle" icon="ios-search" @click="searchAll"></Button>
      <Checkbox
        class="setting-checkbox"
        :value="isShowUserSpaceLink"
        @on-change="showUserSpaceLink"
      >查成分</Checkbox>
      <Checkbox
        class="setting-checkbox"
        :value="isShowSilverGift"
        @on-change="showSilverGift"
      >显示银瓜子礼物</Checkbox>
    </div>
    <div class="content-wrapper">
      <Split v-model="split1">
        <div slot="left" class="split-pane">
          <Split v-model="split2" mode="vertical" @on-moving="splitLeftMoving">
            <div slot="top" class="split-pane" id="split-left-top">
              <Scroll
                :on-reach-edge="handleReachEdgeComment"
                :height="scrollHeightLeftTop"
                :distance-to-edge="[10,10]"
              >
                <template v-for="comment in comments">
                  <div :key="comment._id" class="comment-content">
                    <span>{{(dateFormat(comment.sendAt))}}</span>
                    <i
                      v-if="comment.guard"
                      class="guard-icon"
                      :style="{'background-image': `url(https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard${comment.guard}.png@44w_44h.webp)`}"
                    ></i>
                    <span
                      v-if="comment.medalLevel && comment.medalName"
                      class="medal-style"
                    >{{`${comment.medalName}${comment.medalLevel}`}}</span>
                    <span>{{`${comment.name}`}}</span>
                    <span
                      v-if="isShowUserSpaceLink"
                      class="user-link"
                      @click="openBiliUserSpace(comment.uid)"
                    >{{`(${comment.uid})`}}</span>
                    <span>{{`: ${comment.comment}`}}</span>
                  </div>
                </template>
              </Scroll>
            </div>
            <div slot="bottom" class="split-pane" id="split-left-bottom">
              <Scroll
                :on-reach-edge="handleReachEdgeInteract"
                :height="scrollHeightLeftBottom"
                :distance-to-edge="[10,10]"
              >
                <template v-for="interact in interacts">
                  <div :key="interact._id">
                    <span>{{(dateFormat(interact.sendAt))}}</span>
                    <span>{{`${interact.name}`}}</span>
                    <span
                      v-if="isShowUserSpaceLink"
                      class="user-link"
                      @click="openBiliUserSpace(interact.uid)"
                    >{{`(${interact.uid})`}}</span>
                    <span>进入了直播间</span>
                    <!-- <span>{{`: ${interact.comment}`}}</span> -->
                  </div>
                </template>
              </Scroll>
            </div>
          </Split>
        </div>
        <div slot="right" class="split-pane" id="split-right">
          <Scroll
            :on-reach-edge="handleReachEdgeGift"
            :height="scrollHeightRight"
            :distance-to-edge="[10,10]"
          >
            <template v-for="gift in gifts">
              <div :key="gift._id" :style="{padding: '0 10px'}">
                <template v-if="gift.type==='superChat'">
                  <GiftCard v-bind="gift">{{gift.comment}}</GiftCard>
                </template>
                <template v-if="gift.type==='gift'">
                  <GiftCard
                    v-bind="gift"
                  >{{`${gift.name} 赠送了 ${gift.giftNumber} 个 ${gift.giftName}`}}</GiftCard>
                </template>
                <!-- <span>{{`: ${interact.comment}`}}</span> -->
              </div>
            </template>
          </Scroll>
        </div>
      </Split>
    </div>
  </div>
</template>

<script>
import { shell } from "electron";
import moment from "moment";
import { getPriceProperties } from '../../service/util'
import db from "../../service/nedb";
import GiftCard from "./GiftCard";

const { commentDB, interactDB, userDB, otherDB, giftDB } = db;

const PRICE_COLOR = {
  1: {
    backgroundColor: "#EDF5FF",
    backgroundPriceColor: "#7497CD",
    backgroundBottomColor: "#2A60B2",
    time: 60000,
  },
  2: {
    backgroundColor: "#DBFFFD",
    backgroundPriceColor: "#7DA4BD",
    backgroundBottomColor: "#427D9E",
    time: 120000,
  },
  3: {
    backgroundColor: "#FFF1C5",
    backgroundPriceColor: "gold",
    backgroundBottomColor: "#E2B52B",
    time: 300000,
  },
  4: {
    backgroundColor: "rgb(255,234,210)",
    backgroundPriceColor: "rgb(255,234,210)",
    backgroundBottomColor: "rgb(244,148,67)",
    time: 1800000,
  },
  5: {
    backgroundColor: "rgb(255,231,228)",
    backgroundPriceColor: "rgb(255,231,228)",
    backgroundBottomColor: "rgb(229,77,77)",
    time: 3600000,
  },
  6: {
    backgroundColor: "rgb(255,216,216)",
    backgroundPriceColor: "rgb(255,216,216)",
    backgroundBottomColor: "rgb(171,26,50)",
    time: 7200000,
  },
};

export default {
  components: {
    GiftCard,
  },
  data() {
    return {
      split1: 0.7,
      split2: 0.7,
      roomId: null,
      userId: null,
      dateRange: [],
      comments: [],
      interacts: [],
      gifts: [],
      isShowUserSpaceLink: false,
      scrollHeightLeftTop: 300,
      scrollHeightLeftBottom: 100,
      scrollHeightRight: 1000,
      isShowSilverGift: false
    };
  },
  created() {
    this.roomId = this.$store.state.Config.roomId;
    // const startTime =
    // new Date(this.$store.state.Config.connectedAt) ||
    // new Date(Date.now() - 15 * 60 * 1000); // 15 min ago
    // this.dateRange = [startTime, new Date(Date.now() + 15 * 60 * 1000)];
    this.searchAll({
      isShowSilverGift: this.isShowSilverGift
    });
  },
  mounted() {
    setTimeout(() => {
      this.splitLeftMoving();
      const right = document.getElementById("split-right");
      this.scrollHeightRight = right.clientHeight;
    }, 0);
  },
  computed: {},
  methods: {
    changeDateRange([startTime, endTime]) {
      this.dateRange = [new Date(startTime), new Date(endTime)];
    },
    async searchAll(options) {
      const comments = await this.searchComment(options);
      this.comments = comments;
      const interacts = await this.searchInteract(options);
      this.interacts = interacts;
      let gifts = await this.searchGift(options);

      gifts = gifts.map(this.formatGift);
      this.gifts = gifts;
    },
    async searchComment(options = {}) {
      const { sort, skip, limit, scrollToken } = options;
      if (scrollToken) {
      }
      const query = {};
      if (this.roomId) {
        query.roomId = this.roomId;
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        };
      }
      if (this.userId) {
        query.uid = this.userId;
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(":");
        query.sendAt = query.sendAt || {};
        query.sendAt[scrollKey] = Number(scrollValue);
      }
      const comments = await commentDB.find(query, {
        sort: sort || { sendAt: -1 },
        limit: 20,
      });
      return comments;
    },
    async searchInteract(options = {}) {
      const { sort, skip, limit, scrollToken } = options;
      if (scrollToken) {
      }
      const query = {};
      if (this.roomId) {
        query.roomId = this.roomId;
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        };
      }
      if (this.userId) {
        query.uid = this.userId;
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(":");
        query.sendAt = query.sendAt || {};
        query.sendAt[scrollKey] = Number(scrollValue);
      }
      const interacts = await interactDB.find(query, {
        sort: sort || { sendAt: -1 },
        limit: 20,
      });
      return interacts;
    },

    async searchGift(options = {}) {
      const { sort, skip, limit, scrollToken } = options;
      if (scrollToken) {
      }
      const query = {};
      if (this.roomId) {
        query.roomId = this.roomId;
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        };
      }
      if (this.userId) {
        query.uid = this.userId;
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(":");
        query.sendAt = query.sendAt || {};
        query.sendAt[scrollKey] = Number(scrollValue);
      }
      if(!this.isShowSilverGift) {
        query.coinType = 'gold'
      }
      const gifts = await giftDB.find(query, {
        sort: sort || { sendAt: -1 },
        limit: 20,
      });
      console.log(query)
      console.log(gifts)
      return gifts;
    },

    handleReachEdgeComment(dir) {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
          const firstComment = this.comments[0];
          const comments = await this.searchComment({
            scrollToken: `$gt:${firstComment.sendAt}`,
            sort: { sendAt: 1 },
          });
          comments.reverse();
          setTimeout(() => {
            this.comments = [...comments, ...this.comments];
          }, 700);
        }
        // 向下
        if (dir < 0) {
          const lastComment = this.comments[this.comments.length - 1];
          const comments = await this.searchComment({
            scrollToken: `$lt:${lastComment.sendAt}`,
            sort: { sendAt: -1 },
          });
          setTimeout(() => {
            this.comments = [...this.comments, ...comments];
          }, 700);
        }
        resolve();
      });
    },
    showUserSpaceLink(status) {
      this.isShowUserSpaceLink = status;
    },
    splitLeftMoving(e) {
      const leftTop = document.getElementById("split-left-top");
      this.scrollHeightLeftTop = leftTop.clientHeight;
      const leftBottom = document.getElementById("split-left-bottom");
      this.scrollHeightLeftBottom = leftBottom.clientHeight;
    },
    clearDateRange() {
      setTimeout(() => {
        this.dateRange = [];
      }, 0);
    },
    handleReachEdgeInteract(dir) {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
          const firstInteract = this.interacts[0];
          const interacts = await this.searchInteract({
            scrollToken: `$gt:${firstInteract.sendAt}`,
            sort: { sendAt: 1 },
          });
          interacts.reverse();
          setTimeout(() => {
            this.interacts = [...interacts, ...this.interacts];
          }, 700);
        }
        // 向下
        if (dir < 0) {
          const lastInteract = this.interacts[this.interacts.length - 1];
          const interacts = await this.searchInteract({
            scrollToken: `$lt:${lastInteract.sendAt}`,
            sort: { sendAt: -1 },
          });
          setTimeout(() => {
            this.interacts = [...this.interacts, ...interacts];
          }, 700);
        }
        resolve();
      });
    },

    handleReachEdgeGift(dir) {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
          const firstGift = this.gifts[0];
          let gifts = await this.searchGift({
            scrollToken: `$gt:${firstGift.sendAt}`,
            sort: { sendAt: 1 },
          });
          gifts.reverse();
          gifts = gifts.map(this.formatGift)
          setTimeout(() => {
            this.gifts = [...gifts, ...this.gifts];
          }, 700);
        }
        // 向下
        if (dir < 0) {
          const lastGift = this.gifts[this.gifts.length - 1];
          let gifts = await this.searchGift({
            scrollToken: `$lt:${lastGift.sendAt}`,
            sort: { sendAt: -1 },
          });
          gifts = gifts.map(this.formatGift)
          setTimeout(() => {
            this.gifts = [...this.gifts, ...gifts];
          }, 700);
        }
        resolve();
      });
    },
    openBiliUserSpace(userId) {
      shell.openExternal(`https://space.bilibili.com/${userId}`);
    },
    dateFormat(date) {
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
    },
    formatGift(gift) {
      gift.totalPrice = (gift.giftNumber || 1) * gift.price;
      return Object.assign({}, gift, {
        priceProperties: getPriceProperties(gift.totalPrice) || {},
      });
    },
    async showSilverGift(status){
      this.isShowSilverGift = status;
      let gifts = await this.searchGift({
        isShowSilverGift: status
      })
      gifts = gifts.map(this.formatGift);
      this.gifts = gifts;
    }
  },
};
</script>

<style scoped>
.query-component {
  height: 100%;

  /* border: 1px solid #dcdee2; */
}
.content-wrapper {
  height: calc(100% - 35px);
}

.split-pane {
  height: 100%;
  overflow: auto;
}

#split-left-top,#split-left-bottom {
  padding: 5px 10px;
}

.split-pane::-webkit-scrollbar {
  display: none;
}

.ivu-scroll-container::-webkit-scrollbar {
  display: none;
}

.searcher-wrapper {
  height: 35px;
  position: relative;
  padding: 1px 30px;
  border-bottom: 1px solid silver;
}

.guard-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
}
.medal-style {
  font-size: 12px;
  align-content: center;
  border: 0.5px solid gray;
}

.comment-content {
  font-size: 14px;
}
.user-link {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}
</style>
