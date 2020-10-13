<template>
  <div
    :style="{position:'absolute',top:'4px',bottom:'4px',left:'4px', right:'4px', '-webkit-user-select': 'none', opacity: windowOpacity}"
  >
    <div
      @wheel.prevent="giftScroll"
      @mouseenter="isSingleWindow ? setUnIgnoreMouseEvent(): undefined"
      @mouseleave="isSingleWindow ? setIgnoreMouseEvent(): undefined"
      class="gift-show-content-wrapper-wrapper"
    >
      <div class="gift-show-content-wrapper" id="gift-show-content-wrapper">
        <transition-group name="fade">
          <template v-for="gift in gifts">
            <div
              :key="gift.id"
              @mouseenter="hoverGift(gift.id)"
              @mouseleave="unhoverGift(gift.id)"
              class="gift-show-wrapper"
            >
              <!-- <transition name="fade"> -->
              <div
                :key="`${gift.id}_normal`"
                v-if="!giftHover.includes(gift.id)"
                class="gift-show-content"
                :style="{background: gift.priceProperties.backgroundColor}"
              >
                <div
                  :style="{'z-index': -1, position: 'absolute', width: `${widthCalculator(gift)}%`,height: '100%',background: gift.priceProperties.backgroundBottomColor}"
                ></div>
                <div
                  :style="{margin: '0 10px','font-weight': 'bold', 'z-index': 3, '-webkit-text-stroke-width': '0.3px','-webkit-text-stroke-color': gift.priceProperties.backgroundPriceColor}"
                >
                  <Avatar class :src="gift.avatar || DEFAULT_AVATAR" size="small" />
                  <span v-if="gift.totalPrice">{{`￥${gift.totalPrice}`}}</span>
                </div>
              </div>
              <div
                :key="`${gift.id}_extend`"
                v-else
                class="gift-show-content-extend"
                :style="{border: `1px solid ${gift.priceProperties.backgroundBottomColor}`}"
              >
                <div
                  class="gift-show-content-header"
                  :style="{background: gift.priceProperties.backgroundColor}"
                >
                  <Avatar
                    class="gift-show-content-extend-avatar"
                    :src="gift.avatar || DEFAULT_AVATAR"
                  />
                  <div :style="{display: 'inline-block'}">
                    <p>{{gift.name}}</p>
                    <p v-if="gift.totalPrice">{{`￥${gift.totalPrice}`}}</p>
                  </div>
                </div>
                <div
                  class="gift-show-content-extend-content"
                  :style="{background: gift.priceProperties.backgroundBottomColor}"
                >{{ gift.type === 'superChat' ? gift.comment : `${gift.name} 赠送了 ${gift.giftNumber} 个 ${gift.giftName}`}}</div>
              </div>
              <!-- </transition> -->
            </div>
          </template>
        </transition-group>
      </div>
    </div>
    <div class="message-content-wrapper">
      <div
        :style="{position: 'absolute', height: '100%', width: '80%', '-webkit-app-region': 'drag'}"
      ></div>
      <div :style="{position: 'absolute', height: '100%', width: '20%',right:'0'}"></div>
      <transition-group name="fade" tag="div" class="message-content">
        <p :key="message.id" v-for="message in messages">
          <template v-if="message.type==='comment'">
            <p :style="getMessageStyleByRole(message)">
              <Avatar v-if="isShowAvatar" :src="message.avatar" :style="avatarSizeStyle" />
              <i
                v-if="isShowMemberShipIcon && message.role"
                class="guard-icon"
                :style="{'background-image': `url(https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard${message.role}.png@44w_44h.webp)`}"
              ></i>
              <span
                :class="`name-${message.role}`"
                :style="getNameStyleByRole(message)"
              >{{message.name}}:</span>
              <span
                :class="`comment-${message.role}`"
                :style="getCommentStyleByRole(message)"
              >{{message.comment}}</span>
              &nbsp;
              <SimilarCommentBadge v-if="message.similar > 0" v-bind:number="message.similar" />
            </p>
          </template>
          <template v-if="message.type==='interactWord'">
            <!-- 入场消息设置默认使用普通设置 -->
            <p :style="getCommentStyleByRole({role: 0})">
              <span :style="{color: message.color? message.color:undefined}">{{message.name}}</span>
              {{`${parseMsgType(message.msgType)}了直播间`}}
            </p>
          </template>
          <template v-if="message.type==='superChat'">
            <GiftCard v-bind="message">{{message.comment}}</GiftCard>
          </template>
          <template v-if="message.type==='gift'">
            <GiftCard
              v-bind="message"
            >{{`${message.name} 赠送了 ${message.giftNumber} 个 ${message.giftName}`}}</GiftCard>
          </template>
        </p>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { difference } from "lodash";
