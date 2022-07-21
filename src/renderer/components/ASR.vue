<template>
  <div>
    <div class="config-container">
      自动语音识别技术
    </div>
    <div class="config-container">
      独立窗口
      <i-switch :value="isShowASRWindow" :loading="isShowASRWindowLoading" @on-change="showASRWindow"></i-switch>
      <Checkbox :style="{'padding-left': '10px'}" :value="isASRWindowAlwaysOnTop" @on-change="changeAlwaysOnTop">置顶</Checkbox>
    </div>
    <!-- <div class="divider"></div> -->
    <div class="config-container">
      <Button @click="openFFmpegSelector" size="small">
        选择ffmpeg.exe文件
      </Button>
      {{ ffmpegExe }}
    </div>
    <div class="config-container">
      <Button @click="start" :disabled="isStarted" size="small" :loading="isStarting">开始</Button>
      <Button @click="stop" :disabled="!isStarted" size="small">停止</Button>
    </div>
    <div class="config-container" :style="{width: '400px'}">
      <div :style="{'text-align': 'center'}">
        阿里云
      </div>
      <div>
        <div class="key-item">AccessKeyId: </div>
        <Input :value="aliAccessKeyId" :disabled="isStarted" @on-change="changeAliAccessKeyId" size="small" placeholder="AccessKeyId..." :style="{display: 'inline-block', width: '220px'}" />
      </div>
      <div>
        <div class="key-item">AccessKeySecret: </div>
        <Input :value="aliAccessKeySecret" :disabled="isStarted" @on-change="changeAliAccessKeySecret" size="small" placeholder="AccessKeySecret..." type="password" :style="{display: 'inline-block', width: '220px'}" />
      </div>
      <div>
        <div class="key-item">AppKey: </div>
        <Input :value="aliAppKey" :disabled="isStarted" @on-change="changeAliAppKey" size="small" placeholder="AppKey..." :style="{display: 'inline-block', width: '220px'}" />
      </div>
      <div>
        <div class="key-item">服务器: </div>
        <Select class="server-selector" v-model="aliServer" :disabled="isStarted" style="width:200px" size="small">
          <Option v-for="item in aliServers" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </div>
    </div>
    <div class="result-container">
      <div>{{ text1 }}</div>
      <div>{{ text2 }}</div>
      <div>{{ text3 }}</div>
    </div>

  </div>
</template>

<script>
// TODO 
// 设置ffmpeg 路径
// 实例保存

// 结果
// 1 输出文件
// 2 实时显示(独立窗口)
// 3 聊天机器人
import ASR from '@tokine/asr'
import { ipcRenderer } from "electron";
import * as remote from "@electron/remote";
import { getRandomPlayUrl } from "../../service/bilibili-recorder"
const { BrowserWindow, dialog } = remote

