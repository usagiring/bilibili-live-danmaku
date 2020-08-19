<template>
  <div :style="{height: '100%'}">
    <div class="super-chat-content-wrapper">
      <template v-for="gift in gifts">
        <div
          :key="gift.id"
          @mouseenter="hoverGift(gift.id)"
          @mouseleave="unhoverGift()"
          :class="gift.id === giftHover? 'super-chat-in-top-extend' : 'super-chat-in-top'"
          :style="{background: parsePriceColor(gift.price).backgroundPriceColor}"
        >
          <div :style="{margin: '0 10px'}">
            <Avatar class="super-chat-avatar" :src="DEFAULT_AVATAR" size="small" />
            <span class="super-chat-text">{{`￥${gift.price}`}}</span>
          </div>
          <div
            v-if="gift.id === giftHover"
            class="super-chat-text-extend"
          >sssssssssssssssssssssssssssssssssss</div>
        </div>
      </template>
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
              <span class="comment-similar-badge" v-if="message.similar > 0">{{message.similar}}</span>
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
                  <Avatar class="super-chat-avatar" :src="message.avatar" size="large" />
                </div>
                <div :style="{display: 'inline-block'}">
                  <p class="super-chat-text">{{message.name}}</p>
                  <p class="super-chat-text">{{`￥${message.price}`}}</p>
                </div>
              </div>
              <div
                :style="{background: `${parsePriceColor(message.price).backgroundBottomColor}`}"
                class="message-super-chat-content message-super-chat-content-bottom"
              >{{message.comment}}</div>
            </div>
          </template>
          <template v-if="message.type==='gift'">
            <div
              :style="{border: `solid 1px ${parsePriceColor(message.price).backgroundBottomColor}`}"
              class="message-super-chat"
            >
              <div
                :style="{background: `${parsePriceColor(message.price).backgroundColor}`}"
                class="message-super-chat-content message-super-chat-content-header"
              >
                <div :style="{display: 'inline-block', 'vertical-align':'top'}">
                  <Avatar class="super-chat-avatar" :src="message.avatar" size="large" />
                </div>
                <div :style="{display: 'inline-block'}">
                  <p class="super-chat-text">{{message.name}}</p>
                  <p class="super-chat-text">{{`￥${message.price}`}}</p>
                </div>
              </div>
              <div
                :style="{background: `${parsePriceColor(message.price).backgroundBottomColor}`}"
                class="message-super-chat-content message-super-chat-content-bottom"
              >{{`${message.name} 赠送了 ${message.giftNumber} 个 ${message.giftName}`}}</div>
            </div>
          </template>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
const PRICE_COLOR = {
  "1": {
    backgroundColor: "#EDF5FF",
    backgroundPriceColor: "#7497CD",
    backgroundBottomColor: "#2A60B2",
  },
  "2": {
    backgroundColor: "#DBFFFD",
    backgroundPriceColor: "#7DA4BD",
    backgroundBottomColor: "#427D9E",
  },
  "3": {
    backgroundColor: "#FFF1C5",
    backgroundPriceColor: "gold",
    backgroundBottomColor: "#E2B52B",
  },
};

import { DEFAULT_AVATAR } from "../../service/const";

export default {
  props: ["isPreview"],
  data() {
    return {
      superChats: [
        {
          uid: "12346",
          name: "sc",
          type: "super-chat",
          number: 100,
          unit: "RMB",
          comment: "!!!!!!!!!!!!!!!",
          role: "normal",
        },
      ],
      // giftHover: 6, // FOR TEST
      giftHover: 0,
      DEFAULT_AVATAR,
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
        "line-height": `${avatarSize}px`,
      };
    },

    messages() {
      if (this.isPreview) {
        return this.$store.state.Message.exampleMessages;
      } else {
        return this.$store.state.Message.messages;
      }
    },

    gifts() {
      // if (this.isPreview) {
        return this.$store.state.Message.exampleGifts;
      // } else {
      //   return this.$store.state.Message.gifts;
      // }
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
    },
  },
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
.super-chat-content-wrapper {
  height: 40px;
  line-height: 32px;
  position: relative;
  z-index: 999;
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
}
.super-chat-avatar {
  /* transform: translate(0%, -5%); */
}
.super-chat-in-top {
  display: inline-block;
  border-radius: 20px;
  height: 32px;
  /* padding: 0px 10px; */
  font-size: 18px;
  vertical-align: top;
}

.super-chat-in-top-extend {
  display: inline-block;
  height: 32px;
  font-size: 18px;
  vertical-align: top;

  width: 200px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
/* .super-chat-in-top:hover {
  display: inline-block;
  border-radius: 20px;
  font-size: 18px;
  padding: 0px 10px;

  width: 150px;
  height: 100px;
} */
.super-chat-text-extend {
  padding: 0px 10px;
  width: 100%;
  background: gold;
  overflow-wrap: break-word;
  position: relative;
  font-size: 14px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.message-super-chat {
  border-radius: 10px;
  border: solid 1px rgba(66, 125, 158, 1);
  margin: 5px;
}
.message-super-chat-content {
  padding: 10px;
}
.message-super-chat-content-header {
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.message-super-chat-content-bottom {
  border-bottom-right-radius: 10px;
  border-bottom-left-radius: 10px;
  color: white;
}
.comment-similar-badge {
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  line-height: 18px;
  font-size: 12px;
  background: orange;
  color: white;
  padding-right: 1px;
}
</style>
