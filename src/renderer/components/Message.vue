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
    </div>
    <div class="content-wrapper">
      <Split v-model="split1">
        <div slot="left" class="split-pane">
          <Split v-model="split2" mode="vertical" @on-moving="splitLeftMoving">
            <div slot="top" class="split-pane" id="split-left-top">
              <Scroll
                :on-reach-edge="handleReachEdge"
                :height="scrollHeight"
                :distance-to-edge="[10,10]"
              >
                <template v-for="comment in comments">
                  <div :key="comment._id">
                    <span>{{(new Date(comment.sendAt)).toLocaleString()}}</span>
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
                    <span v-if="isShowUserSpaceLink">{{`(${comment.uid})`}}</span>
                    <span>{{`: ${comment.comment}`}}</span>
                  </div>
                </template>
              </Scroll>
            </div>
            <div slot="bottom" class="split-pane" id="split-left-bottom">
              <Scroll
                :on-reach-edge="handleReachEdge2"
                :height="scrollHeight2"
                :distance-to-edge="[10,10]"
              >
                <template v-for="interact in interacts">
                  <div :key="interact._id">
                    <span>{{(new Date(interact.sendAt)).toLocaleString()}}</span>
                    <span>{{`${interact.name}`}}</span>
                    <span v-if="isShowUserSpaceLink">{{`(${interact.uid})`}}</span>
                    <!-- <span>{{`: ${interact.comment}`}}</span> -->
                  </div>
                </template>
              </Scroll>
            </div>
          </Split>
        </div>
        <div slot="right" class="split-pane"></div>
      </Split>
    </div>
  </div>
</template>

<script>
import db from "../../service/nedb";
const { commentDB, interactDB, userDB, otherDB, giftDB } = db;

export default {
  data() {
    return {
      split1: 0.7,
      split2: 0.7,
      roomId: null,
      userId: null,
      dateRange: [],
      comments: [],
      isShowUserSpaceLink: true,
      scrollHeight: 300,
    };
  },
  created() {
    this.roomId = this.$store.state.Config.roomId;
    const startTime =
      // new Date(this.$store.state.Config.connectedAt) ||
      new Date(Date.now() - 15 * 60 * 1000); // 15 min ago
    // this.dateRange = [startTime, new Date(Date.now() + 15 * 60 * 1000)];
  },
  computed: {},
  methods: {
    changeDateRange([startTime, endTime]) {
      this.dateRange = [new Date(startTime), new Date(endTime)];
    },
    async searchAll(options) {
      const comments = await this.searchComment(options);
      this.comments = comments;
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
      console.log(query);
      const comments = await commentDB.find(query, {
        sort: sort || { sendAt: -1 },
        limit: 20,
      });
      return comments;
    },
    handleReachEdge(dir) {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
          const firstComment = this.comments[0];
          const comments = await this.searchComment({
            scrollToken: `$gt:${firstComment.sendAt}`,
            sort: { sendAt: 1 },
          });
          comments.reverse();
          this.comments = [...comments, ...this.comments];
        }
        // 向下
        if (dir < 0) {
          const lastComment = this.comments[this.comments.length - 1];
          const comments = await this.searchComment({
            scrollToken: `$lt:${lastComment.sendAt}`,
            sort: { sendAt: -1 },
          });
          this.comments = [...this.comments, ...comments];
        }
        resolve();
      });
    },
    showUserSpaceLink(status) {
      this.isShowUserSpaceLink = status;
    },
    splitLeftMoving(e) {
      const doc = document.getElementById("split-left-top");
      this.scrollHeight = doc.clientHeight;
      const doc2 = document.getElementById("split-left-bottom");
      this.scrollHeight2 = doc.clientHeight;
    },
    clearDateRange() {
      setTimeout(() => {
        this.dateRange = [];
      }, 0);
    },
    handleReachEdge2() {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
        }
        // 向下
        if (dir < 0) {
        }
        resolve();
      });
    },
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
}
</style>
