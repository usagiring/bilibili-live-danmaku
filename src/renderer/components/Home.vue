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
          <div>
            <span class="setting-key-text">连接直播间</span>
            <InputNumber
              v-model="roomId"
              placeholder="请输入房间号"
              size="small"
              :disabled="isConnected"
              style="width: 150px"
            />
            <i-switch v-model="isConnected" @on-change="connect" :disabled="!roomId" />
            <span class="setting-key-text">弹幕窗</span>
            <i-switch v-model="isShowDanmakuWindow" @on-change="showDanmakuWindow"></i-switch>
            <span @click="alwaysOnTop">窗口置顶</span>
            <i-switch v-model="isAlwaysOnTop" @on-change="alwaysOnTop"></i-switch>
          </div>
        </Header>

        <Content class="layout-content">
          <!-- <Breadcrumb :style="{margin: '16px 0'}">
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbItem>Components</BreadcrumbItem>
            <BreadcrumbItem>Layout</BreadcrumbItem>
          </Breadcrumb>-->
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
} from "../../service/bilibili-live-ws";
import { getRoomInfo } from "../../service/bilibili-api";
import Store from "electron-store";
import nedb from "../../service/nedb";

emitter.on("message", async (data) => {
  const msgs = data.map(parseComment).filter(Boolean);
  await Promise.all(
    msgs.map(async (msg) => {
      console.log(`${msg.name}(${msg.uid}): ${msg.comment}`);
      await nedb.insert(msg);
    })
  );
});

export default {
  data() {
    return {
      isCollapsed: true,
      roomId: null,
      isConnected: false,
      isShowDanmakuWindow: false,
      isAlwaysOnTop: false,
    };
  },
  computed: {
    menuitemClasses: function () {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    },
  },
  methods: {
    async connect(status) {
      if (status && this.roomId) {
        await init({ roomId: Number(this.roomId) });
        this.isConnected = status;
        const { roomData } = await getRoomInfo(this.roomId);
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
        } = roomData.room_info;
        const { uname, face, gender } = roomData.anchor_info.base_info;
        const { level, level_color } = roomData.anchor_info.live_info;
        const { attention } = roomData.anchor_info.relation_info;
        const {
          medal_name,
          medal_id,
          fansclub,
        } = roomData.anchor_info.medal_info;
      } else {
        close();
      }
    },
    showDanmakuWindow(status) {
      const { x, y } = screen.getCursorScreenPoint();

      if (status) {
        if (!this.win) {
          this.win = new BrowserWindow({
            width: 320,
            height: 320,
            x,
            y,
            frame: false,
            transparent: true,
            webPreferences: {
              nodeIntegration: true,
            },
          });

          const winURL =
            process.env.NODE_ENV === "development"
              ? `http://localhost:9080/#/danmaku`
              : `file://${__dirname}/index.html/#/danmaku`;
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
  },
};
</script>

<style scoped>
.layout-header {
  background: white;
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
