<template>
  <div>
    <div class="left-container">
      <div class="config-container">
        自动语音识别技术
        <span>
          <Tooltip max-width="600" transfer placement="right">
            <span class="help">?</span>
            <template #content>
              <div :style="{ 'white-space': 'normal', 'line-height': '24px' }">
                <p>● 本功能依赖阿里云服务实现直播语音识别。</p>
                <p>● 您需要先在阿里云官网开通账户，并且开通实时语音识别功能，具体操作可参考网上教程。</p>
                <p>● 本功能依赖ffmpeg。</p>
                <p>● 您可以自行下载ffmpeg，我在度盘也会提供一个镜像。</p>
                <p>● 您需要把ffmpeg放入环境变量，或者手动指定ffmpeg文件路径。</p>
              </div>
            </template>
          </Tooltip>
        </span>
      </div>
      <div class="config-container">
        独立窗口
        <i-switch :model-value="isShowASRWindow" :loading="isShowASRWindowLoading" @on-change="showASRWindow" />
        <Checkbox :style="{ 'padding-left': '10px' }" :model-value="isASRWindowAlwaysOnTop" @on-change="changeAlwaysOnTop">置顶</Checkbox>
      </div>
      <!-- <div class="divider"></div> -->

      <div class="config-container">
        <span>
          显示行数：
          <InputNumber :model-value="ASRLineCount" size="small" :min="1" :step="1" :style="{ width: '50px' }" @on-change="changeASRLineCount" />
        </span>
      </div>
      <div class="config-container">
        <span>
          <Checkbox :model-value="enableTranslate" :disabled="!aliAccessKeyId || !aliAccessKeySecret || !fromLang || !toLang" @on-change="changeEnableTranslate">开启翻译：</Checkbox>
          <Select v-model:fromLang="fromLang" :disabled="enableTranslate" size="small" style="width: 80px">
            <Option v-for="item in fromLangs" :key="item.value" :value="item.value">{{ item.label }}</Option>
          </Select>
          =>
          <Select v-model:toLang="toLang" :disabled="enableTranslate" size="small" style="width: 80px">
            <Option v-for="item in toLangs" :key="item.value" :value="item.value">{{ item.label }}</Option>
          </Select>
        </span>
      </div>
      <div class="config-container">
        <RadioGroup :model-value="audioFrom" @on-change="changeAudioFrom">
          <Radio label="livestream">
            <span>从直播流输入音频</span>
          </Radio>
          <Radio label="microphone">
            <span>从麦克风输入音频</span>
          </Radio>
        </RadioGroup>
      </div>
      <div v-if="audioFrom === 'microphone'" class="config-container">
        选择设备：
        <Select v-model:audioDevices="audioDevices" :disabled="audioFrom !== 'microphone'" size="small" style="width: 220px" placeholder="未选择时使用默认设备" @on-open-change="getAudioDevice">
          <Option v-for="d in audioDevices" :key="d.value" :value="d.value">{{ d.label }}</Option>
        </Select>
        <!-- <Button class="margin-left-2px" :disabled="audioFrom !== 'microphone'" size="small" @click="openAuidoTestModal">测试</Button> -->
      </div>

      <div v-if="audioFrom === 'livestream'" class="config-container">
        <span>
          <Tooltip max-width="600" transfer placement="right">
            <Button size="small" @click="openFFmpegSelector">选择 ffmpeg 文件</Button>
            <template #content>
              <div :style="{ 'white-space': 'normal', 'line-height': '24px' }">
                <p>● 您可以手动指定ffmpeg文件路径。</p>
                <p>● 不选择则从环境变量中寻找ffmpeg文件。</p>
              </div>
            </template>
          </Tooltip>
        </span>
        <span v-if="ffmpegExe">
          {{ ffmpegExe }}
          <Icon type="md-close" :style="{ color: 'crimson', cursor: 'pointer' }" @click="clearFFmpegPath()" />
        </span>
      </div>

      <div class="config-container" :style="{ width: '400px' }">
        <div :style="{ 'text-align': 'center' }">阿里云</div>
        <div>
          <div class="key-item">AccessKeyId:</div>
          <Input :model-value="aliAccessKeyId" :disabled="isStarted" :style="{ display: 'inline-block', width: '220px' }" size="small" placeholder="AccessKeyId..." @on-change="changeAliAccessKeyId" />
        </div>
        <div>
          <div class="key-item">AccessKeySecret:</div>
          <Input
            :model-value="aliAccessKeySecret"
            :disabled="isStarted"
            size="small"
            placeholder="AccessKeySecret..."
            type="password"
            :style="{ display: 'inline-block', width: '220px' }"
            @on-change="changeAliAccessKeySecret"
          />
        </div>
        <div>
          <div class="key-item">AppKey:</div>
          <!-- <Input :model-value="aliAppKey" :disabled="isStarted" @on-change="changeAliAppKey" size="small" placeholder="AppKey..." :style="{display: 'inline-block', width: '220px'}" /> -->
          <AutoComplete :model-value="aliAppKey" :disabled="isStarted" size="small" placeholder="AppKey..." :style="{ display: 'inline-block', width: '220px' }" @on-change="changeAliAppKey">
            <Option v-for="appKey in aliAppKeys" :key="appKey" :value="appKey">
              {{ appKey }}
              <Icon type="md-close" class="remove-history-appkey" @click="removeHistoryAppkey(appKey)" />
            </Option>
          </AutoComplete>
        </div>
      </div>
      <div class="config-container">
        <Button type="primary" :disabled="isStarted || !aliAccessKeyId || !aliAccessKeySecret || !aliAppKey" :loading="isStarting" @click="start">开始</Button>
        <Button class="margin-left-5px" :disabled="!isStarted" @click="stop">停止</Button>
      </div>
    </div>

    <div class="right-container">
      <template v-for="(text, index) in texts" :key="index">
        <div>
          <div>{{ text.text }}</div>
          <div v-if="text.translate" :style="{ color: 'gray' }">{{ text.translate }}</div>
        </div>
      </template>
    </div>

    <Modal v-model="isMicrophoneNoticeModalOpen" title="即将使用麦克风" @on-ok="microphoneNoticeOk" @on-cancel="microphoneNoticeCancel">
      <p :style="{ padding: '5px' }">您的麦克风输入数据将提交至云服务商进行分析</p>
      <Checkbox :style="{ padding: '5px' }">下次不再显示</Checkbox>
    </Modal>
  </div>