export default {
  data() {
    return {
      playQuality: "高清",
      configChanged: false,
      isStarting: false,
      isStarted: false,
      isShowASRWindowLoading: false,
      isShowASRWindow: false,
      isASRWindowAlwaysOnTop: false,
      aliServer: 'wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1',
      aliServers: [{
        value: 'wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1',
        label: '上海'
      }, {
        value: 'wss://nls-gateway-cn-beijing.aliyuncs.com/ws/v1',
        label: '北京'
      }, {
        value: 'wss://nls-gateway-cn-shenzhen.aliyuncs.com/ws/v1',
        label: '深圳'
      }],
      text: '',
      text1: '',
      text2: '',
      text3: '',
      currentTextChannel: 'text1',
    };
  },

  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
    isWithCookie() {
      return this.$store.state.Config.isWithCookie;
    },
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
    aliAccessKeyId() {
      return this.$store.state.Config.aliAccessKeyId;
    },
    aliAccessKeySecret() {
      return this.$store.state.Config.aliAccessKeySecret;
    },
    aliAppKey() {
      return this.$store.state.Config.aliAppKey;
    },
    ffmpegExe() {
      return this.$store.state.Config.ffmpegExe;
    },
    ASRWindowId() {
      return this.$store.state.Config.ASRWindowId;
    },
    isOnTopForce() {
      return this.$store.state.Config.isOnTopForce
    },
    onTopLevel() {
      return this.$store.state.Config.onTopLevel
    },
  },

  created() {
    if (this.$global.asrInstance) {
      this.createListeners()
      this.isStarted = true
    }
  },

  mounted() {
    if (this.ASRWindowId) {
      const win = BrowserWindow.fromId(this.ASRWindowId);
      if (win) {
        this.isShowLiveWindow = true
        this.win = win
      }
    }
  },

  beforeDestroy() {
    if (this.$global.asrInstance) {
      this.$global.asrInstance.removeAllListeners()
    }
  },

  methods: {
    async start() {
      this.isStarting = true
      // let asr = this.$global.asrInstance
      // 如果没有初始化asr 或者 配置变化，重新初始化asr实例
      // if (!asr || this.configChanged) {
      const asr = new ASR()
      await asr.init({
        accessKeyId: this.aliAccessKeyId,
        accessKeySecret: this.aliAccessKeySecret,
        serviceUrl: this.aliServer,
        appKey: this.aliAppKey,
      })

      // asr = __asr
      // this.$store.dispatch("UPDATE_CONFIG", {
      //   asrInstance: __asr
      // })
      this.$global.asrInstance = asr
      // }

      const playUrl = await getRandomPlayUrl({
        roomId: this.realRoomId,
        quality: this.playQuality,
        cookie: this.isWithCookie ? this.userCookie : undefined,
      });
      console.log(playUrl);

      asr.start({
        url: playUrl
      })

      this.createListeners()
      this.configChanged = false
      this.isStarted = true
      this.isStarting = false
    },

    createListeners() {
      this.$global.asrInstance.on('begin', (msg) => {
        if (this.text3) {
          this.text1 = this.text2
          this.text2 = this.text3
          this.text3 = ''
        }

        if (!this.text1) {
          this.currentTextChannel = 'text1'
        }
        if (!this.text2) {
          this.currentTextChannel = 'text2'
        }
        if (!this.text3) {
          this.currentTextChannel = 'text3'
        }
      })
      this.$global.asrInstance.on('end', (msg) => {
        this[this.currentTextChannel] = msg.payload?.result
      })

      // {
      //     "header": {
      //         "namespace": "SpeechTranscriber",
      //         "name": "TranscriptionResultChanged",
      //         "status": 20000000,
      //         "message_id": "053e0932f3b541898073268e2bdf5c1b",
      //         "task_id": "0af33d971fc24020966e2acef8d2f5d7",
      //         "status_text": "Gateway:SUCCESS:Success."
      //     },
      //     "payload": {
      //         "index": 15,
      //         "time": 77940,
      //         "result": "有你等他收拾一下等他",
      //         "confidence": 0.87,
      //         "words": [],
      //         "status": 0
      //     }
      // }
      this.$global.asrInstance.on('change', (msg) => {
        this[this.currentTextChannel] = msg.payload?.result
      })
    },

    async stop() {
      if (!this.$global.asrInstance) return
      await this.$global.asrInstance.close()
      this.isStarting = false
    },

    changeAliAccessKeyId(e) {
      const data = {
        aliAccessKeyId: e.target.value,
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
      this.configChanged = true
    },

    changeAliAccessKeySecret(e) {
      const data = {
        aliAccessKeySecret: e.target.value,
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
      this.configChanged = true
    },

    changeAliAppKey(e) {
      const data = {
        aliAppKey: e.target.value,
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
      this.configChanged = true
    },

    async openFFmpegSelector() {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (!result.canceled) {
        const ffmpegExe = result.filePaths[0];
        this.$store.dispatch("UPDATE_CONFIG", {
          ffmpegExe,
        });
        await this.$nextTick();
      }
    },

    async showASRWindow(status) {
      this.isShowASRWindowLoading = true;

      if (status) {
        // window.open(
        //   `http://localhost:9080/#/live-window`,
        //   'live-window',
        //   'frame=false,transparent=true,hasShadow=false,width=640,height=320,resizable=true'
        // )
        const win = new BrowserWindow({
          width: this.liveWindowHeight ? this.liveWindowHeight * 2 : 640,
          height: this.liveWindowHeight || 320,
          // x, y,
          x: this.liveWindowX || 640,
          y: this.liveWindowY || 320,
          frame: false,
          transparent: true,
          hasShadow: false,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
          },
          resizable: true,
        });

        await ipcRenderer.invoke(IPC_ENABLE_WEB_CONTENTS, {
          windowId: win.id
        })

        this.$store.dispatch("UPDATE_CONFIG", {
          ASRWindowId: win.id
        });

        const winURL =
          process.env.NODE_ENV === "development"
            ? `http://localhost:9080/#/live-window`
            : `file://${__dirname}/index.html#live-window`;

        win.loadURL(winURL);
        this.win = win
        this.isShowASRWindow = true;
        this.isShowASRWindowLoading = false;
      } else {
        this.closeLiveWindow()

        ipcRenderer.send(IPC_LIVE_WINDOW_CLOSE, {
          windowId: this.ASRWindowId,
        });
      }
    },

    async closeLiveWindow() {
      this.win = null;
      this.isShowASRWindow = false;
      this.isShowASRWindowLoading = false;
    },

    changeAlwaysOnTop(status) {
      this.win.setFocusable(!status);
      // this.win.setVisibleOnAllWorkspaces(true)
      if (this.isOnTopForce && status) {
        this.checkOnTopInterval = setInterval(() => {
          if (!this.win) return
          this.win.moveTop()
        }, 1000)
      } else if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      this.win.setAlwaysOnTop(status, this.onTopLevel);
      this.win.setIgnoreMouseEvents(status, { forward: true });
      //   this.$store.dispatch("UPDATE_CONFIG", {
      //     isScrollDanmakuWindowAlwaysOnTop: status,
      //   });
      this.isASRWindowAlwaysOnTop = status
    },
  }
};
</script>

<style scoped>
.key-item {
  text-align: right;
  width: 120px;
  display: inline-block;
}
.config-container {
  margin: 15px 0px 0px 40px;
}
.config-container > div {
  padding: 5px;
}
.result-container {
  text-align: center;
  font-weight: bold;
  padding: 10px;
}
.result-container > div {
  padding-top: 5px;
}
</style>
