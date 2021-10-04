<template>
  <div class="query-component">
    <div class="searcher-wrapper">
      <Input v-model="roomId" placeholder="房间号" clearable style="width: 120px" size="small" />
      <DatePicker type="datetimerange" format="yyyy-MM-dd HH:mm" placeholder="选择时间范围" style="width: 300px" size="small" :value="dateRange" @on-change="changeDateRange" @on-clear="clearDateRange"></DatePicker>
      <Input v-model="userId" placeholder="用户ID" clearable style="width: 100px" size="small" />
      <Input v-model="userName" placeholder="用户名" clearable style="width: 100px" size="small" />
      <Button type="primary" shape="circle" icon="ios-search" :disabled="!roomId" @click="searchAll"></Button>
      <Checkbox class="setting-checkbox" :value="isShowUserSpaceLink" @on-change="showUserSpaceLink">查成分</Checkbox>
      <Checkbox class="setting-checkbox" :value="isShowSilverGift" @on-change="showSilverGift">显示银瓜子礼物</Checkbox>
    </div>
    <div class="content-wrapper">
      <Split v-model="split1" @on-moving="splitMoving">
        <div slot="left" class="split-pane">
          <Split v-model="split2" mode="vertical" @on-moving="splitLeftMoving">
            <div slot="top" class="split-pane" id="split-left-top">
              <Scroll :on-reach-edge="handleReachEdgeComment" :height="scrollHeightLeftTop" :distance-to-edge="[10, 10]">
                <template v-for="comment in comments">
                  <div :key="comment._id" class="comment-content">
                    <span class="date-style">{{
                      dateFormat(comment.sendAt)
                    }}</span>
                    <i v-if="comment.role" class="guard-icon" :style="{
                        'background-image': `url(${getGuardIcon(
                          comment.role
                        )})`,
                      }"></i>
                    <FanMedal v-if="comment.medalLevel && comment.medalName" :medalLevel="comment.medalLevel" :medalName="comment.medalName" :medalColorStart="comment.medalColorStart" :medalColorEnd="comment.medalColorEnd" :medalColorBorder="comment.medalColorBorder"></FanMedal>
                    <span>{{ `${comment.uname}` }}</span>
                    <span v-if="isShowUserSpaceLink" class="user-link" @click="openBiliUserSpace(comment.uid)">{{ `(${comment.uid})` }}</span>
                    <!-- <span>{{ `: ${comment.comment}` }}</span> -->
                    <span>: </span>
                    <span v-if="comment.voiceUrl" @click="playAudio(comment.voiceUrl)" class="voice-container">
                      <Icon type="md-play" />
                      <span>{{ `${comment.fileDuration}"` }}</span>
                    </span>
                    <img v-if="comment.emojiUrl" :style="{ 'vertical-align': 'middle', height: '20px' }" :src="comment.emojiUrl" />
                    <span v-else>{{ comment.content }}</span>
                  </div>
                </template>
              </Scroll>
            </div>
            <div slot="bottom" class="split-pane" id="split-left-bottom">
              <Scroll :on-reach-edge="handleReachEdgeInteract" :height="scrollHeightLeftBottom" :distance-to-edge="[10, 10]">
                <template v-for="interact in interacts">
                  <div :key="interact._id">
                    <span class="date-style">{{ dateFormat(interact.sendAt) }}</span>
                    <FanMedal v-if="interact.medalLevel && interact.medalName" :medalLevel="interact.medalLevel" :medalName="interact.medalName" :medalColorStart="interact.medalColorStart" :medalColorEnd="interact.medalColorEnd" :medalColorBorder="interact.medalColorBorder"></FanMedal>
                    <span :style="{
                        color: interact.unameColor
                          ? interact.unameColor
                          : undefined,
                      }">{{ `${interact.uname}` }}</span>
                    <span v-if="isShowUserSpaceLink" class="user-link" @click="openBiliUserSpace(interact.uid)">{{ `(${interact.uid})` }}</span>
                    <span>{{ getInteractType(interact.type) }}了直播间</span>
                  </div>
                </template>
              </Scroll>
            </div>
          </Split>
        </div>
        <div slot="right" class="split-pane" id="split-right">
          <Scroll :on-reach-edge="handleReachEdgeGift" :height="scrollHeightRight" :distance-to-edge="[10, 10]">
            <template v-for="gift in gifts">
              <div :key="gift._id" :style="{ padding: '0 10px' }">
                <!-- <p class="date-style" :style="{ padding: '0 8px' }">
                  {{ dateFormat(gift.sendAt) }}
                </p> -->
                <template v-if="gift.type === 3">
                  <GiftCardMini v-bind="gift" :showTime="true">{{ `: ${gift.content}` }}</GiftCardMini>
                </template>
                <template v-if="gift.type === 1 || gift.type === 2">
                  <GiftCardMini v-bind="gift" :showTime="true">{{
                    `: 赠送了 ${gift.count}个 ${gift.name}`
                  }}</GiftCardMini>
                </template>
              </div>
            </template>
          </Scroll>
        </div>
      </Split>
    </div>
  </div>
</template>

<script>
import { shell, remote } from "electron";
const window = remote.getCurrentWindow();
import { GUARD_ICON_MAP, INTERACT_TYPE } from "../../service/const";
import { getPriceProperties, dateFormat } from "../../service/util";
import { queryGifts, queryInteracts, queryComments } from '../../service/api'
import GiftCardMini from "./GiftCardMini";
import FanMedal from "./FanMedal";

