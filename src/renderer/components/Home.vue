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
          </div>

          <div class="status-wrapper">
            <div class="bar">
              <Icon type="md-flame" />
              {{ninkiNumber}}
            </div>
            <div>
              <Icon type="md-star" />
              {{fansNumber}}
            </div>
            <div>
              <Icon type="md-heart" />
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
            <i-switch v-model="isShowDanmakuWindow" @on-change="showDanmakuWindow"></i-switch>&nbsp;&nbsp;&nbsp;
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
} from "../../service/bilibili-live-ws";
import { getRoomInfo, getUserInfo } from "../../service/bilibili-api";
import Store from "electron-store";
import db from "../../service/nedb";
const { commentDB, interactDB, userDB, otherDB } = db;

const GUARD_LEVEL_MAP = {
  "0": "normal",
  "1": "governor",
  "2": "admiral",
  "3": "captain",
};

export default {
  data() {
    return {
      isCollapsed: true,
      roomId: 14917277,
      isConnected: false,
      isShowDanmakuWindow: false,
      isAlwaysOnTop: false,

      username: "",
      avatar: null,
      ninkiNumber: 0,
      fansNumber: 0,
      fansClubNumber: 0,
    };
  },
  created() {
    emitter.on("message", async (data) => {
      if (Array.isArray(data)) {
        const comments = data
          .filter((msg) => msg.cmd === "DANMU_MSG")
          .map(parseComment);
        await Promise.all(
          comments.map(async (comment) => {
            console.log(`${comment.name}(${comment.uid}): ${comment.comment}`);


            if (this.isShowAvatar) {
              // 缓存 user 信息
              let user = await userDB.findOne({ uid: comment.uid }).catch(e=> console.log(e))
              if (!user) {
                // TODO 限制获取头像频率 避免412被封
                const { data } = await getUserInfo(comment.uid);
                // 统一格式化用户数据
                user = this.parseUser(data);
                data.createdAt = new Date();
                userDB.insert(user);
              }
              comment.avatar = user.avatar;
            }

            const data = await commentDB.insert(comment);
            await this.sendDanmaku(data);
          })
        );

        const interactWords = data
          .filter((msg) => msg.cmd === "INTERACT_WORD")
          .map(parseInteractWord);
        await Promise.all(
          interactWords.map(async (interactWord) => {
            console.log(
              `${interactWord.uname}(${interactWord.uid}) 进入了直播间`
            );
            await interactDB.insert(interactWord);
          })
        );

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
  },
  methods: {
    async connect(status) {
      if (status && this.roomId) {
        await init({ roomId: Number(this.roomId), uid: 0 });
        this.isConnected = status;
        const { data } = await getRoomInfo(this.roomId);
        console.log(data);
        const {
          uid,
          room_id: roomId,
          title,
          cover,
          tags,
          background,
          description,
          live_status,
          live_start_time,
          online,
        } = data.room_info;
        const { uname, face, gender } = data.anchor_info.base_info;
        const { level, level_color } = data.anchor_info.live_info;
        const { attention } = data.anchor_info.relation_info;
        const { medal_name, medal_id, fansclub } = data.anchor_info.medal_info;
        this.username = uname;
        this.avatar = face;
        this.ninkiNumber = 1;
        this.fansNumber = attention;
        this.fansClubNumber = fansclub;
      } else {
        close();
        this.username = "";
        this.avatar = null;
        this.ninkiNumber = 0;
        this.fansNumber = 0;
        this.fansClubNumber = 0;
      }
    },
    showDanmakuWindow(status) {
      const { x, y } = screen.getCursorScreenPoint();

      if (status) {
        if (!this.win) {
          this.win = new BrowserWindow({
            width: 320,
            height: 320,
            // x, y,
            x: 0,
            y: 0,
            frame: false,
            transparent: true,
            webPreferences: {
              nodeIntegration: true,
            },
          });

          const winURL =
            process.env.NODE_ENV === "development"
              ? `http://localhost:9080/#/danmaku-window`
              : `file://${__dirname}/index.html/#/danmaku-window`;
          this.win.loadURL(winURL);
        } else {
          this.win.showInactive();
        }
      } else {
        // this.win.hide();
        this.win.close();
        this.win = null;
      }
    },
    alwaysOnTop(status) {
      this.win.setFocusable(!status);
      this.win.setAlwaysOnTop(status);
      this.win.setIgnoreMouseEvents(status);
    },
    async sendDanmaku(payload) {
      await this.$store.dispatch("ADD_MESSAGE", {
        id: payload._id,
        uid: payload.uid,
        name: payload.name,
        comment: payload.comment,
        sendAt: payload.sendAt,
        isAdmin: payload.isAdmin,
        avatar: `${payload.avatar}@48w_48h`,
        medalLevel: payload.medalLevel,
        medalName: payload.medalName,
        role: GUARD_LEVEL_MAP[payload.guard],
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
