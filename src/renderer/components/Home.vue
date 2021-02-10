<template>
  <div class="layout">
    <Layout :style="{ minHeight: '100vh' }">
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
          <MenuItem name="1-3" to="/vote">
            <Icon type="md-pie" />
            <span v-if="!isCollapsed">投票</span>
          </MenuItem>
          <MenuItem name="1-4" to="/statistic">
            <Icon type="md-stats" />
            <span v-if="!isCollapsed">统计</span>
          </MenuItem>
          <MenuItem name="1-5" to="/live">
            <Icon type="md-play" />
            <span v-if="!isCollapsed">直播</span>
          </MenuItem>
          <!-- <MenuItem name="1-5" to="/lottery">
            <Icon type="md-bonfire" />
            <span v-if="!isCollapsed">祈愿</span>
          </MenuItem> -->
        </Menu>
      </Sider>
      <Layout>
        <div class="layout-header">
          <div class="avatar-wrapper">
            <Avatar
              :icon="avatar ? undefined : 'ios-person'"
              :src="avatar ? avatar : undefined"
              size="large"
            />&nbsp;&nbsp;
            <span>{{ username ? username : "未连接" }}</span>
            &nbsp;
            <Tag
              v-if="username"
              type="border"
              :color="liveStatus === 1 ? 'green' : 'silver'"
              >{{ liveStatus === 1 ? "直播中" : "未开播" }}</Tag
            >
          </div>

          <div class="status-wrapper">
            <div class="bar">
              <Icon type="md-flame" />
              <span class="header-icon-text">人气值</span>
              {{ ninkiNumber }}
            </div>
            <div>
              <Icon type="md-star" />
              <span class="header-icon-text">关注数</span>
              {{ fansNumber }}
            </div>
            <div>
              <Icon type="md-heart" />
              <span class="header-icon-text">粉丝团</span>
              {{ fansClubNumber }}
            </div>
          </div>
          <div class="status-wrapper">
            <div class="bar">
              <Tooltip content="舰队">
                <Icon type="md-cog" />
              </Tooltip>
              <span class="header-icon-text"></span>
              {{ guardNumber }}
            </div>
            <div class="bar">
              <Tooltip content="十分钟内互动人数">
                <Icon type="md-person" />
              </Tooltip>
              <span class="header-icon-text"></span>
              {{ peopleNumber }}
            </div>
          </div>
          <!-- <div> -->

          <!-- </div> -->
          <div class="updater-wrapper" v-if="hasNewVersion">
            <template v-if="!appUpdating">
              <Button shape="circle" type="dashed" @click="updateApp">
                <Icon type="md-arrow-round-up" color="green" />
                <span :style="{ color: 'green' }">更新</span>
              </Button>
            </template>
            <template v-else>
              <i-circle :percent="percent" :size="60" :style="{ top: '2px' }">
                <span class="demo-Circle-inner" style="font-size: 12px"
                  >{{ downloadRate }}</span
                >
              </i-circle>
            </template>
          </div>
        </div>
        <div class="layout-header2">
          <div>
            <span>连接直播间</span>
            <InputNumber
              :value="roomId"
              @on-change="changeRoomId"
              placeholder="请输入房间号"
              size="small"
              :disabled="isConnected"
              style="width: 120px"
            />
            <i-switch
              :value="isConnected"
              :loading="isConnecting"
              @on-change="connect"
              :disabled="!roomId"
            />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>弹幕窗</span>
            <i-switch
              :value="isShowDanmakuWindow"
              :loading="isShowDanmakuWindowLoading"
              @on-change="showDanmakuWindow"
            ></i-switch
            >&nbsp;&nbsp;&nbsp;
            <template v-if="isShowDanmakuWindow">
              <span @click="alwaysOnTop">窗口置顶</span>
              <i-switch
                v-model="isAlwaysOnTop"
                @on-change="alwaysOnTop"
              ></i-switch>
            </template>
          </div>
        </div>
        <div class="layout-content">
          <router-view :style="{ height: '100%' }"></router-view>
        </div>
      </Layout>
    </Layout>
  </div>
</template>

<script>
import { uniq, debounce } from "lodash";
import { remote, ipcRenderer } from "electron";
const { BrowserWindow } = remote;

import { getUserInfoThrottle, parseDownloadRate } from "../../service/util";
import emitter, {
  init,
  close,
  getIsWsConnected,
  parseComment,
  parseInteractWord,
  parseGift,
} from "../../service/bilibili-live-ws";
import { getRoomInfoV2, getGuardInfo } from "../../service/bilibili-api";
import {
  commentDB,
  interactDB,
  userDB,
  otherDB,
  giftDB,
} from "../../service/nedb";
import {
  DEFAULT_AVATAR,
  IPC_CHECK_FOR_UPDATE,
  IPC_UPDATE_AVAILABLE,
  IPC_DOWNLOAD_UPDATE,
  IPC_DOWNLOAD_PROGRESS,
  IPC_UPDATE_DOWNLOADED,
} from "../../service/const";

