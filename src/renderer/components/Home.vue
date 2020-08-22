<template>
  <div class="layout">
    <Layout :style="{minHeight: '100vh'}">
      <Sider collapsible :collapsed-width="78" v-model="isCollapsed">
        <Menu theme="dark" width="auto" :class="menuitemClasses">
          <MenuItem name="1-1" to="/setting">
            <Icon type="md-build" />
            <span v-if="!isCollapsed">设置</span>
          </MenuItem>
          <MenuItem name="1-2" to="/message">
            <Icon type="md-chatboxes" />
            <span v-if="!isCollapsed">消息</span>
          </MenuItem>
        </Menu>
      </Sider>
      <Layout>
        <Header class="layout-header">
          <div class="avatar-wrapper">
            <Avatar
              :icon="avatar? undefined : 'ios-person'"
              :src="avatar? avatar: undefined"
              size="large"
            />&nbsp;&nbsp;
            <span>{{ username? username: '未连接'}}</span>
            &nbsp;
            <Tag
              v-if="username"
              type="border"
              :color="liveStatus === 1? 'green': 'silver'"
            >{{liveStatus === 1 ? '直播中': '未开播'}}</Tag>
          </div>

          <div class="status-wrapper">
            <div class="bar">
              <Icon type="md-flame" />
              <span class="header-icon-text">人气值</span>
              {{ninkiNumber}}
            </div>
            <div>
              <Icon type="md-star" />
              <span class="header-icon-text">关注数</span>
              {{fansNumber}}
            </div>
            <div>
              <Icon type="md-heart" />
              <span class="header-icon-text">粉丝团</span>
              {{fansClubNumber}}
            </div>
          </div>
        </Header>
        <div class="layout-header2">
          <div>
            <span>连接直播间</span>
            <InputNumber
              v-model="roomId"
              placeholder="请输入房间号"
              size="small"
              :disabled="isConnected"
              style="width: 120px"
            />
            <i-switch v-model="isConnected" @on-change="connect" :disabled="!roomId" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>弹幕窗</span>
            <i-switch
              :value="isShowDanmakuWindow"
              :loading="isShowDanmakuWindowLoading"
              @on-change="showDanmakuWindow"
            ></i-switch>&nbsp;&nbsp;&nbsp;
            <template v-if="isShowDanmakuWindow">
              <span @click="alwaysOnTop">窗口置顶</span>
              <i-switch v-model="isAlwaysOnTop" @on-change="alwaysOnTop"></i-switch>
            </template>
          </div>
        </div>
        <Content class="layout-content">
          <div>
            <router-view></router-view>
          </div>
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<script>
import { remote } from "electron";
const { BrowserWindow, screen } = remote;
import emitter, {
  init,
  close,
  parseComment,
  parseInteractWord,
  parseGift,
} from "../../service/bilibili-live-ws";
import { getRoomInfoV2, getUserInfo } from "../../service/bilibili-api";
import Store from "electron-store";
import db from "../../service/nedb";
const { commentDB, interactDB, userDB, otherDB, giftDB } = db;
let isGetUserInfoLocked = false;

const GUARD_LEVEL_MAP = {
  "0": "normal",
  "1": "governor",
  "2": "admiral",
  "3": "captain",
};

// 1. 拉一次接口
// 2. 每次收到信息记录一下
const allGifts = [];

