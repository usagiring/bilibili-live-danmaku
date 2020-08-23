<template>
  <div
    :style="{position:'absolute',top:'4px',bottom:'4px',left:'4px', right:'4px'}"
  >
    <div class="gift-show-content-wrapper-wrapper">
      <div class="gift-show-content-wrapper">
        <template v-for="gift in gifts">
          <div
            :key="gift.id"
            @mouseenter="hoverGift(gift.id)"
            @mouseleave="unhoverGift()"
            class="gift-show-wrapper"
          >
            <div
              v-if="gift.id !== giftHover"
              class="gift-show-content"
              :style="{background: gift.priceProperties.backgroundColor}"
            >
              <div
                :style="{'z-index': -1, position: 'absolute', width: `${widthCalculator(gift)}%`,height: '100%',background: gift.priceProperties.backgroundBottomColor}"
              ></div>
              <div
                :style="{margin: '0 10px','font-weight': 'bold', 'z-index': 3, '-webkit-text-stroke-width': '0.5px','-webkit-text-stroke-color': 'gray'}"
              >
                <Avatar class :src="gift.avatar || DEFAULT_AVATAR" size="small" />
                <span>{{`￥${gift.totalPrice}`}}</span>
              </div>
            </div>
            <div
              v-else
              class="gift-show-content-extend"
              :style="{border: `1px solid ${gift.priceProperties.backgroundBottomColor}`}"
            >
              <div
                class="gift-show-content-header"
                :style="{background: gift.priceProperties.backgroundColor}"
              >
                <Avatar class="gift-show-content-extend-avatar" :src="gift.avatar || DEFAULT_AVATAR" />
                <div :style="{display: 'inline-block'}">
                  <p>{{gift.name}}</p>
                  <p>{{`￥${gift.totalPrice}`}}</p>
                </div>
              </div>
              <div
                class="gift-show-content-extend-content"
                :style="{background: gift.priceProperties.backgroundBottomColor}"
              >{{ gift.type === 'superChat' ? gift.comment : `${gift.name} 赠送了 ${gift.giftNumber} 个 ${gift.giftName}`}}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="message-content-wrapper">
      <div class="message-content">
        <p :key="message.id" v-for="message in messages">
          <template v-if="message.type==='comment'">
            <p :style="getMessageStyleByRole(message)">
              <Avatar v-if="isShowAvatar" :src="message.avatar" :style="avatarSizeStyle" />
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
            <p :style="normal_comment">
              <span :style="{color: message.color? message.color:undefined}">{{message.name}}</span>
              {{`${parseMsgType(message.msgType)}直播间`}}
            </p>
          </template>
          <template v-if="message.type==='superChat'">
            <div
              :style="{border: `solid 1px ${parsePriceColor(message.price).backgroundBottomColor}`}"
              class="message-super-chat"
            >
              <div
                :style="{background: `${parsePriceColor(message.price).backgroundColor}`}"
                class="message-super-chat-content message-super-chat-content-header"
              >
                <div :style="{display: 'inline-block', 'vertical-align':'top'}">
                  <Avatar :src="message.avatar" size="large" />
                </div>
                <div :style="{display: 'inline-block'}">
                  <p>{{message.name}}</p>
                  <p>{{`￥${message.price}`}}</p>
                </div>
              </div>
              <div
                :style="{background: `${parsePriceColor(message.price).backgroundBottomColor}`, color: 'white'}"
                class="message-super-chat-content"
              >{{message.comment}}</div>
            </div>
          </template>
          <template v-if="message.type==='gift'">
            <div
              :style="{border: `solid 1px ${parsePriceColor(message.price * message.giftNumber).backgroundBottomColor}`}"
              class="message-super-chat"
            >
              <div
                :style="{background: `${parsePriceColor(message.price * message.giftNumber).backgroundColor}`}"
                class="message-super-chat-content message-super-chat-content-header"
              >
                <div :style="{display: 'inline-block', 'vertical-align':'top'}">
                  <Avatar :src="message.avatar" size="large" />
                </div>
                <div :style="{display: 'inline-block'}">
                  <p>{{message.name}}</p>
                  <p>{{`￥${Number(message.price * message.giftNumber).toFixed(1)}`}}</p>
                </div>
              </div>
              <div
                :style="{background: `${parsePriceColor(message.price * message.giftNumber).backgroundBottomColor}`, color: 'white'}"
                class="message-super-chat-content"
              >{{`${message.name} 赠送了 ${message.giftNumber} 个 ${message.giftName}`}}</div>
            </div>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { DEFAULT_AVATAR } from "../../service/const";