export default {
  components: {
    GiftCardMini,
    FanMedal,
  },
  data() {
    return {
      split1: 0.6,
      split2: 0.7,
      roomId: 0,
      userId: null,
      userName: "",
      dateRange: [],
      comments: [],
      interacts: [],
      gifts: [],
      isShowUserSpaceLink: false,
      scrollHeightLeftTop: 300,
      scrollHeightLeftBottom: 100,
      scrollHeightRight: 1000,
      isShowSilverGift: false,
    };
  },
  created() {
    this.roomId = this.$store.state.Config.realRoomId;
    // const startTime =
    // new Date(this.$store.state.Config.connectedAt) ||
    // new Date(Date.now() - 15 * 60 * 1000); // 15 min ago
    // this.dateRange = [startTime, new Date(Date.now() + 15 * 60 * 1000)];
    this.searchAll();
    window.on("resize", this.onResize);
  },
  beforeDestroy() {
    window.removeListener("resize", this.onResize);
  },
  mounted() {
    setTimeout(() => {
      this.onResize();
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
        query.roomId = parseInt(this.roomId);
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        };
      }
      if (this.userId) {
        query.uid = parseInt(this.userId);
      }
      if (this.userName) {
        query.uname = { $regex: this.userName };
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(":");
        query.sendAt = query.sendAt || {};
        query.sendAt[scrollKey] = Number(scrollValue);
      }
      const { data: comments } = await queryComments({
        query,
        sort: sort || { sendAt: -1 },
        limit: 40,
      })
      // comments.forEach(c => {
      //   c.voiceUrl = 'https://boss.hdslb.com/live-dm-voice/5eadc703ab749222fa39b32829182b221627829056.wav?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=2663ba902868f12f%2F20210801%2Fshjd%2Fs3%2Faws4_request&X-Amz-Date=20210801T144416Z&X-Amz-Expires=600000&X-Amz-SignedHeaders=host&X-Amz-Signature=36f89eb79658cfdb62cb32ce188586fef446f47cb762fbf3917944556608a506'
      //   c.fileDuration = 5
      // })
      // const comments = await commentDB.find(query, {
      //   sort: sort || { sendAt: -1 },
      //   limit: 20,
      // });
      return comments;
    },
    async searchInteract(options = {}) {
      const { sort, skip, limit, scrollToken } = options;
      if (scrollToken) {
      }
      const query = {};
      if (this.roomId) {
        query.roomId = parseInt(this.roomId);
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        };
      }
      if (this.userId) {
        query.uid = parseInt(this.userId);
      }
      if (this.userName) {
        query.uname = { $regex: this.userName };
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(":");
        query.sendAt = query.sendAt || {};
        query.sendAt[scrollKey] = Number(scrollValue);
      }
      const { data: interacts } = await queryInteracts({
        query,
        sort: sort || { sendAt: -1 },
        limit: 20,
      })
      // const interacts = await interactDB.find(query, {
      //   sort: sort || { sendAt: -1 },
      //   limit: 20,
      // });
      return interacts;
    },

    async searchGift(options = {}) {
      const { sort, skip, limit, scrollToken } = options;
      if (scrollToken) {
      }
      const query = {};
      if (this.roomId) {
        query.roomId = parseInt(this.roomId);
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        };
      }
      if (this.userId) {
        query.uid = parseInt(this.userId);
      }
      if (this.userName) {
        query.uname = { $regex: this.userName };
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(":");
        query.sendAt = query.sendAt || {};
        query.sendAt[scrollKey] = Number(scrollValue);
      }
      if (!this.isShowSilverGift) {
        query.coinType = 1;
      }
      const { data: gifts } = await queryGifts({
        query,
        sort: sort || { sendAt: -1 },
        limit: 20,
      })
      // const gifts = await giftDB.find(query, {
      //   sort: sort || { sendAt: -1 },
      //   limit: 20,
      // });
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
    splitMoving(e) {
      const right = document.getElementById("split-right");
      this.scrollHeightRight = right.clientHeight;
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
          gifts = gifts.map(this.formatGift);
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
          gifts = gifts.map(this.formatGift);
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
      return dateFormat(date)
    },
    formatGift(gift) {
      gift.totalPrice = (gift.count || 1) * gift.price;
      gift.totalPrice = Number.isInteger(gift.totalPrice)
        ? gift.totalPrice
        : gift.totalPrice.toFixed(1);
      return Object.assign({}, gift, {
        priceProperties: getPriceProperties(gift.totalPrice) || {},
      });
    },
    async showSilverGift(status) {
      this.isShowSilverGift = status;
      let gifts = await this.searchGift({
        isShowSilverGift: status,
      });
      gifts = gifts.map(this.formatGift);
      this.gifts = gifts;
    },
    getGuardIcon(level) {
      return GUARD_ICON_MAP[level];
    },
    getInteractType(type) {
      return INTERACT_TYPE[type];
    },
    onResize: function () {
      this.splitLeftMoving();
      this.splitMoving();
    },

    playAudio(url) {
      const audio = new Audio(url)
      audio.play()
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

#split-left-top,
#split-left-bottom {
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
  min-width: 1000px;
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
  color: lightsalmon;
  text-decoration: underline;
}
.devider {
  width: 90%;
  height: 1px;
  background: silver;
}
.date-style {
  font-size: 12px;
  font-family: unset;
  font-weight: bold;
}
.voice-container {
  padding: 0 4px;
  border: 1px solid silver;
  border-radius: 8px;
  cursor: pointer;
}
</style>