export default {
  data() {
    return {
      isCollapsed: true,
      roomId: 21908196,
      isConnected: false,
      isShowDanmakuWindow: false,
      isShowDanmakuWindowLoading: false,
      isAlwaysOnTop: false,

      username: "",
      avatar: null,
      ninkiNumber: 0,
      fansNumber: 0,
      fansClubNumber: 0,
      liveStatus: 0,
    };
  },
  created() {
    emitter.on("message", async (data) => {
      if (Array.isArray(data)) {
        const comments = data
          .filter((msg) => msg.cmd === "DANMU_MSG")
          .map(parseComment);

        for (const comment of comments) {
          console.log(`${comment.name}(${comment.uid}): ${comment.comment}`);

          if (this.isShowAvatar) {
            let user = {};
            try {
              // 缓存 user 信息
              user = await userDB.findOne({ uid: comment.uid });
              if (!user && !isGetUserInfoLocked) {
                // 限制获取头像频率 避免412被封
                isGetUserInfoLocked = true;
                setTimeout(() => {
                  isGetUserInfoLocked = false;
                }, 200);

                const { data } = await getUserInfo(comment.uid);
                // 统一格式化用户数据
                user = this.parseUser(data);
                data.createdAt = new Date();
                userDB.insert(user);
              } else {
                throw new Error("getUserInfo limit");
              }
            } catch (e) {}

            comment.avatar = (user || {}).avatar;
          }

          const data = await commentDB.insert(comment);
          await this.sendComment(data);
        }

        const interactWords = data
          .filter((msg) => msg.cmd === "INTERACT_WORD")
          .map(parseInteractWord);

        for (const interactWord of interactWords) {
          console.log(
            `${interactWord.uname}(${interactWord.uid}) 进入了直播间`
          );
          const data = await interactDB.insert(interactWord);
          if (this.isShowEnterInfo) {
            this.sendInteractWord(data);
          }
        }

        const gifts = data.map(parseGift).filter(Boolean);

        for (const gift of gifts) {
          // 缓存礼物信息
          if (!allGifts[gift.giftId]) {
            allGifts[gift.giftId] = {
              id: gift.giftId,
              name: gift.giftName,
              price: gift.price,
            };
          }
          if (!gift.avatar) {
            let user = {};
            try {
              // 缓存 user 信息
              user = await userDB.findOne({ uid: gift.uid });
              if (!user && !isGetUserInfoLocked) {
                // 限制获取头像频率 避免412被封
                isGetUserInfoLocked = true;
                setTimeout(() => {
                  isGetUserInfoLocked = false;
                }, 200);

                const { data } = await getUserInfo(gift.uid);
                // 统一格式化用户数据
                user = this.parseUser(data);
                data.createdAt = new Date();
                userDB.insert(user);
              } else {
                throw new Error("getUserInfo limit");
              }
            } catch (e) {}

            gift.avatar = (user || {}).avatar;
          }
          const data = await giftDB.insert(gift);
          if (gift.type === "superChat") {
            this.sendSuperChat(data);
          } else {
            if (!this.showSilverGift && gift.coinType === "silver") continue;
            // 对于 combo_send 事件补充一下price
            if (!gift.price && allGifts[gift.giftId]) {
              gift.price = allGifts[gift.giftId].price;
            }
            this.sendGift(data);
          }
        }

        data.forEach((msg) => {
          if (msg.cmd === "INTERACT_WORD") return;
          if (msg.cmd === "DANMU_MSG") return;
          console.log(msg);
          otherDB.insert(msg);
        });
      } else {
        if (data.cmd === "ROOM_REAL_TIME_MESSAGE_UPDATE") {
          const { fans, fans_club } = data.data;
          this.fansNumber = fans;
          this.fansClubNumber = fans_club;
        } else {
          console.log(data);
          otherDB.insert(data);
        }
      }
    });

    emitter.on("ninki", async (data) => {
      this.ninkiNumber = data.count;
    });
  },
  computed: {
    menuitemClasses: function () {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    },
    isShowAvatar() {
      return this.$store.state.Config.isShowAvatar;
    },
    isShowEnterInfo() {
      return this.$store.state.Config.isShowEnterInfo;
    },
    combineSimilarTime() {
      return this.$store.state.Config.combineSimilarTime;
    },
    messages() {
      return this.$store.state.Message.messages;
    },
    showGiftThreshold() {
      return this.$store.state.Config.showGiftThreshold;
    },
    showSilverGift() {
      return this.$store.state.Config.showSilverGift;
    },
  },
  methods: {
    async connect(status) {
      if (status && this.roomId) {
        const { data } = await getRoomInfoV2(this.roomId);
        console.log(data);

        const {
          uid,
          room_id: roomId,
          title,
          cover,
          tags,
          background,
          description,
          live_status: liveStatus,
          live_start_time, // 直播开始时间 unixtime
          online,
        } = data.room_info;

        await init({ roomId: Number(roomId), uid: 0 });
        this.isConnected = status;

        const { uname, face, gender } = data.anchor_info.base_info;
        const { level, level_color } = data.anchor_info.live_info;
        const { attention } = data.anchor_info.relation_info;
        const { medal_name, medal_id, fansclub } = data.anchor_info.medal_info;
        this.username = uname;
        this.avatar = face;
        this.ninkiNumber = online;
        this.fansNumber = attention;
        this.fansClubNumber = fansclub;
        this.liveStatus = liveStatus;
      } else {
        close();
        this.username = "";
        this.avatar = null;
        this.ninkiNumber = 0;
        this.fansNumber = 0;
        this.fansClubNumber = 0;
        this.liveStatus = 0;
      }
    },
    showDanmakuWindow(status) {
      // const { x, y } = screen.getCursorScreenPoint();
      this.isShowDanmakuWindowLoading = true;

      if (status) {
        this.win = new BrowserWindow({
          width: 320,
          height: 350,
          // x, y,
          x: 0,
          y: 0,
          frame: false,
          transparent: true,
          hasShadow: false,
          webPreferences: {
            nodeIntegration: true,
          },
        });

        const winURL =
          process.env.NODE_ENV === "development"
            ? `http://localhost:9080/#/danmaku-window`
            : `file://${__dirname}/index.html/#/danmaku-window`;
        this.win.loadURL(winURL);
        this.win.on("close", (e) => {
          this.isShowDanmakuWindow = false;
          this.isShowDanmakuWindowLoading = false;
        });
        // 初始化时清空弹幕池
        this.$store.dispatch("CLEAR_MESSAGE");
        this.isShowDanmakuWindow = true;
        this.isShowDanmakuWindowLoading = false;
      } else {
        if (!this.win) return;
        this.win.close();
        this.win = null;
      }
    },

    alwaysOnTop(status) {
      this.win.setFocusable(!status);
      this.win.setAlwaysOnTop(status);
      this.win.setIgnoreMouseEvents(status);
    },
    sendComment(payload) {
      if (this.combineSimilarTime) {
        const messages = [...this.messages].reverse();
        let update;
        for (const message of messages) {
          const timePoint = payload.sendAt - this.combineSimilarTime;
          // 如果已扫描到超过设定时间点之前的弹幕，直接跳出
          if (message.sendAt < timePoint) {
            break;
          }
          if (
            message.sendAt > timePoint &&
            message.comment === payload.comment
          ) {
            update = message;
            break;
          }
        }
        if (update) {
          this.$store.dispatch("UPDATE_MESSAGE_SIMILAR", {
            id: update.id,
          });
          return;
        }
      }
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "comment",
        uid: payload.uid,
        name: payload.name,
        comment: payload.comment,
        sendAt: payload.sendAt,
        isAdmin: payload.isAdmin,
        avatar: payload.avatar
          ? `${payload.avatar}@48w_48h`
          : "https://static.hdslb.com/images/member/noface.gif",
        medalLevel: payload.medalLevel,
        medalName: payload.medalName,
        role: GUARD_LEVEL_MAP[payload.guard],
      });
    },
    sendInteractWord(payload) {
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "interactWord",
        uid: payload.uid,
        identities: payload.identities,
        name: payload.uname,
        color: payload.unameColor,
        sendAt: payload.timestamp,
        msgType: payload.msgType,
      });
    },
    sendSuperChat(payload) {
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "superChat",

        uid: payload.uid,
        name: payload.name,
        avatar: payload.avatar
          ? `${payload.avatar}@48w_48h`
          : "https://static.hdslb.com/images/member/noface.gif",

        price: payload.price,

        comment: payload.comment,
        time: payload.time,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
    },
    sendGift(payload) {
      const messages = [...this.messages].reverse();
      const gift = messages.find(message => message.batchComboId === payload.batchComboId)

      if (gift) {
        this.$store.dispatch("UPDATE_GIFT_TOTAL_PRICE", {
          id: gift.id,
          giftNumber: payload.giftNumber,
        });
        return;
      }
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "gift",
        uid: payload.uid,
        name: payload.name,
        batchComboId: payload.batchComboId,
        avatar: payload.avatar
          ? `${payload.avatar}@48w_48h`
          : "https://static.hdslb.com/images/member/noface.gif",

        price: payload.price,
        giftNumber: payload.giftNumber,
        giftName: payload.giftName,
      });
    },

    parseUser(data) {
      return {
        uid: data.mid,
        name: data.name,
        avatar: data.face,
        sex: data.sex,
        level: data.level,
      };
    },
  },
};
</script>

<style scoped>
.avatar-wrapper {
  display: inline-block;
  vertical-align: top;
}
.header-icon-text {
  font-size: 12px;
}
.status-wrapper {
  display: inline-block;
  line-height: 21px;
  padding-left: 40px;
}
.layout-header {
  background: white;
}
.layout-header2 {
  height: 48px;
  line-height: 48px;
  padding: 0 50px;
}
.layout-content {
  height: 100%;
  width: 100%;
  background: white;
}
.menu-item span {
  display: inline-block;
  overflow: hidden;
  width: 69px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  transition: width 0.2s ease 0.2s;
}
.menu-item i {
  transform: translateX(0px);
  transition: font-size 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
  font-size: 16px;
}
.collapsed-menu span {
  width: 0px;
  transition: width 0.2s ease;
}
.collapsed-menu i {
  transform: translateX(5px);
  transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
  vertical-align: middle;
  font-size: 22px;
}
</style>