const win = require("electron").remote.getCurrentWindow();

import { DEFAULT_AVATAR, INTERACT_TYPE } from "../../service/const";
import { getPriceProperties } from '../../service/util'
import SimilarCommentBadge from "./SimilarCommentBadge";
import GiftCard from "./GiftCard";

export default {
  components: {
    SimilarCommentBadge,
    GiftCard,
  },
  props: ["isPreview", "isSingleWindow"],
  data() {
    return {
      giftHover: [],
      DEFAULT_AVATAR,
    };
  },
  watch: {
    gifts: function (newGifts, oldGifts) {
      const newIds = difference(
        newGifts.map((gift) => gift.id),
        oldGifts.map((gift) => gift.id)
      );
      if (!newIds.length) return;
      this.giftHover = [...this.giftHover, ...newIds];
      newIds.forEach((newId) => {
        setTimeout(() => {
          this.giftHover = this.giftHover.filter((id) => id !== newId);
        }, 5000);
      });
    },
  },
  computed: {
    isAlwaysOnTop() {
      return this.$store.state.Config.isAlwaysOnTop;
    },
    showGiftCardThreshold() {
      return this.$store.state.Config.showGiftCardThreshold;
    },
    isShowMemberShipIcon() {
      return this.$store.state.Config.isShowMemberShipIcon;
    },
    isShowAvatar() {
      return this.$store.state.Config.isShowAvatar;
    },
    avatarSizeStyle() {
      const avatarSize = this.$store.state.Config.avatarSize;
      return {
        width: `${avatarSize}px`,
        height: `${avatarSize}px`,
        "line-height": `${avatarSize}px`,
      };
    },
    windowOpacity() {
      return this.$store.state.Config.windowOpacity;
    },

    messages() {
      const messages = this.isPreview
        ? this.$store.state.Message.exampleMessages
        : this.$store.state.Message.messages;
      return messages
        .filter((message) => {
          return (
            !message.totalPrice ||
            message.totalPrice > this.showGiftCardThreshold
          );
        })
        .map((message) => {
          return Object.assign({}, message, {
            priceProperties: getPriceProperties(message.totalPrice) || {},
          });
        })
        .reverse();
    },

    gifts() {
      const gifts = this.isPreview
        ? this.$store.state.Message.exampleGifts
        : this.$store.state.Message.gifts;
      return gifts
        .map((gift) => {
          return Object.assign({}, gift, {
            priceProperties: getPriceProperties(gift.totalPrice) || {},
          });
        })
        .filter((gift) => {
          return gift.sendAt + gift.priceProperties.time > new Date() - 0;
        })
        .reverse();

      // TODO: 清理时间到达消失的GIFT
    },

    "0_message"() {
      return this.$store.state.Config["0_message"];
    },
    "0_name"() {
      return this.$store.state.Config["0_name"];
    },
    "0_comment"() {
      return this.$store.state.Config["0_comment"];
    },

    "3_message"() {
      return this.$store.state.Config["3_message"];
    },
    "3_name"() {
      return this.$store.state.Config["3_name"];
    },
    "3_comment"() {
      return this.$store.state.Config["3_comment"];
    },

    // 提督和总督暂时使用舰长配置
    "2_message"() {
      return this.$store.state.Config["3_message"];
    },
    "2_name"() {
      return this.$store.state.Config["3_name"];
    },
    "2_comment"() {
      return this.$store.state.Config["3_comment"];
    },

    "1_message"() {
      return this.$store.state.Config["3_message"];
    },
    "1_name"() {
      return this.$store.state.Config["3_name"];
    },
    "1_comment"() {
      return this.$store.state.Config["3_comment"];
    },
  },
  mounted() {},
  methods: {
    getMessageStyleByRole(message) {
      return this[`${message.role}_message`];
    },
    getNameStyleByRole(message) {
      return this[`${message.role}_name`];
    },
    getCommentStyleByRole(message) {
      return this[`${message.role}_comment`];
    },

    parseMsgType(msgType) {
      return INTERACT_TYPE[msgType]
    },

    hoverGift(giftId) {
      this.giftHover = [...this.giftHover, giftId];
    },
    unhoverGift(giftId) {
      this.giftHover = this.giftHover.filter((id) => id !== giftId);
    },
    widthCalculator(gift) {
      if (Number(gift.existsTime) && Number(gift.priceProperties.time)) {
        return Math.floor(
          (1 - gift.existsTime / gift.priceProperties.time) * 100
        );
      } else {
        return 100;
      }
    },
    setIgnoreMouseEvent() {
      if (this.isAlwaysOnTop) {
        win.setIgnoreMouseEvents(true, { forward: true });
      }
    },
    setUnIgnoreMouseEvent() {
      win.setIgnoreMouseEvents(false);
    },
    giftScroll(e) {
      const el = document.getElementById("gift-show-content-wrapper");
      el.scrollLeft += e.deltaY;
    },
  },
};
</script>

