<template>
  <div>
    <div class="searcher-wrapper">
      <Input v-model="roomId" placeholder="房间号" clearable style="width: 120px" size="small" />
      <DatePicker
        class="space-left-5px"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        placeholder="选择时间范围"
        style="width: 280px"
        size="small"
        :model-value="dateRange"
        @on-change="changeDateRange"
        @on-clear="clearDateRange"
      />
      <Input v-model="q" class="space-left-5px" placeholder="ID/名称/评论" clearable style="width: 200px" size="small" />
      <Button class="space-left-5px" type="primary" shape="circle" icon="ios-search" :disabled="!roomId || enableMessageListenMode" @click="searchAll" />
      <Checkbox class="space-left-5px" :model-value="isShowUserSpaceLink" @on-change="showUserSpaceLink">查成分</Checkbox>
      <Checkbox :model-value="isShowSilverGift" @on-change="showSilverGift">显示银瓜子礼物</Checkbox>
      <Checkbox :model-value="enableMessageListenMode" @on-change="changeEnableMessageListenMode">实时更新模式</Checkbox>
    </div>
    <div class="content-wrapper">
      <Split v-model="split1" @on-moving="splitMoving">
        <template #left>
          <div class="split-pane">
            <Split v-model="split2" mode="vertical" @on-moving="splitLeftMoving">
              <template #top>
                <div id="split-left-top" class="split-pane">
                  <Scroll :on-reach-edge="handleReachEdgeComment" :height="scrollHeightLeftTop" :distance-to-edge="[10, 10]">
                    <template v-for="(comment, i) in comments" :key="i">
                      <div class="comment-content">
                        <span class="date-style">{{ dateFormat(comment.sendAt) }}</span>
                        <img v-if="comment.role" class="guard-icon space-left-2" :src="`${getGuardIcon(comment.role)}`" />
                        <FanMedal
                          v-if="comment.medalLevel && comment.medalName"
                          class="space-left-2"
                          :medal-level="comment.medalLevel"
                          :medal-name="comment.medalName"
                          :medal-color-start="comment.medalColorStart"
                          :medal-color-end="comment.medalColorEnd"
                          :medal-color-border="comment.medalColorBorder"
                        />
                        <span class="space-left-2">{{ `${comment.uname}` }}</span>
                        <span v-if="isShowUserSpaceLink" class="user-link" @click="openBiliUserSpace(comment.uid)">{{ `(${comment.uid})` }}</span>
                        <!-- <span>{{ `: ${comment.comment}` }}</span> -->
                        <span>: </span>
                        <span v-if="comment.voiceUrl" class="voice-container" @click="playAudio(comment.voiceUrl)">
                          <Icon type="md-play" />
                          <span>{{ `${comment.fileDuration}"` }}</span>
                        </span>
                        <img v-if="comment.emojiUrl" :style="{ 'vertical-align': 'middle', height: '20px' }" :src="comment.emojiUrl" />
                        <span v-else>{{ comment.content }}</span>
                      </div>
                    </template>
                  </Scroll>
                </div>
              </template>
              <template #bottom>
                <div id="split-left-bottom" class="split-pane">
                  <Scroll :on-reach-edge="handleReachEdgeInteract" :height="scrollHeightLeftBottom" :distance-to-edge="[10, 10]">
                    <template v-for="(interact, i) in interacts" :key="i">
                      <div>
                        <span class="date-style">{{ dateFormat(interact.sendAt) }}</span>
                        <FanMedal
                          v-if="interact.medalLevel && interact.medalName"
                          class="space-left-2"
                          :medal-level="interact.medalLevel"
                          :medal-name="interact.medalName"
                          :medal-color-start="interact.medalColorStart"
                          :medal-color-end="interact.medalColorEnd"
                          :medal-color-border="interact.medalColorBorder"
                        />
                        <span class="space-left-2" :style="{ color: interact.unameColor ? interact.unameColor : undefined }">{{ `${interact.uname}` }}</span>
                        <span v-if="isShowUserSpaceLink" class="user-link" @click="openBiliUserSpace(interact.uid)">{{ `(${interact.uid})` }}</span>
                        <span>{{ getInteractType(interact.type) }}了直播间</span>
                      </div>
                    </template>
                  </Scroll>
                </div>
              </template>
            </Split>
          </div>
        </template>
        <template #right>
          <div id="split-right" class="split-pane">
            <Scroll :on-reach-edge="handleReachEdgeGift" :height="scrollHeightRight" :distance-to-edge="[10, 10]">
              <template v-for="(gift, i) in gifts" :key="i">
                <div :style="{ padding: '0 10px' }">
                  <template v-if="gift.type === 3">
                    <GiftCardMini v-bind="gift" :show-time="true">{{ `: ${gift.content}` }}</GiftCardMini>
                  </template>
                  <template v-if="gift.type === 1 || gift.type === 2">
                    <GiftCardMini v-bind="gift" :show-time="true">{{ ` 赠送了 ${gift.count}个 ${gift.name}` }}</GiftCardMini>
                  </template>
                </div>
              </template>
            </Scroll>
          </div>
        </template>
      </Split>
    </div>
  </div>