import SimilarCommentBadge from "./SimilarCommentBadge";

const PRICE_COLOR = {
  "1": {
    backgroundColor: "#EDF5FF",
    backgroundPriceColor: "#7497CD",
    backgroundBottomColor: "#2A60B2",
    time: 60000
  },
  "2": {
    backgroundColor: "#DBFFFD",
    backgroundPriceColor: "#7DA4BD",
    backgroundBottomColor: "#427D9E",
    time: 120000
  },
  "3": {
    backgroundColor: "#FFF1C5",
    backgroundPriceColor: "gold",
    backgroundBottomColor: "#E2B52B",
    time: 300000
  },
  "4": {
    backgroundColor: "rgb(255,234,210)",
    backgroundPriceColor: "rgb(255,234,210)",
    backgroundBottomColor: "rgb(244,148,67)",
    time: 1800000
  },
  "5": {
    backgroundColor: "rgb(255,231,228)",
    backgroundPriceColor: "rgb(255,231,228)",
    backgroundBottomColor: "rgb(229,77,77)",
    time: 3600000
  },
  "6": {
    backgroundColor: "rgb(255,216,216)",
    backgroundPriceColor: "rgb(255,216,216)",
    backgroundBottomColor: "rgb(171,26,50)",
    time: 7200000
  }
};

export default {
  components: {
    SimilarCommentBadge
  },
  props: ["isPreview"],
  data() {
    return {
      giftHover: 0,
      DEFAULT_AVATAR
    };
  },
  computed: {
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
        "line-height": `${avatarSize}px`
      };
    },

    messages() {
      const messages = this.isPreview
        ? this.$store.state.Message.exampleMessages
        : this.$store.state.Message.messages;
      return messages
        .map(message => {
          return Object.assign({}, message, {
            priceProperties: this.parsePriceColor(message.totalPrice) || {}
          });
        })
        .reverse();
    },

    gifts() {
      const gifts = this.isPreview
        ? this.$store.state.Message.exampleGifts
        : this.$store.state.Message.gifts;
      return gifts
        .map(gift => {
          return Object.assign({}, gift, {
            priceProperties: this.parsePriceColor(gift.totalPrice) || {}
          });
        })
        .filter(gift => {
          return gift.sendAt + gift.priceProperties.time > new Date() - 0;
        });

      // TODO: 清理时间到达消失的GIFT
    },

    normal_message() {
      return this.$store.state.Config.normal_message;
    },
    normal_name() {
      return this.$store.state.Config.normal_name;
    },
    normal_comment() {
      return this.$store.state.Config.normal_comment;
    },

    captain_message() {
      return this.$store.state.Config.captain_message;
    },
    captain_name() {
      return this.$store.state.Config.captain_name;
    },
    captain_comment() {
      return this.$store.state.Config.captain_comment;
    },

    // 提督和总督暂时使用舰长配置
    admiral_message() {
      return this.$store.state.Config.captain_message;
    },
    admiral_name() {
      return this.$store.state.Config.captain_name;
    },
    admiral_comment() {
      return this.$store.state.Config.captain_comment;
    },

    governor_message() {
      return this.$store.state.Config.captain_message;
    },
    governor_name() {
      return this.$store.state.Config.captain_name;
    },
    governor_comment() {
      return this.$store.state.Config.captain_comment;
    }
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
      if (msgType === 1) {
        return "进入了";
      }
      if (msgType === 2) {
        return "关注了";
      }
      if (msgType === 3) {
        return "分享了";
      }
    },

    parsePriceColor(price) {
      if (price < 50) {
        return PRICE_COLOR["1"];
      }
      if (price >= 50 && price < 100) {
        return PRICE_COLOR["2"];
      }
      if (price >= 100 && price < 500) {
        return PRICE_COLOR["3"];
      }
      if (price >= 500 && price < 1000) {
      }
      if (price >= 1000 && price < 2000) {
      }
      if (price >= 2000) {
      }
    },
    hoverGift(giftId) {
      this.giftHover = giftId;
    },
    unhoverGift() {
      this.giftHover = 0;
    },
    widthCalculator(gift) {
      if (Number(gift.existsTime) && Number(gift.priceProperties.time)) {
        return Math.floor(
          (1 - gift.existsTime / gift.priceProperties.time) * 100
        );
      } else {
        return 100;
      }
    }
  }
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
  -webkit-app-region: no-drag;
}

.message-content-wrapper {
  height: calc(100% - 40px);
  /* height: 100%; */
  overflow: hidden;
  position: relative;
  -webkit-app-region: drag;
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
</style>