export default {
  data() {
    return {
      isCollapsed: true,
      isShowDanmakuWindow: false,
      isShowDanmakuWindowLoading: false,
      isAlwaysOnTop: false,
      giftTimer: null,
      peopleTimer: null,
      isConnecting: false,
      hasNewVersion: false,
      appUpdating: false,
      downloadRate: '0 KB/s',
      percent: 0,

      username: "",
      avatar: null,
      ninkiNumber: 0,
      fansNumber: 0,
      fansClubNumber: 0,
      liveStatus: 0,
      peopleNumber: 0,
      // guardNumber: 0,
    };
  },
  created() {
    this.initial();

    emitter.on("message", this.onMessage);

    emitter.on("ninki", async (data) => {
      this.ninkiNumber = data.count;
    });

    const listenerCount = emitter.listenerCount("message");
    console.log(`listenerCount: ${listenerCount}`);
  },
  computed: {
    roomId() {
      return this.$store.state.Config.roomId;
    },
    menuitemClasses: function () {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    },
    messages() {
      return this.$store.state.Message.messages;
    },
    isConnected() {
      return this.$store.state.Config.isConnected;
    },
    isShowAvatar() {
      return this.$store.state.Config.isShowAvatar;
    },
    isShowInteractInfo() {
      return this.$store.state.Config.isShowInteractInfo;
    },
    combineSimilarTime() {
      return this.$store.state.Config.combineSimilarTime;
    },
    showGiftThreshold() {
      return this.$store.state.Config.showGiftThreshold;
    },
    isShowSilverGift() {
      return this.$store.state.Config.isShowSilverGift;
    },
    guardNumber() {
      return this.$store.state.Config.guardNumber;
    },
    windowWidth() {
      return this.$store.state.Config.windowWidth;
    },
    windowHeight() {
      return this.$store.state.Config.windowHeight;
    },
    windowX() {
      return this.$store.state.Config.windowX;
    },
    windowY() {
      return this.$store.state.Config.windowY;
    },
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
  },
  methods: {
    async connect(status) {
      this.isConnecting = true;
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

        const { uname, face, gender } = data.anchor_info.base_info;
        const { level, level_color } = data.anchor_info.live_info;
        const { attention } = data.anchor_info.relation_info;
        const { medal_name, medal_id, fansclub } =
          data.anchor_info.medal_info || {};
        this.username = uname;
        this.avatar = face;
        this.ninkiNumber = online;
        this.fansNumber = attention;
        this.fansClubNumber = fansclub || 0;
        this.liveStatus = liveStatus;

        const guardInfo = await getGuardInfo(roomId, uid);
        // this.guardNumber = guardInfo.data.info.num;
        this.$store.dispatch("UPDATE_CONFIG", {
          isConnected: status,
          guardNumber: guardInfo.data.info.num,
          realRoomId: roomId,
          ruid: uid,
        });
      } else {
        close();
        this.initial();
      }
      this.isConnecting = false;
    },
    showDanmakuWindow(status) {
      // const { x, y } = screen.getCursorScreenPoint();
      this.isShowDanmakuWindowLoading = true;

      if (status) {
        this.win = new BrowserWindow({
          width: this.windowWidth || 320,
          height: this.windowHeight || 350,
          // x, y,
          x: this.windowX || 0,
          y: this.windowY || 0,
          frame: false,
          transparent: true,
          hasShadow: false,
          webPreferences: {
            nodeIntegration: true,
          },
          resizable: true,
        });

        const winURL =
          process.env.NODE_ENV === "development"
            ? `http://localhost:9080/#/danmaku-window`
            : `file://${__dirname}/index.html#danmaku-window`;
        this.win.loadURL(winURL);
        this.win.on("close", (e) => {
          this.isShowDanmakuWindow = false;
          this.isShowDanmakuWindowLoading = false;
        });
        this.win.on(
          "resize",
          debounce(() => {
            const [width, height] = this.win.getSize();
            this.$store.dispatch("UPDATE_CONFIG", {
              windowWidth: width,
              windowHeight: height,
            });
          }, 200)
        );
        this.win.on(
          "move",
          debounce(() => {
            const [x, y] = this.win.getPosition();
            this.$store.dispatch("UPDATE_CONFIG", {
              windowX: x,
              windowY: y,
            });
          }, 200)
        );
        // this.win.on('always-on-top-changed', (e, isAlwaysOnTop) => {

        // })
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

    initial() {
      this.username = "";
      this.avatar = null;
      this.ninkiNumber = 0;
      this.fansNumber = 0;
      this.fansClubNumber = 0;
      this.liveStatus = 0;
      this.peopleNumber = 0;

      const payload = {
        guardNumber: 0,
      };
      Object.assign(payload, {
        isConnected: getIsWsConnected(),
      });
      this.$store.dispatch("UPDATE_CONFIG", payload);
    },
    alwaysOnTop(status) {
      this.win.setFocusable(!status);
      this.win.setAlwaysOnTop(status);
      this.win.setIgnoreMouseEvents(status, { forward: true });
      this.$store.dispatch("UPDATE_CONFIG", {
        isAlwaysOnTop: status,
      });
    },
    sendComment(payload) {
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "comment",
        uid: payload.uid,
        name: payload.name,
        comment: payload.comment,
        sendAt: payload.sendAt,
        isAdmin: payload.isAdmin,
        avatar: payload.avatar ? `${payload.avatar}@48w_48h` : DEFAULT_AVATAR,
        role: payload.guard,

        medalLevel: payload.medalLevel,
        medalName: payload.medalName,
        medalColorBorder: payload.medalColorBorder,
        medalColorStart: payload.medalColorStart,
        medalColorEnd: payload.medalColorEnd,
      });
    },
    sendInteractWord(payload) {
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "interactWord",
        uid: payload.uid,
        identities: payload.identities,
        name: payload.name,
        color: payload.nameColor,
        sendAt: payload.timestamp,
        msgType: payload.msgType,

        medalLevel: payload.medalLevel,
        medalName: payload.medalName,
        medalColorBorder: payload.medalColorBorder,
        medalColorStart: payload.medalColorStart,
        medalColorEnd: payload.medalColorEnd,
      });
    },
    sendSuperChat(payload) {
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "superChat",

        uid: payload.uid,
        name: payload.name,
        avatar: payload.avatar ? `${payload.avatar}@48w_48h` : DEFAULT_AVATAR,

        price: payload.price,

        commentJPN: payload.commentJPN,
        comment: payload.comment,
        sendAt: new Date() - 0,

        superChatId: Number(payload.superChatId),
        time: payload.time,
        startTime: payload.startTime,
        endTime: payload.endTime,
      });
    },
    sendGift(payload) {
      this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        type: "gift",
        uid: payload.uid,
        name: payload.name,
        batchComboId: payload.batchComboId,
        avatar: payload.avatar ? `${payload.avatar}@48w_48h` : DEFAULT_AVATAR,

        price: payload.price,
        sendAt: new Date() - 0,
        giftNumber: payload.giftNumber,
        giftName: payload.giftName,
        isGuardGift: payload.isGuardGift,
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

    changeRoomId(roomId) {
      this.$store.dispatch("UPDATE_CONFIG", {
        roomId: roomId,
      });
    },

    onMessage: async function (data) {
      if (Array.isArray(data)) {
        // console.log(data);
        const comments = data
          .filter((msg) => msg.cmd === "DANMU_MSG")
          .map(parseComment);

        for (const comment of comments) {
          // console.log(`${comment.name}(${comment.uid}): ${comment.comment}`);

          if (this.isShowAvatar) {
            // 缓存 user 信息
            let user = await userDB.findOne({ uid: comment.uid });
            if (!user) {
              try {
                const data = await getUserInfoThrottle(comment.uid);
                // 统一格式化用户数据
                user = this.parseUser(data);
                data.createdAt = new Date();
                userDB.insert(user);
              } catch (e) {
                // throw new Error("getUserInfo limit");
              }
            }

            comment.avatar = (user || {}).avatar;
          }

          const data = await commentDB.insert(comment);
          await this.sendComment(data);
        }

        const interactWords = data
          .filter((msg) => msg.cmd === "INTERACT_WORD")
          .map(parseInteractWord);

        for (const interactWord of interactWords) {
          // console.log(`${interactWord.name}(${interactWord.uid}) 进入了直播间`);
          const data = await interactDB.insert(interactWord);
          if (this.isShowInteractInfo) {
            this.sendInteractWord(data);
          }
        }

        const gifts = data.map(parseGift).filter(Boolean);

        for (const gift of gifts) {
          if (!gift.avatar) {
            // 缓存 user 信息
            let user = await userDB.findOne({ uid: gift.uid });
            if (!user) {
              try {
                const data = await getUserInfoThrottle(gift.uid);
                // 统一格式化用户数据
                user = this.parseUser(data);
                data.createdAt = new Date();
                userDB.insert(user);
              } catch (e) {
                // TODO 全局 errorHandler
                // throw new Error("getUserInfo limit");
              }
            }

            gift.avatar = (user || {}).avatar;
          }

          if (gift.type === "superChat") {
            let data = await giftDB.findOne({
              roomId: this.roomId,
              superChatId: gift.superChatId,
            });

            // 如果找到已存在sc 并且 新sc有JPN信息，需要更新
            if (data) {
              if (gift.commentJPN) {
                data = await giftDB.update(
                  { _id: data._id },
                  {
                    $set: { commentJPN: gift.commentJPN },
                  },
                  { returnUpdatedDocs: true }
                );
              } else {
                // 如果新收到的gift不包含JPN信息，表示原数据齐全，直接continue
                continue;
              }
            } else {
              data = await giftDB.insert(gift);
            }

            this.sendSuperChat(data);
          } else if (gift.type === "gift") {
            let data;
            if (gift.batchComboId) {
              const comboGift = await giftDB.findOne({
                roomId: this.roomId,
                batchComboId: gift.batchComboId,
              });
              if (comboGift) {
                data = await giftDB.update(
                  { _id: comboGift._id },
                  {
                    $set: {
                      giftNumber: comboGift.giftNumber + gift.giftNumber,
                    },
                  },
                  { returnUpdatedDocs: true }
                );
              }
            }
            if (!data) {
              data = await giftDB.insert(gift);
            }
            if (!this.isShowSilverGift && gift.coinType === "silver") continue;
            if (gift.coinType === "silver") gift.price = 0;
            this.sendGift(data);
          }
        }

        data.forEach((msg) => {
          if (msg.cmd === "INTERACT_WORD") return;
          if (msg.cmd === "DANMU_MSG") return;
          if (msg.cmd === "SEND_GIFT") return;
          otherDB.insert(msg);
        });
      } else {
        if (data.cmd === "ROOM_REAL_TIME_MESSAGE_UPDATE") {
          const { fans, fans_club } = data.data;
          this.fansNumber = fans;
          this.fansClubNumber = fans_club;
        } else {
          // console.log(data);
          otherDB.insert(data);
        }
      }
    },

    async updateApp() {
      ipcRenderer.send(IPC_DOWNLOAD_UPDATE);
      this.appUpdating = true;
      ipcRenderer.on(IPC_DOWNLOAD_PROGRESS, (event, args) => {
        // bytesPerSecond: 63694
        // delta: 82001
        // percent: 17.95023024398921
        // total: 59005232
        // transferred: 10591575
        const {
          bytesPerSecond,
          delta,
          percent,
          total,
          transferred,
        } = args.progress;
        this.downloadRate = parseDownloadRate(bytesPerSecond);
        this.percent = Number(percent).toFixed(0)
      });

      // 更新会退出应用，不监听也可以
      ipcRenderer.once(IPC_UPDATE_DOWNLOADED, () => {
        ipcRenderer.removeAllListeners(IPC_DOWNLOAD_PROGRESS);
        this.appUpdating = false;
      });
    },
  },
  async mounted() {
    ipcRenderer.once(IPC_UPDATE_AVAILABLE, () => {
      this.hasNewVersion = true;
    });
    ipcRenderer.send(IPC_CHECK_FOR_UPDATE);
    this.giftTimer = setInterval(() => {
      // console.log("giftTimer");
      this.$store.dispatch("GIFT_TIMER");
    }, 1000);

    this.peopleTimer = setInterval(async () => {
      // console.log("peopleTimer");
      if (!this.realRoomId && !this.isConnected) return;
      const tenMinutesAgo = new Date() - 1000 * 60 * 10;
      const [comments, gifts, interacts] = await Promise.all([
        commentDB.find(
          { roomId: this.realRoomId, sendAt: { $gte: tenMinutesAgo } },
          { projection: { uid: 1 } }
        ),
        giftDB.find(
          { roomId: this.realRoomId, sendAt: { $gte: tenMinutesAgo } },
          { projection: { uid: 1 } }
        ),
        interactDB.find(
          { roomId: this.realRoomId, sendAt: { $gte: tenMinutesAgo } },
          { projection: { uid: 1 } }
        ),
      ]);
      this.peopleNumber = uniq(
        [...comments, ...gifts, ...interacts].map((i) => i.uid)
      ).length;
    }, 10000);
  },
  beforeDestroy() {
    emitter.removeListener("message", this.onMessage);

    if (this.giftTimer) {
      clearInterval(this.giftTimer);
    }
    if (this.peopleTimer) {
      clearInterval(this.peopleTimer);
    }
  },
};
</script>

<style scoped>
.avatar-wrapper {
  display: inline-block;
  vertical-align: top;
  padding-left: 50px;
}
.header-icon-text {
  font-size: 12px;
}
.status-wrapper {
  vertical-align: top;
  display: inline-block;
  line-height: 21px;
  padding-left: 40px;
  height: 64px;
}
.updater-wrapper {
  height: 64px;
  position: absolute;
  top: 0px;
  right: 10px;
}
.layout-header {
  height: 64px;
  line-height: 64px;
  background: white;
  position: relative;
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
/* .ivu-btn-dashed {
  border-color: green;
} */
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