</template>

<script>
// 结果
// 1 输出文件
// 2 实时显示(独立窗口)
// 3 聊天机器人
import { ipcRenderer } from 'electron'
import { BrowserWindow, dialog, nativeImage } from '@electron/remote'
import { uniq } from 'lodash'
import ws from '../../service/ws'
import { initialASR, closeASR, getASRStatus, translateSentence, translateOpen, translateClose, getTranslateStatus, startLiveStreamASR, closeLiveStreamASR } from '../../service/api'
import { IPC_LIVE_WINDOW_CLOSE, IPC_ENABLE_WEB_CONTENTS } from '../../service/const'
import { getRandomPlayUrl } from '../../service/bilibili-recorder'
import icon from '../assets/logo.png'
import processor from 'worklet-loader!../../service/processor.worklet'
import global from '../../service/global'

export default {
  data() {
    return {
      playQuality: '高清',
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
        },
      ],
      // aliServer: 'wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1',
      // aliServers: [
      //   {
      //     value: 'wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1',
      //     label: '上海',
      //   },
      //   {
      //     value: 'wss://nls-gateway-cn-beijing.aliyuncs.com/ws/v1',
      //     label: '北京',
      //   },
      //   {
      //     value: 'wss://nls-gateway-cn-shenzhen.aliyuncs.com/ws/v1',
      //     label: '深圳',
      //   },
      // ],
      texts: [],
      currentTextIndex: 0,
      audioDevices: [],
      audioDeviceId: '',
      isMicrophoneNoticeModalOpen: false,
    }
  },

  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId
    },
    isWithCookie() {
      return this.$store.state.Config.isWithCookie
    },
    userCookie() {
      return this.$store.state.Config.userCookie
    },
    aliAccessKeyId() {
      return this.$store.state.Config.aliAccessKeyId
    },
    aliAccessKeySecret() {
      return this.$store.state.Config.aliAccessKeySecret
    },
    aliAppKey() {
      return this.$store.state.Config.aliAppKey
    },
    ffmpegExe() {
      return this.$store.state.Config.ffmpegExe
    },
    ASRWindowId() {
      return this.$store.state.Config.ASRWindowId
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
    },
    disableIgnoreMouseEvent() {
      return this.$store.state.Config.disableIgnoreMouseEvent
    },
    audioFrom() {
      return this.$store.state.Config.audioFrom
    },
  },

  created() {
    getASRStatus().then(({ message }) => {
      if (message === '1') {
        this.isStarted = true
      }
    })

    getTranslateStatus().then(({ message, data }) => {
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
      const win = BrowserWindow.fromId(this.ASRWindowId)
      if (win) {
        this.isShowASRWindow = true
        this.win = win
      }
    }
  },

  beforeUnmount() {
    ws.removeEventListener('message', this.onMessage)
  },

  methods: {
    async getAudioDevice() {
      const devices = await navigator.mediaDevices.enumerateDevices()
      this.audioDevices = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d) => {
          return {
            value: d.deviceId,
            label: d.label,
          }
        })
    },

    async changeAudioFrom(value) {
      const data = {
        audioFrom: value,
      }
      // await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

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
          text: payload.payload?.payload?.result,
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
              },
            })
          }
        }
      }

      if (payload.cmd === 'ASR_SENTENCE_CHANGE') {
        const texts = [...this.texts]
        texts[this.currentTextIndex] = {
          id: payload.payload?.header?.message_id,
          text: payload.payload?.payload?.result,
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

    openAuidoTestModal() {

    },

    microphoneNoticeOk() {
      this.getMicrophoneAudio()
    },

    microphoneNoticeCancel() {
      this.isStarting = false
      this.isStarted = false
    },

    async start() {
      this.isStarting = true

      if (this.audioFrom === 'microphone') {
        this.isMicrophoneNoticeModalOpen = true
        return
      }

      await initialASR({
        accessKeyId: this.aliAccessKeyId,
        accessKeySecret: this.aliAccessKeySecret,
        appKey: this.aliAppKey,
      })

      const playUrl = await getRandomPlayUrl({
        roomId: this.realRoomId,
        quality: this.playQuality,
        cookie: this.isWithCookie ? this.userCookie : undefined,
      })

      await startLiveStreamASR({
        playUrl: playUrl,
        ffmpegPath: this.ffmpegExe,
      })
      this.isStarted = true
      this.isStarting = false

      let aliAppKeys = []
      if (this.aliAppKeys.length >= 9) {
        aliAppKeys = this.aliAppKeys.slice(-this.aliAppKeys.length)
        aliAppKeys = [...aliAppKeys, this.aliAppKey]
      } else {
        aliAppKeys = [...this.aliAppKeys, this.aliAppKey]
      }
      this.$store.dispatch('UPDATE_CONFIG', {
        aliAppKeys: uniq(aliAppKeys),
      })
    },

    async stop() {
      if (this.audioFrom === 'microphone') {
        if (global.microphoneStream) {
          global.microphoneStream.getTracks().forEach(function (track) {
            track.stop()
          })
          global.microphoneStream = null
        }
        if (global.microphoneAudioContext) {
          global.microphoneAudioContext.close()
          global.microphoneAudioContext = null
        }
      } else {
        await closeLiveStreamASR({})
      }
      await closeASR({})
      this.isStarted = false
    },

    async getMicrophoneAudio() {
      await initialASR({
        accessKeyId: this.aliAccessKeyId,
        accessKeySecret: this.aliAccessKeySecret,
        appKey: this.aliAppKey,
      })

      const option = {
        audio: true,
        video: false,
      }
      if (!this.audioDeviceId) {
        option.audio = {
          deviceId: this.audioDeviceId,
        }
      }
      const stream = await navigator.mediaDevices.getUserMedia(option)
      global.microphoneStream = stream
      const context = new AudioContext({
        sampleRate: '16000',
      })
      global.microphoneAudioContext = context
      const source = context.createMediaStreamSource(stream)

      // const processor = new Worker(new URL('../../service/processor.worklet.js', import.meta.url))
      await context.audioWorklet.addModule(processor)
      const worklet = new AudioWorkletNode(context, 'worklet-processor')

      // let count = 0
      let sample8192 = []
      worklet.port.onmessage = (e) => {
        let sample128 = JSON.parse(e.data)
        sample8192 = sample8192.concat(sample128)

        if (sample8192.length >= 8192) {
          const payload = {
            event: 'AUDIO',
            data: JSON.stringify(sample8192),
          }
          sample8192 = []
          ws.send(JSON.stringify(payload))
        }
      }

      source.connect(worklet)
      worklet.connect(context.destination)

      this.isStarted = true
      this.isStarting = false
    },

    changeAliAccessKeyId(e) {
      const data = {
        aliAccessKeyId: e.target.value,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    changeAliAccessKeySecret(e) {
      const data = {
        aliAccessKeySecret: e.target.value,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    changeAliAppKey(value) {
      const data = {
        aliAppKey: value,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async openFFmpegSelector() {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
      })
      if (!result.canceled) {
        const ffmpegExe = result.filePaths[0]
        this.$store.dispatch('UPDATE_CONFIG', {
          ffmpegExe,
        })
        await this.$nextTick()
      }
    },

    async showASRWindow(status) {
      this.isShowASRWindowLoading = true

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
        })

        await ipcRenderer.invoke(IPC_ENABLE_WEB_CONTENTS, {
          windowId: win.id,
        })

        this.$store.dispatch('UPDATE_CONFIG', {
          ASRWindowId: win.id,
        })

        const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080/#/asr-window` : `file://${__dirname}/index.html#asr-window`
        win.setIcon(nativeImage.createFromDataURL(icon))

        win.loadURL(winURL)
        this.win = win
        this.isShowASRWindow = true
        this.isShowASRWindowLoading = false
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
      this.$store.dispatch('UPDATE_CONFIG', {
        ASRWindowId: null,
      })
      // clear
      if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      this.win = null
      this.isShowASRWindow = false
      this.isShowASRWindowLoading = false
    },

    changeAlwaysOnTop(status) {
      this.win.setFocusable(!status)
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
      this.win.setAlwaysOnTop(status, this.onTopLevel)
      // 如果鼠标穿透 或者 取消置顶时，设置ignore
      if (!this.disableIgnoreMouseEvent || !status) {
        this.win.setIgnoreMouseEvents(status, { forward: true })
      }
      //   this.$store.dispatch("UPDATE_CONFIG", {
      //     isScrollDanmakuWindowAlwaysOnTop: status,
      //   });
      this.isASRWindowAlwaysOnTop = status
    },

    changeASRLineCount(number) {
      const data = {
        ASRLineCount: number,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    clearFFmpegPath() {
      this.$store.dispatch('UPDATE_CONFIG', {
        ffmpegExe: null,
      })
    },

    removeHistoryAppkey(appKey) {
      const aliAppKeys = this.aliAppKeys.filter((__appKey) => __appKey !== appKey)
      this.$store.dispatch('UPDATE_CONFIG', {
        aliAppKeys,
      })
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
    },
  },
}
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