</template>

<script>
import { shell } from 'electron'
import { getCurrentWindow } from '@electron/remote'
const window = getCurrentWindow()
import { GUARD_ICON_MAP, INTERACT_TYPE } from '../../service/const'
import { getPriceProperties, dateFormat, wait } from '../../service/util'
import { queryGifts, queryInteracts, queryComments } from '../../service/api'
import GiftCardMini from './GiftCardMini'
import FanMedal from './FanMedal'
import ws from '../../service/ws'
const COMMENTS_LIMIT = 200
const GIFTS_LIMIT = 200
const INTERACTS_LIMIT = 200

export default {
  components: {
    GiftCardMini,
    FanMedal,
  },
  data() {
    return {
      q: '',
      split1: 0.6,
      split2: 0.7,
      roomId: 0,
      userId: null,
      userName: '',
      dateRange: [],
      comments: [],
      interacts: [],
      gifts: [],
      scrollHeightLeftTop: 300,
      scrollHeightLeftBottom: 100,
      scrollHeightRight: 1000,
    }
  },
  computed: {
    enableMessageListenMode() {
      return this.$store.state.Config.enableMessageListenMode
    },
    isShowSilverGift() {
      return this.$store.state.Config.isShowSilverGift
    },
    isShowUserSpaceLink() {
      return this.$store.state.Config.isShowUserSpaceLink
    },
  },
  created() {
    this.roomId = this.$store.state.Config.realRoomId
    // const startTime =
    // new Date(this.$store.state.Config.connectedAt) ||
    // new Date(Date.now() - 15 * 60 * 1000); // 15 min ago
    // this.dateRange = [startTime, new Date(Date.now() + 15 * 60 * 1000)];
    this.searchAll()
    window.on('resize', this.onResize)

    if (this.enableMessageListenMode) {
      this.listenStart()
    }
  },
  beforeUnmount() {
    window.removeListener('resize', this.onResize)
    this.listenStop()
  },
  mounted() {
    setTimeout(() => {
      this.onResize()
    }, 0)
  },
  methods: {
    changeDateRange([startTime, endTime]) {
      this.dateRange = [new Date(startTime), new Date(endTime)]
    },
    async searchAll(options) {
      const comments = await this.searchComment(options)
      this.comments = comments
      const interacts = await this.searchInteract(options)
      this.interacts = interacts
      let gifts = await this.searchGift(options)

      gifts = gifts.map(this.formatGift)
      this.gifts = gifts
    },
    async searchComment(options = {}) {
      const { sort, skip, limit, scrollToken } = options
      if (scrollToken) {
      }
      const query = {}
      if (this.roomId) {
        query.roomId = parseInt(this.roomId)
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        }
      }
      if (this.q) {
        query.$or = [
          {
            uid: parseInt(this.q),
          },
          {
            uname: { $regex: this.q },
          },
          {
            content: { $regex: this.q },
          },
        ]
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(':')
        query.sendAt = query.sendAt || {}
        query.sendAt[scrollKey] = Number(scrollValue)
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
      return comments
    },
    async searchInteract(options = {}) {
      const { sort, skip, limit, scrollToken } = options
      if (scrollToken) {
      }
      const query = {}
      if (this.roomId) {
        query.roomId = parseInt(this.roomId)
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        }
      }
      if (this.q) {
        query.$or = [
          {
            uid: parseInt(this.q),
          },
          {
            uname: { $regex: this.q },
          },
        ]
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(':')
        query.sendAt = query.sendAt || {}
        query.sendAt[scrollKey] = Number(scrollValue)
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
      return interacts
    },

    async searchGift(options = {}) {
      const { sort, skip, limit, scrollToken, isShowSilverGift } = options
      const query = {}
      if (this.roomId) {
        query.roomId = parseInt(this.roomId)
      }
      if (this.dateRange.length) {
        query.sendAt = {
          $gte: this.dateRange[0].getTime(),
          $lte: this.dateRange[1].getTime(),
        }
      }
      if (this.q) {
        query.$or = [
          {
            uid: parseInt(this.q),
          },
          {
            uname: { $regex: this.q },
          },
          {
            content: { $regex: this.q },
          },
        ]
      }
      if (scrollToken) {
        const [scrollKey, scrollValue] = scrollToken.split(':')
        query.sendAt = query.sendAt || {}
        query.sendAt[scrollKey] = Number(scrollValue)
      }

      if (!(isShowSilverGift !== undefined ? isShowSilverGift : this.isShowSilverGift)) {
        query.coinType = 1
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
      return gifts
    },

    handleReachEdgeComment(dir) {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
          const firstComment = this.comments[0]
          const comments = await this.searchComment({
            scrollToken: `$gt:${firstComment.sendAt}`,
            sort: { sendAt: 1 },
          })
          comments.reverse()
          setTimeout(() => {
            this.comments = [...comments, ...this.comments]
          }, 700)
        }
        // 向下
        if (dir < 0) {
          const lastComment = this.comments[this.comments.length - 1]
          const comments = await this.searchComment({
            scrollToken: `$lt:${lastComment.sendAt}`,
            sort: { sendAt: -1 },
          })
          setTimeout(() => {
            this.comments = [...this.comments, ...comments]
          }, 700)
        }
        resolve()
      })
    },
    showUserSpaceLink(status) {
      this.$store.dispatch('UPDATE_CONFIG', {
        isShowUserSpaceLink: status,
      })
    },
    splitLeftMoving(e) {
      const leftTop = document.getElementById('split-left-top')
      this.scrollHeightLeftTop = leftTop.clientHeight
      const leftBottom = document.getElementById('split-left-bottom')
      this.scrollHeightLeftBottom = leftBottom.clientHeight
    },
    splitMoving(e) {
      const right = document.getElementById('split-right')
      this.scrollHeightRight = right.clientHeight
    },
    clearDateRange() {
      setTimeout(() => {
        this.dateRange = []
      }, 0)
    },
    handleReachEdgeInteract(dir) {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
          const firstInteract = this.interacts[0]
          const interacts = await this.searchInteract({
            scrollToken: `$gt:${firstInteract.sendAt}`,
            sort: { sendAt: 1 },
          })
          interacts.reverse()
          setTimeout(() => {
            this.interacts = [...interacts, ...this.interacts]
          }, 700)
        }
        // 向下
        if (dir < 0) {
          const lastInteract = this.interacts[this.interacts.length - 1]
          const interacts = await this.searchInteract({
            scrollToken: `$lt:${lastInteract.sendAt}`,
            sort: { sendAt: -1 },
          })
          setTimeout(() => {
            this.interacts = [...this.interacts, ...interacts]
          }, 700)
        }
        resolve()
      })
    },

    handleReachEdgeGift(dir) {
      return new Promise(async (resolve, reject) => {
        // 向上
        if (dir > 0) {
          const firstGift = this.gifts[0]
          let gifts = await this.searchGift({
            scrollToken: `$gt:${firstGift.sendAt}`,
            sort: { sendAt: 1 },
          })
          gifts.reverse()
          gifts = gifts.map(this.formatGift)
          setTimeout(() => {
            this.gifts = [...gifts, ...this.gifts]
          }, 700)
        }
        // 向下
        if (dir < 0) {
          const lastGift = this.gifts[this.gifts.length - 1]
          let gifts = await this.searchGift({
            scrollToken: `$lt:${lastGift.sendAt}`,
            sort: { sendAt: -1 },
          })
          gifts = gifts.map(this.formatGift)
          setTimeout(() => {
            this.gifts = [...this.gifts, ...gifts]
          }, 700)
        }
        resolve()
      })
    },
    openBiliUserSpace(userId) {
      shell.openExternal(`https://space.bilibili.com/${userId}`)
    },
    dateFormat(date) {
      return dateFormat(date)
    },
    formatGift(gift) {
      gift.totalPrice = (gift.count || 1) * gift.price
      gift.totalPrice = Number.isInteger(gift.totalPrice) ? gift.totalPrice : gift.totalPrice.toFixed(1)
      return Object.assign({}, gift, {
        priceProperties: getPriceProperties(gift.totalPrice) || {},
      })
    },
    async showSilverGift(status) {
      this.$store.dispatch('UPDATE_CONFIG', {
        isShowSilverGift: status,
      })
      let gifts = await this.searchGift({
        isShowSilverGift: status,
      })
      gifts = gifts.map(this.formatGift)
      this.gifts = gifts
    },
    getGuardIcon(level) {
      return GUARD_ICON_MAP[level]
    },
    getInteractType(type) {
      return INTERACT_TYPE[type]
    },
    onResize: function () {
      this.splitLeftMoving()
      this.splitMoving()
    },

    playAudio(url) {
      const audio = new Audio(url)
      audio.play()
    },

    async changeEnableMessageListenMode(status) {
      this.$store.dispatch('UPDATE_CONFIG', {
        enableMessageListenMode: status,
      })
      if (status) {
        await this.searchAll()
        this.listenStart()
      } else {
        this.listenStop()
      }
    },

    async listenStart() {
      ws.addEventListener('message', this.onMessage)
    },
    listenStop() {
      ws.removeEventListener('message', this.onMessage)
    },

    onMessage(msg) {
      const payload = JSON.parse(msg.data)
      if (payload.cmd === 'COMMENT') {
        this.onComment(payload.payload)
      }
      if (payload.cmd === 'GIFT') {
        this.onGift(payload.payload)
      }
      if (payload.cmd === 'INTERACT') {
        this.onInteract(payload.payload)
      }
      if (payload.cmd === 'SUPER_CHAT') {
        this.onGift(payload.payload)
      }
    },

    onComment(payload) {
      if (this.comments.length > COMMENTS_LIMIT) {
        this.comments.pop()
      }
      this.comments = [payload, ...this.comments]
    },
    onInteract(payload) {
      if (this.interacts.length > INTERACTS_LIMIT) {
        this.interacts.pop()
      }
      this.interacts = [payload, ...this.interacts]
    },
    onGift(payload) {
      if (!this.isShowSilverGift && payload.coinType === 2) {
        return
      }
      payload = this.formatGift(payload)
      // 已存在的礼物覆盖，不存在的新增
      const existGift = this.gifts.find((gift) => gift._id === payload._id)
      if (existGift) {
        existGift.count = payload.count
        existGift.totalPrice = payload.totalPrice
        existGift.priceProperties = payload.priceProperties
      } else {
        if (this.gifts.length > GIFTS_LIMIT) {
          this.gifts.pop()
        }
        this.gifts = [payload, ...this.gifts]
      }
    },
  },
}
</script>

<style scoped>
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
  padding: 0px 30px;
  border-bottom: 1px solid lightgray;
}

.space-left-5px {
  margin-left: 5px;
}

.space-left-2 {
  margin-left: 2px;
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