<style scoped>
.layout {
  position: relative;
  overflow: hidden;
}
.layout-logo {
  float: left;
  position: relative;
}
.layout-nav {
  margin: 0 auto;
}
.layout-footer-center {
  text-align: center;
}
.gift-show-content-wrapper {
  white-space: nowrap;
  position: absolute;
  z-index: 999;
  overflow-x: auto;
  width: 100%;
  /* -webkit-app-region: no-drag; */
}

.gift-show-content-wrapper::-webkit-scrollbar {
  display: none;
}

.gift-show-content-wrapper-wrapper {
  position: relative;
  height: 40px;
  /* -webkit-app-region: no-drag; */
}

.message-content-wrapper {
  height: calc(100% - 40px);
  /* height: 100%; */
  overflow: hidden;
  position: relative;
}
.message-content {
  width: 100%;
  position: absolute;
  bottom: 0px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
}

.message-content::-webkit-scrollbar {
  display: none;
}

.gift-show-wrapper {
  display: inline-block;
  vertical-align: top;
}
.gift-show-content {
  display: inline-block;
  line-height: 32px;
  border-radius: 20px;
  height: 32px;
  margin-right: 3px;
  color: white;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.gift-show-content-extend {
  border-radius: 10px;
  margin-right: 3px;

  width: 200px;
  font-size: 12px;
  position: relative;
  z-index: 9999;
  overflow: hidden;
  /* -webkit-app-region: no-drag */
}

.gift-show-content-header {
  padding: 5px 10px;
}

.gift-show-content-extend-avatar {
  vertical-align: top;
  margin-top: 2px;
}

.gift-show-content-extend-content {
  padding: 10px 10px;

  color: white;
  white-space: normal;
}

.message-super-chat {
  border-radius: 10px;
  border: solid 1px rgba(66, 125, 158, 1);
  margin: 5px;
  overflow: hidden;
}
.message-super-chat-content {
  padding: 10px;
}
.divider {
  border-top: 1px solid;
  width: 100%;
  padding: 5px 0;
  position: relative;
}
.guard-icon {
  width: 22px;
  height: 22px;
  display: inline-block;
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
