<template>
  <div>
    <div class="left-container">
      <div class="config-container">
        自动语音识别技术
        <span>
          <Tooltip max-width="600" transfer placement="right">
            <span class="help">?</span>
            <div slot="content" :style="{ 'white-space': 'normal', 'line-height': '24px'}">
              <p>
                ● 本功能依赖阿里云服务实现直播语音识别。
              </p>
              <p>
                ● 您需要先在阿里云官网开通账户，并且开通实时语音识别功能，具体操作可参考网上教程。
              </p>
              <p>
                ● 本功能依赖ffmpeg。
              </p>
              <p>
                ● 您可以自行下载ffmpeg，我在度盘也会提供一个镜像。
              </p>
              <p>
                ● 您需要把ffmpeg放入环境变量，或者手动指定ffmpeg文件路径。
              </p>
            </div>
          </Tooltip>
        </span>

      </div>
      <div class="config-container">
        独立窗口
        <i-switch :value="isShowASRWindow" :loading="isShowASRWindowLoading" @on-change="showASRWindow"></i-switch>
        <Checkbox :style="{'padding-left': '10px'}" :value="isASRWindowAlwaysOnTop" @on-change="changeAlwaysOnTop">置顶</Checkbox>
      </div>
      <!-- <div class="divider"></div> -->
      <div class="config-container">
        <span>
          <Tooltip max-width="600" transfer placement="right">
            <Button @click="openFFmpegSelector" size="small">
              选择 ffmpeg 文件
            </Button>
            <div slot="content" :style="{ 'white-space': 'normal', 'line-height': '24px'}">
              <p>
                ● 您可以手动指定ffmpeg文件路径。
              </p>
              <p>
                ● 不选择则从环境变量中寻找ffmpeg文件。
              </p>
            </div>
          </Tooltip>
        </span>
        <span v-if="ffmpegExe">
          {{ ffmpegExe }}
          <Icon type="md-close" :style="{color: 'crimson', cursor: 'pointer'}" @click="clearFFmpegPath()" />
        </span>
      </div>
      <div class="config-container">
        <span>
          显示行数：
          <InputNumber :value="ASRLineCount" size="small" @on-change="changeASRLineCount" :min="1" :step="1" :style="{ width: '50px' }" />
        </span>
      </div>
      <div class="config-container">
        <span>
          <Checkbox :value="enableTranslate" @on-change="changeEnableTranslate" :disabled="!aliAccessKeyId || !aliAccessKeySecret || !fromLang ||!toLang">开启翻译：</Checkbox>
          <Select v-model="fromLang" :disabled="enableTranslate" size="small" style="width:80px">
            <Option v-for="item in fromLangs" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
          =>
          <Select v-model="toLang" :disabled="enableTranslate" size="small" style="width:80px">
            <Option v-for="item in toLangs" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </span>
      </div>
      <div class="config-container">
        <Button @click="start" :disabled="isStarted || !aliAccessKeyId || !aliAccessKeySecret || !aliAppKey" size="small" :loading="isStarting">开始</Button>
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
          <!-- <Input :value="aliAppKey" :disabled="isStarted" @on-change="changeAliAppKey" size="small" placeholder="AppKey..." :style="{display: 'inline-block', width: '220px'}" /> -->
          <AutoComplete :value="aliAppKey" :disabled="isStarted" @on-change="changeAliAppKey" size="small" placeholder="AppKey..." :style="{display: 'inline-block', width: '220px'}">
            <Option v-for="appKey in aliAppKeys" :value="appKey" :key="appKey">
              {{ appKey }}
              <Icon type="md-close" class="remove-history-appkey" @click="removeHistoryAppkey(appKey)" />
            </Option>
          </AutoComplete>
        </div>
        <div>
          <div class="key-item">服务器: </div>
          <Select class="server-selector" v-model="aliServer" :disabled="isStarted" style="width:200px" size="small">
            <Option v-for="item in aliServers" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </div>
      </div>
    </div>
    <div class="right-container">
      <template v-for="(text, index) in texts">
        <div :key="index">
          <div>
            {{ text.text }}
          </div>
          <div v-if="text.translate" :style="{color: 'gray'}">
            {{ text.translate }}
          </div>
        </div>
      </template>
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
import { ipcRenderer } from "electron";
import * as remote from "@electron/remote";
import { uniq } from 'lodash'
import ws from '../../service/ws'
import { initialASR, closeASR, getASRStatus, translateSentence, translateOpen, translateClose, getTranslateStatus } from '../../service/api'
import { IPC_LIVE_WINDOW_CLOSE, IPC_ENABLE_WEB_CONTENTS } from "../../service/const";
import { getRandomPlayUrl } from "../../service/bilibili-recorder"
const { BrowserWindow, dialog } = remote

