<template>
  <div class="layout">
    <Layout :style="{ minHeight: '100vh' }">
      <Sider collapsible :collapsed-width="78" v-model="isCollapsed">
        <Menu theme="dark" width="auto" :class="menuitemClasses">
          <MenuItem name="1-1" to="/style">
          <Icon type="md-color-palette" />
          <span>样式</span>
          </MenuItem>
          <MenuItem name="1-2" to="/message">
          <Icon type="md-chatboxes" />
          <span>消息</span>
          </MenuItem>
          <MenuItem name="1-3" to="/live">
          <Icon type="md-play" />
          <span>直播</span>
          </MenuItem>
          <MenuItem name="1-4" to="/vote">
          <Icon type="md-pie" />
          <span>投票</span>
          </MenuItem>
          <MenuItem name="1-5" to="/lottery">
          <Icon type="md-bonfire" />
          <span>祈愿</span>
          </MenuItem>
          <MenuItem name="1-6" to="/statistic">
          <Icon type="md-stats" />
          <span>统计</span>
          </MenuItem>
          <MenuItem name="1-7" to="/config">
          <Icon type="md-settings" />
          <span>设置</span>
          </MenuItem>
          <MenuItem name="1-8" to="/help">
          <Icon type="md-help" />
          <span>帮助</span>
          </MenuItem>
        </Menu>
      </Sider>
      <Layout>
        <div class="layout-header">
          <div class="avatar-wrapper">
            <Avatar :src="avatar || 'https://static.hdslb.com/images/member/noface.gif'" size="large" />&nbsp;&nbsp;
            <span :style="isConnected && { cursor: 'pointer' }" @click="openBiliLiveRoom">{{ username ? username : "未连接" }}</span>
            &nbsp;
            <Tag v-if="username" type="border" :color="liveStatus === 1 ? 'green' : 'silver'">{{ liveStatus === 1 ? "直播中" : "未开播" }}</Tag>
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
            <template v-if="!isAppUpdating">
              <Button shape="circle" type="dashed" @click="updateApp" :loading="isAppUpdateStarting">
                <Icon type="md-arrow-round-up" color="green" />
                <span :style="{ color: 'green' }">更新</span>
              </Button>
            </template>
            <template v-else>
              <i-circle :percent="percent" :size="60" :style="{ top: '2px' }">
                <span class="demo-Circle-inner" style="font-size: 12px">{{
                  downloadRate
                }}</span>
              </i-circle>
            </template>
          </div>
        </div>
        <div class="layout-header2">
          <div>
            <span>连接直播间</span>
            <AutoComplete :value="displayRoomId" @on-change="changeRoomId" placeholder="请输入房间号" size="small" :disabled="isConnected" style="width: 120px">
              <Option v-for="room in selfHistoryRooms" :value="room.roomId" :key="room.roomId">
                <Avatar :src="room.face || DEFAULT_AVATAR" size="small" />
                {{ `${room.uname} (${room.roomId})` }}
                <span :style="room.liveStatus === 1 ? { 'font-size': '12px', color: 'green'} : { 'font-size': '12px', color: 'silver'}">{{ room.liveStatus === 1 ? "直播中" : "未开播" }}</span>
                <Icon type="md-close" class="remove-history-room" @click="removeHistoryRoom(room)" />
              </Option>
            </AutoComplete>
            <i-switch :value="isConnected" :loading="isConnecting" @on-change="connect" :disabled="!displayRoomId" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <span>弹幕窗</span>
            <i-switch :value="isShowDanmakuWindow" :loading="isShowDanmakuWindowLoading" @on-change="showDanmakuWindow"></i-switch>&nbsp;&nbsp;&nbsp;
            <template v-if="isShowDanmakuWindow">
              <span>窗口置顶</span>
              <i-switch v-model="isAlwaysOnTop" @on-change="alwaysOnTop"></i-switch>
            </template>
            <Tooltip placement="right" content="录制中">
              <span v-if="isRecording" class="record-icon">
                <Icon :style="{position: 'absolute'}" type="ios-radio-button-on" />
              </span>
            </Tooltip>
            <Tooltip placement="right" content="天选时刻中">
              <Icon v-if="isLottering" class="lottery-icon" type="md-cube" />
            </Tooltip>
            <!-- <Tooltip placement="right" content="天选时刻获奖">
              <Icon v-if="!isLottering && lotteryAwardUsers" type="md-cube" />
            </Tooltip> -->
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
import { debounce } from "lodash";
import { remote, ipcRenderer, shell } from "electron";
const { BrowserWindow } = remote;