export default {
  data() {
    return {
      playQuality: "高清",
      checkOnTopInterval: null,
      isStarting: false,
      isStarted: false,
      isShowASRWindowLoading: false,
      isShowASRWindow: false,
      isASRWindowAlwaysOnTop: false,
      enableTranslate: false,
      fromLang: 'ja',
      toLang: 'zh',
      fromLangs: [
        {
          value: 'ja',
          label: '日语',
        },
        {
          value: 'en',
          label: '英语',
        },
        {
          value: 'zh',
          label: '中文',
        },
      ],
      toLangs: [
        {
          value: 'zh',
          label: '中文',
        },
        {
          value: 'ja',
          label: '日语',
        },
        {
          value: 'en',
          label: '英语',
        }
      ],
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
      texts: [],
      currentTextIndex: 0,
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
    ASRLineCount() {
      return this.$store.state.Config.ASRLineCount
    },
    aliAppKeys() {
      return this.$store.state.Config.aliAppKeys
    }
  },

  created() {
    getASRStatus()
      .then(({ message }) => {
        if (message === '1') {
          this.isStarted = true
        }
      })

    getTranslateStatus()
      .then(({ message, data }) => {
        if (message === '1') {
          this.enableTranslate = true
          this.fromLang = data?.fromLang
          this.toLang = data?.toLang
        }
      })

    ws.addEventListener('message', this.onMessage)
  },

  mounted() {
    if (this.ASRWindowId) {
      const win = BrowserWindow.fromId(this.ASRWindowId);
      if (win) {
        this.isShowASRWindow = true
        this.win = win
      }
    }
  },

  beforeDestroy() {
    ws.removeEventListener("message", this.onMessage);
  },

  methods: {
    onMessage(msg) {
      const payload = JSON.parse(msg.data)

      if (payload.cmd === 'ASR_SENTENCE_BEGIN') {
        if (this.texts.length >= this.ASRLineCount) {
          this.texts = this.texts.slice(-(this.ASRLineCount - 1))
          this.currentTextIndex = this.ASRLineCount - 1
        } else {
          this.currentTextIndex = this.texts.length
        }
      }

      if (payload.cmd === 'ASR_SENTENCE_END') {
        const texts = [...this.texts]
        texts[this.currentTextIndex] = {
          id: payload.payload?.header?.message_id,
          text: payload.payload?.payload?.result
        }
        this.texts = texts
        if (this.enableTranslate) {
          if (this.fromLangs !== this.toLangs) {
            translate({
              accessKeyId: this.aliAccessKeyId,
              accessKeySecret: this.aliAccessKeySecret,
              from: this.fromLang,
              to: this.toLang,
              text: payload.payload?.payload?.result,
              payload: {
                id: payload.payload?.header?.message_id,
              }
            })
          }
        }
      }

      if (payload.cmd === 'ASR_SENTENCE_CHANGE') {
        const texts = [...this.texts]
        texts[this.currentTextIndex] = {
          id: payload.payload?.header?.message_id,
          text: payload.payload?.payload?.result
        }
        this.texts = texts
      }

      if (payload.cmd === 'MECHINE_TRANSLATE') {
        const index = this.texts.findIndex(({ id }) => payload.payload?.id === id)
        const text = this.texts[index]
        text.translate = payload.payload?.message
        this.$set(this.texts, index, text)
      }
    },

    async start() {
      this.isStarting = true

      const playUrl = await getRandomPlayUrl({
        roomId: this.realRoomId,
        quality: this.playQuality,
        cookie: this.isWithCookie ? this.userCookie : undefined,
      });

      await initialASR({
        accessKeyId: this.aliAccessKeyId,
        accessKeySecret: this.aliAccessKeySecret,
        serviceUrl: this.aliServer,
        appKey: this.aliAppKey,
        playUrl: playUrl,
        ffmpegPath: this.ffmpegExe,
      })
      this.isStarted = true
      this.isStarting = false

      let aliAppKeys = []
      if (this.aliAppKeys.length >= 9) {
        aliAppKeys = this.aliAppKeys.slice(-this.aliAppKeys.length)
        aliAppKeys = [...aliAppKeys, this.aliAppKey]
      }
      else {
        aliAppKeys = [...this.aliAppKeys, this.aliAppKey]
      }
      this.$store.dispatch("UPDATE_CONFIG", {
        aliAppKeys: uniq(aliAppKeys)
      })
    },

    async stop() {
      await closeASR({})
      this.isStarted = false
    },

    changeAliAccessKeyId(e) {
      const data = {
        aliAccessKeyId: e.target.value,
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    changeAliAccessKeySecret(e) {
      const data = {
        aliAccessKeySecret: e.target.value,
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    changeAliAppKey(value) {
      const data = {
        aliAppKey: value
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async openFFmpegSelector() {
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
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
            ? `http://localhost:9080/#/asr-window`
            : `file://${__dirname}/index.html#asr-window`;

        win.loadURL(winURL);
        this.win = win
        this.isShowASRWindow = true;
        this.isShowASRWindowLoading = false;
      } else {
        if (!this.win) return
        try {
          this.win.close()
        } catch (e) {
          console.log('Close window error', e)
        }
        this.clearDanmakuWindowInfo()
      }
    },

    async clearDanmakuWindowInfo() {
      this.$store.dispatch("UPDATE_CONFIG", {
        ASRWindowId: null
      });
      // clear
      if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      this.win = null
      this.isShowASRWindow = false
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

    changeASRLineCount(number) {
      const data = {
        ASRLineCount: number
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    clearFFmpegPath() {
      this.$store.dispatch("UPDATE_CONFIG", {
        ffmpegExe: null,
      });
    },

    removeHistoryAppkey(appKey) {
      const aliAppKeys = this.aliAppKeys.filter(__appKey => __appKey !== appKey)
      this.$store.dispatch("UPDATE_CONFIG", {
        aliAppKeys,
      });
    },

    async changeEnableTranslate(status) {
      if (status) {
        await translateOpen({
          fromLang: this.fromLang,
          toLang: this.toLang,
        })
        this.enableTranslate = true
      } else {
        await translateClose()
        this.enableTranslate = false
      }
    }
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
.left-container {
  width: 450px;
  display: inline-block;
  vertical-align: top;
}
.right-container {
  text-align: center;
  display: inline-block;
  padding: 10px;
  width: calc(100% - 500px);
  padding-top: 40px;
}
.right-container > div {
  padding-top: 5px;
  font-size: 18px;
  font-weight: bold;
}

.help {
  padding-left: 10px;
  font-weight: bold;
  color: blue;
}
.remove-history-appkey {
  vertical-align: middle;
  font-size: 15px;
  margin-left: 2px;
  font-weight: bold;
}

.remove-history-appkey:hover {
  color: crimson;
}
</style>