import { parseDownloadRate } from "../../service/util";
import { connect as connectRoom, getRealTimeViewersCount, getRoomStatus, disconnect, updateSetting } from '../../service/api'
import emitter from "../../service/event";
import { record, cancelRecord, getStatus, setStatus } from "../../service/bilibili-recorder";
import { getRoomInfoV2, getGuardInfo, getRoomInfoByIds } from "../../service/bilibili-api";
import {
  IPC_CHECK_FOR_UPDATE,
  IPC_UPDATE_AVAILABLE,
  IPC_DOWNLOAD_UPDATE,
  IPC_DOWNLOAD_PROGRESS,
  IPC_UPDATE_DOWNLOADED,
  SET_DANMAKU_ON_TOP_LEVEL,
  DEFAULT_RECORD_DIR,
  MAX_HISTORY_ROOM,
  PORT
} from "../../service/const";
import ws from '../../service/ws'

// 0 未开播
// 1 准备中（web开推流码）
// 2 直播中（obs开始推流）
let LIVE_STATUS = 0;

export default {
  data() {
    return {
      displayRoomId: 0,
      isCollapsed: true,
      isShowDanmakuWindow: false,
      isShowDanmakuWindowLoading: false,
      isAlwaysOnTop: false,
      giftTimer: null,
      peopleTimer: null,
      isConnecting: false,
      hasNewVersion: false,
      isAppUpdating: false,
      isAppUpdateStarting: false,
      isRecording: false,
      isLottering: false,
      downloadRate: "0 KB/s",
      percent: 0,
      selfHistoryRooms: [],

      username: "",
      avatar: null,
      ninkiNumber: 0,
      fansNumber: 0,
      fansClubNumber: 0,
      liveStatus: 0,
      peopleNumber: 0,
      guardNumber: 0,
      roomUserId: 0,
    };
  },
  created() {
  },
  async mounted() {
    this.displayRoomId = this.realRoomId;

    await this.initial();
    ws.onmessage = (msg) => {
      const payload = JSON.parse(msg.data)

      if (payload.cmd === 'ROOM_REAL_TIME_MESSAGE_UPDATE') {
        this.onFansNumber(payload.payload)
      }
      if (payload.cmd === 'NINKI') {
        this.onNinKi(payload.payload)
      }

      if (payload.cmd === "LIVE") {
        // 直播中
        this.liveStatus = 1;
        LIVE_STATUS++;
        if (this.isAutoRecord && LIVE_STATUS === 2) {
          // 延时 5s 等待服务端延时
          setTimeout(() => {
            console.log("auto record start...");
            this.startRecord();
          }, 5000)
        }
        if (this.isAutoRecord && LIVE_STATUS > 2) {
          console.log("auto record restart...");
          this.cancelRecord();
          this.startRecord();
        }
      }

      if (payload.cmd === "PREPARING") {
        // 未开播
        this.liveStatus = 0;
        LIVE_STATUS = 0;
        console.log("auto record stop...");
        this.cancelRecord();
      }

      // 天选时刻开始
      if (payload.cmd === 'ANCHOR_LOT_START') {
        this.isLottering = true
      }

      // 天选时刻结束
      if (payload.cmd === 'ANCHOR_LOT_END') {
        this.isLottering = false
      }

      if (payload.cmd === 'ANCHOR_LOT_AWARD') {
        this.isLottering = false
      }
    }

    ipcRenderer.once(IPC_UPDATE_AVAILABLE, () => {
      this.hasNewVersion = true;
    });
    ipcRenderer.send(IPC_CHECK_FOR_UPDATE);

    this.peopleTimer = setInterval(async () => {
      if (!this.realRoomId || !this.isConnected) return;
      const result = await getRealTimeViewersCount({ roomId: this.realRoomId })
      this.peopleNumber = result.data
    }, 10000);

    // 刷新舰长数 间隔1分钟
    this.guardNumberTimer = setInterval(async () => {
      if (!this.realRoomId || !this.roomUserId) return
      const guardInfo = await getGuardInfo(this.realRoomId, this.roomUserId);
      this.guardNumber = guardInfo.data.info.num;
    }, 60000)

    const { isRecording } = getStatus()
    this.isRecording = isRecording
    emitter.on('record-start', () => {
      this.isRecording = true
    })
    emitter.on('record-cancel', () => {
      this.isRecording = false
    })

    await this.fillRoomLiveStatus(this.historyRooms)
  },
  watch: {
    async historyRooms(newValue, oldValue) {
      this.selfHistoryRooms = newValue
      if (newValue.length < oldValue.length) return
      await this.fillRoomLiveStatus(newValue)
    }
  },
  computed: {
    menuitemClasses: function () {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    },
    isConnected() {
      return this.$store.state.Config.isConnected || false;
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
    recordDir() {
      return this.$store.state.Config.recordDir || DEFAULT_RECORD_DIR;
    },
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
    isWithCookie() {
      return this.$store.state.Config.isWithCookie;
    },
    isAutoRecord() {
      return this.$store.state.Config.isAutoRecord;
    },
    historyRooms() {
      return this.$store.state.Config.historyRooms;
    },
    // filteredRooms() {
    //   return this.historyRooms.filter(room => {
    //     const index = `${room.roomId}`.indexOf(`${this.displayRoomId}`)
    //     if (!~index) return false
    //     // room.highLightIndex = index
    //     return true
    //   })
    // }
    isWatchLottery() {
      return this.$store.state.Config.isWatchLottery;
    },
  },
  methods: {
    async connect(status) {
      this.isConnecting = true;
      const data = await this.initRoomInfo(data)

      if (status && this.displayRoomId) {
        // const { data } = await getRoomInfoV2(this.displayRoomId);
        if (!data) {
          this.$Message.error("连接失败")
          this.isConnecting = false
          return
        }

        const {
          room_id: roomId,
          live_status: liveStatus,
        } = data.room_info;
        const {
          uname,
          face,
          gender
        } = data.anchor_info.base_info;

        await connectRoom({ roomId: Number(roomId), uid: 0 });

        const config = {
          isConnected: status,
        };
        this.$store.dispatch("UPDATE_CONFIG", config);

        const { isRecording } = getStatus()
        if (liveStatus === 1 && this.isAutoRecord && !isRecording) {
          LIVE_STATUS = 2;
          this.startRecord();
        }

        // 加入历史连接房间号
        if (!this.historyRooms.find((room) => room.roomId === roomId)) {
          let historyRooms = this.historyRooms
          if (this.historyRooms.length > MAX_HISTORY_ROOM) {
            historyRooms = [
              ...this.historyRooms.slice(1),
              { roomId, uname, face },
            ];
          } else {
            historyRooms = [
              ...this.historyRooms,
              { roomId, uname, face },
            ];
          }
          this.$store.dispatch("UPDATE_CONFIG", {
            historyRooms
          })
        }
      } else {
        await disconnect({ roomId: this.displayRoomId })
        this.initial()
      }
      this.isConnecting = false;
    },

    async initRoomInfo() {
      const { data } = await getRoomInfoV2(this.displayRoomId);
      console.log(data)

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
      this.roomUserId = uid

      // 传递 当前主播userId
      await updateSetting({
        roomUserId: uid
      })
      getGuardInfo(roomId, uid)
        .then(guardInfo => {
          this.guardNumber = guardInfo.data.info.num;
        })

      const config = {
        isConnected: status,
        realRoomId: roomId,
        displayRoomId: this.displayRoomId, // 输入的roomId，仅作为保留输入框值用
        medalId: medal_id,
        medalName: medal_name,
      };
      this.$store.dispatch("UPDATE_CONFIG", config);

      return data
    },

    showDanmakuWindow(status) {
      // const { x, y } = screen.getCursorScreenPoint();
      this.isShowDanmakuWindowLoading = true;

      if (status) {
        this.win = new BrowserWindow({
          width: this.windowWidth || 480,
          height: this.windowHeight || 540,
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

        // const winURL =
        //   process.env.NODE_ENV === "development"
        //     ? `http://localhost:9080/#/danmaku-window`
        //     : `file://${__dirname}/index.html#danmaku-window`;

        const winURL =
          process.env.NODE_ENV === "development"
            ? `http://localhost:${PORT}?port=${PORT}`
            : `http://localhost:${PORT}?port=${PORT}`;
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

    async initial() {
      const result = await getRoomStatus({ roomId: this.realRoomId })
      const isConnected = result.data.isConnected
      if (isConnected) {
        await this.initRoomInfo()
      } else {
        this.username = "";
        this.avatar = null;
        this.ninkiNumber = 0;
        this.fansNumber = 0;
        this.fansClubNumber = 0;
        this.liveStatus = 0;
        this.peopleNumber = 0;
      }

      this.$store.dispatch("UPDATE_CONFIG", {
        isConnected
      })
    },
    alwaysOnTop(status) {
      this.win.setFocusable(!status);
      this.win.setAlwaysOnTop(status, SET_DANMAKU_ON_TOP_LEVEL);
      this.win.setIgnoreMouseEvents(status, { forward: true });
      this.$store.dispatch("UPDATE_CONFIG", {
        isAlwaysOnTop: status,
      });
    },

    changeRoomId(roomId) {
      try {
        if (typeof roomId === "string") {
          roomId = roomId.replace(/[^\d]/g, "");
        }
      } catch (e) {
        this.$Message.warning("请输入正确数字");
      }
      this.displayRoomId = roomId;
    },

    onFansNumber(payload) {
      const { fansNumber, fansClubNumber } = payload;
      this.fansNumber = fansNumber;
      this.fansClubNumber = fansClubNumber;
    },

    onNinKi(payload) {
      const { ninkiNumber } = payload;
      this.ninkiNumber = ninkiNumber;
    },

    async updateApp() {
      ipcRenderer.send(IPC_DOWNLOAD_UPDATE);
      this.isAppUpdateStarting = true;

      ipcRenderer.on(IPC_DOWNLOAD_PROGRESS, (event, args) => {
        this.isAppUpdating = true;

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
        this.percent = Number(percent).toFixed(0);
      });

      // 更新会退出应用，不监听也可以
      ipcRenderer.once(IPC_UPDATE_DOWNLOADED, () => {
        ipcRenderer.removeAllListeners(IPC_DOWNLOAD_PROGRESS);
        this.isAppUpdating = false;
        this.isAppUpdateStarting = false;
      });
    },

    async startRecord() {
      try {
        if (!this.realRoomId) {
          throw new Error("roomId required.");
        }
        const { id } = await record({
          roomId: this.realRoomId,
          recordDir: this.recordDir,
          quality: "原画",
          cookie: this.isWithCookie ? this.userCookie : undefined,
        });

        setStatus({
          recordId: id,
          recordStartTime: Date.now(),
          isRecording: true,
        })
        emitter.emit('record-start')
      } catch (e) {
        this.$Message.error(`录制失败: ${e.message}`);
      }
    },
    async cancelRecord() {
      const { recordId } = getStatus()
      if (!recordId) {
        console.warn(new Error('recordId not found.'));
        return
      }
      try {
        await cancelRecord(recordId);
      } catch (e) {
        console.warn(e);
      }
      setStatus({
        recordId: '',
        recordStartTime: 0,
        isRecording: false,
      })
      emitter.emit('record-cancel')
    },

    removeHistoryRoom(room) {
      const historyRooms = this.historyRooms.filter(
        (e) => e.roomId !== room.roomId
      );
      this.$store.dispatch("UPDATE_CONFIG", {
        historyRooms: historyRooms,
      });
    },

    async fillRoomLiveStatus(rooms) {
      const { data } = await getRoomInfoByIds(rooms.map(room => room.roomId))
      this.selfHistoryRooms = rooms.map(room => {
        room.liveStatus = data[room.roomId].live_status
        return room
      })
    },

    openBiliLiveRoom() {
      if (!this.isConnected || !this.realRoomId) return
      shell.openExternal(`https://live.bilibili.com/${this.realRoomId}`)
    }
  },
  beforeDestroy() {
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
.ivu-menu-item > i {
  margin-right: 2px;
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

/* .ivu-select::v-deep .ivu-icon {
  display: none;
} */

.remove-history-room {
  vertical-align: middle;
  font-size: 15px;
  margin-left: 2px;
  font-weight: bold;
}

.remove-history-room:hover {
  color: crimson;
}

.record-icon {
  font-size: 20px;
  color: crimson;
  vertical-align: middle;
  position: relative;
  display: inherit;
  height: 20px;
  width: 20px;
}
.record-icon::before,
.record-icon::after {
  content: "";
  position: absolute;
  top: 1.5px;
  bottom: 1.5px;
  right: 1.5px;
  left: 1.5px;
  border-top: solid 1px crimson;
  transition: all 0.5s;
  animation: rotate 2s infinite linear;
  border-radius: 50%;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
.lottery-icon {
  font-size: 20px;
  color: dodgerblue;
  vertical-align: middle;
  transition: all 0.5s;
  animation: rotateX 3s infinite linear;
}

@keyframes rotateX {
  0% {
    transform: rotateY(0deg);
  }

  25% {
    transform: rotateY(45deg);
  }

  50% {
    transform: rotateY(180deg);
  }

  75% {
    transform: rotateY(225deg);
  }

  100% {
    transform: rotateY(360deg);
  }
}
</style>
