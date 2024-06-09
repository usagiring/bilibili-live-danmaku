<template>
  <div id="live-wrapper">
    <div id="live-config-wrapper">
      <div :style="{ display: 'inline-block' }">
        <template v-if="!isRecording">
          <Button shape="circle" class="space-left-5px" @click="startRecord">
            <Icon type="ios-radio-button-on" color="crimson" />
            录制
          </Button>
        </template>
        <template v-else>
          <Button shape="circle" class="space-left-5px" @click="cancelRecord">
            <Icon type="ios-square" color="crimson" />
            停止
          </Button>
        </template>
        {{ recordDuringFormat }}
        <div :style="{ display: 'inline-block', width: '80px', 'text-align': 'center' }">
          {{ downloadRate }}
        </div>
        <Select size="small" :model-value="recordQuality" style="width: 70px" @on-change="changeRecordQuality">
          <Option v-for="quality in qualities" :key="quality.key" :value="quality.value">{{ quality.value }}</Option>
        </Select>
        <Button class="space-left-5px" size="small" @click="openRecordSaveFolderSelector"> 选择文件夹 </Button>
        {{ recordDir }}
      </div>
      <div :style="{ 'padding-top': '3px' }">
        <Button class="space-left-5px" shape="circle" @click="play">
          <Icon type="md-play" color="green" />
          播放
        </Button>
        <Select class="space-left-5px" size="small" :model-value="playQuality" style="width: 70px" @on-change="changePlayQuality">
          <Option v-for="quality in qualities" :key="quality.key" :value="quality.value">{{ quality.value }}</Option>
        </Select>
        <!-- <Select class="space-left-5px" size="small" :model-value="resolution" style="width: 70px" @on-change="changeResolutions">
          <Option v-for="__resolution in resolutions" :key="__resolution.key" :value="__resolution.value">{{ __resolution.value }}</Option>
        </Select> -->
        <Checkbox class="setting-checkbox" :style="{ 'padding-left': '10px' }" :model-value="isWithCookie" @on-change="withCookie">带上Cookie录制/播放</Checkbox>
        <div :style="{ display: 'inline-block', position: 'relative' }">
          <span class="volume-icon"><Icon type="md-volume-up" /></span>
          <!-- <Icon type="md-volume-off" /> -->
          <div class="volume-controller-slider">
            <Slider :model-value="liveVolume" @on-change="changeLiveVolume" />
          </div>
        </div>
      </div>
      <div :style="{ 'margin-left': '25px' }">
        独立播放窗 <i-switch :model-value="isShowLiveWindow" :loading="isShowLiveWindowLoading" @on-change="showLiveWindow" />
        <Checkbox :style="{ 'padding-left': '10px' }" :model-value="isLiveWindowAlwaysOnTop" @on-change="changeAlwaysOnTop">置顶</Checkbox>
        <span :style="{ 'padding-right': '3px' }">透明度</span>
        <div class="opcity-controller-slider">
          <Slider :model-value="liveWindowOpacity" @on-change="changeLiveWindowOpacity" />
        </div>
      </div>
    </div>

    <video id="live-player" controls :style="{ height: `${resolution}px` }" />
    <div :style="{ padding: '0 20px 5px 10px' }">
      <template v-if="medalData">
        <FanMedal v-bind="medalData" />
      </template>
      <template v-else>
        <Tooltip transfer placement="top">
          <Button :disabled="!userCookie" :loading="getMedalDataLoading" size="small" :style="{ 'font-size': '12px', margin: '0 3px' }" @click="getMedalData"> 获取当前佩戴粉丝牌 </Button>
          <template #content>
            <div :style="{ 'white-space': 'normal' }">
              <p>会同时触发进入房间消息</p>
            </div>
          </template>
        </Tooltip>
      </template>
      <Input v-model="message" placeholder="弹幕..." clearable :style="{ width: '360px' }" @on-keyup.ctrl.enter="sendMessage" />

      <Tooltip placement="top">
        <Button :style="{ margin: '0 3px' }" :disabled="!message || !userCookie || !realRoomId" :loading="isSending" @click="sendMessage">发送</Button>
        <template #content>
          <div :style="{ color: 'pink', 'white-space': 'normal' }">
            <p>本应用通过模拟客户端请求带上身份信息发送弹幕。</p>
            <p>请谨慎使用此功能！</p>
            <p>快捷键: ctrl + enter</p>
          </div>
        </template>
      </Tooltip>
      <Button :disabled="!userCookie || !medalId" :loading="isWearing" @click="wearCurrentMedal">佩戴当前直播间牌子</Button>
    </div>
  </div>
</template>

<script>
import * as flvjs from 'flv.js'
import { ipcRenderer } from 'electron'
import { BrowserWindow, dialog, nativeImage } from '@electron/remote'
import emitter from '../../service/event'
import { IPC_GET_EXE_PATH, IPC_LIVE_WINDOW_PLAY, IPC_LIVE_WINDOW_CLOSE, IPC_ENABLE_WEB_CONTENTS, IPC_LIVE_WINDOW_ON_TOP } from '../../service/const'
import { parseDownloadRate, parseHexColor, dateFormat } from '../../service/util'
import { sendComment, getUserInfoInRoom, wearMedal, getRandomPlayUrl, record, cancelRecord, getRecordState } from '../../service/api'
import FanMedal from './FanMedal'
import icon from '../assets/logo.png'
import ws from '../../service/ws'
import path from 'path'

const qualityMap = {
  原画: 10000,
  蓝光: 400,
  超清: 250,
  高清: 150,
  流畅: 80,
}

export default {
  components: {
    FanMedal,
  },
  data() {
    return {
      flvPlayer: null,
      message: '',
      isSending: false,
      isWearing: false,
      recordDuring: 0,
      recordTimer: null,
      medalData: null,
      downloadRate: '0 KB/s',
      recordQuality: '原画',
      playQuality: '超清',
      resolution: '480',
      getMedalDataLoading: false,
      isShowLiveWindow: false,
      isShowLiveWindowLoading: false,
      checkOnTopInterval: null,
      win: null,
      qualities: [
        {
          key: 1,
          value: '原画',
        },
        {
          key: 2,
          value: '蓝光',
        },
        {
          key: 3,
          value: '超清',
        },
        {
          key: 4,
          value: '高清',
        },
        {
          key: 5,
          value: '流畅',
        },
      ],
      resolutions: [
        {
          key: 1,
          value: '240',
        },
        {
          key: 2,
          value: '320',
        },
        {
          key: 3,
          value: '480',
        },
        {
          key: 4,
          value: '720',
        },
        {
          key: 5,
          value: '960',
        },
      ],
    }
  },
  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId
    },
    medalId() {
      return this.$store.state.Config.medalId
    },
    recordDir() {
      return this.$store.state.Config.recordDir
    },
    recordDuringFormat() {
      return new Date(this.recordDuring).toISOString().substr(11, 8)
    },
    userCookie() {
      return this.$store.state.Config.userCookie
    },
    isWithCookie() {
      return this.$store.state.Config.isWithCookie
    },
    liveWindowId() {
      return this.$store.state.Config.liveWindowId
    },
    isLiveWindowAlwaysOnTop() {
      return this.$store.state.Config.isLiveWindowAlwaysOnTop
    },
    liveWindowOpacity() {
      return this.$store.state.Config.liveWindowOpacity * 100
    },
    liveWindowX() {
      return this.$store.state.Config.liveWindowX
    },
    liveWindowY() {
      return this.$store.state.Config.liveWindowY
    },
    liveWindowHeight() {
      return this.$store.state.Config.liveWindowHeight
    },
    liveVolume() {
      return this.$store.state.Config.liveVolume * 100
    },
    isRecording() {
      return this.$store.state.Config.isRecording
    },
  },
  async mounted() {
    const { data } = await getRecordState({ roomId: this.realRoomId })
    const { startAt, recordId, isRecording } = data
    this.$store.dispatch('UPDATE_CONFIG', {
      isRecording: isRecording,
    })

    if (isRecording) {
      this.recordDuring = Date.now() - startAt
      this.recordTimer = setInterval(() => {
        this.recordDuring = Date.now() - startAt
      }, 1000)
    }

    ws.addEventListener('message', this.onRecordMessage)

    if (this.liveWindowId) {
      const win = BrowserWindow.fromId(this.liveWindowId)
      if (win) {
        this.isShowLiveWindow = true
        this.win = win
      }
    }

    ipcRenderer.on(IPC_LIVE_WINDOW_CLOSE, () => {
      this.closeLiveWindow()
    })
  },
  beforeUnmount() {
    ws.removeEventListener('message', this.onRecordMessage)
  },
  methods: {
    onRecordMessage(msg) {
      const data = JSON.parse(msg.data)
      if (data.cmd === 'RECORD_RATE') {
        const { bps, totalSize } = data.payload
        this.downloadRate = parseDownloadRate(bps)
      }
      if (data.cmd === 'RECORD_END') {
      }
    },

    async startRecord() {
      try {
        const recordDir = this.recordDir || (await ipcRenderer.invoke(IPC_GET_EXE_PATH)) + '/record'
        const output = path.join(recordDir, `./${this.realRoomId}_${dateFormat(new Date(), 'YYYYMMDD_HHmmss')}.flv`)
        console.log(`record: OUTPUT: ${output}`)

        const { id } = await record({
          roomId: this.realRoomId,
          output: output,
          qn: qualityMap[this.recordQuality] || 400,
          withCookie: this.isWithCookie,
        })

        // emitter.on(`${id}-download-rate`, ({ bps, totalSize }) => {
        //   this.downloadRate = parseDownloadRate(bps)
        // })

        this.$store.dispatch('UPDATE_CONFIG', {
          isRecording: true,
        })
        const recordStartTime = Date.now()

        // setStatus({
        //   recordStartTime,
        //   isRecording: true,
        //   recordId: id,
        // })

        this.recordTimer = setInterval(() => {
          this.recordDuring = Date.now() - recordStartTime
        }, 1000)
      } catch (e) {
        console.log(e)
        this.$Message.error(`录制失败: ${e.message}`)
      }
    },
    async cancelRecord() {
      const { data } = await getRecordState({ roomId: this.realRoomId })
      const recordId = data.recordId
      if (!recordId) {
        console.warn(new Error('recordId not found.'))
        return
      }
      try {
        await cancelRecord({
          roomId: this.realRoomId,
          recordId,
        })
      } catch (e) {
        console.warn(e)
      }

      this.$store.dispatch('UPDATE_CONFIG', {
        isRecording: false,
      })

      // setStatus({
      //   recordStartTime: 0,
      //   isRecording: false,
      //   recordId: '',
      // })

      // emitter.removeAllListeners(`${recordId}-download-rate`)
      clearInterval(this.recordTimer)
      // emitter.emit('record-cancel')
    },
    async play() {
      const { data } = await getRandomPlayUrl({
        roomId: this.realRoomId,
        qn: qualityMap[this.playQuality] || 400,
        withCookie: this.isWithCookie,
      })
      const playUrl = data.url
      console.log(playUrl)

      if (this.isShowLiveWindow) {
        this.playWindowLive(playUrl)
        return
      }

      if (flvjs.isSupported()) {
        const livePlayer = document.getElementById('live-player')

        if (this.flvPlayer) {
          this.flvPlayer.destroy()
          this.flvPlayer = null
        }

        let headers
        if (this.isWithCookie && this.userCookie) {
          headers = {
            cookie: this.userCookie,
          }
        }
        this.flvPlayer = flvjs.createPlayer(
          {
            type: 'flv',
            isLive: true,
            url: playUrl,
            // cors: true,
            // withCredentials: this.isWithCookie && this.userCookie,
          },
          {
            headers,
            autoCleanupSourceBuffer: true,
          }
        )

        this.flvPlayer.on(flvjs.Events.ERROR, (e) => {
          this.$Message.error(`播放失败: ${e}`)
          console.log(e)
        })

        livePlayer.volume = (Number(this.liveVolume) || 100) / 100

        this.flvPlayer.attachMediaElement(livePlayer)
        this.flvPlayer.load()
        await this.flvPlayer.play()
      } else {
        console.error('flvjs not support')
      }
    },

    async playWindowLive(playUrl) {
      if (!playUrl) {
        const { data } = await getRandomPlayUrl({
          roomId: this.realRoomId,
          qn: qualityMap[this.playQuality] || 400,
          withCookie: this.isWithCookie,
        })
        playUrl = data.url
      }
      console.log(`windowId: ${this.liveWindowId}`)
      ipcRenderer.send(IPC_LIVE_WINDOW_PLAY, {
        windowId: this.liveWindowId,
        playUrl,
      })
    },

    changeRecordQuality(value) {
      this.recordQuality = value
    },

    changePlayQuality(value) {
      this.playQuality = value
    },

    async openRecordSaveFolderSelector() {
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
      })
      if (!result.canceled) {
        const recordDir = result.filePaths[0]
        this.$store.dispatch('UPDATE_CONFIG', {
          recordDir,
        })
        await this.$nextTick()
      }
    },

    async sendMessage() {
      if (!this.userCookie || !this.realRoomId || !this.message) return
      this.isSending = true
      try {
        const result = await sendComment(
          {
            message: this.message,
            roomId: this.realRoomId,
          },
          this.userCookie
        )
        if (result.data.message) {
          this.$Message.warning(`发送未成功: ${result.data.message}`)
          return
        }
        this.message = ''
      } catch (e) {
        this.$Message.error(`发送失败: ${e.message}`)
      } finally {
        this.isSending = false
      }
    },

    changeResolutions(value) {
      this.resolution = value
    },

    async getMedalData() {
      if (!this.userCookie) return
      this.getMedalDataLoading = true
      // 该接口会同时触发进入房间消息！
      const { data } = await getUserInfoInRoom(this.realRoomId)
      const { medal } = data || {}
      const { curr_weared, is_weared } = medal || {}
      if (!is_weared) {
        this.$Message.info('当前未佩戴粉丝牌')
        this.getMedalDataLoading = false
        return
      }
      const { medal_color_start, medal_color_end, medal_color_border, medal_name, level } = curr_weared
      this.medalData = {
        medalColorStart: parseHexColor(medal_color_start),
        medalColorEnd: parseHexColor(medal_color_end),
        medalColorBorder: parseHexColor(medal_color_border),
        medalName: medal_name,
        medalLevel: level,
      }
      this.getMedalDataLoading = false
    },

    async wearCurrentMedal() {
      if (!this.userCookie || !this.medalId) return
      this.isWearing = true
      try {
        const result = await wearMedal(this.medalId)
        this.medalData = null
        this.getMedalDataLoading = true
        setTimeout(async () => {
          await this.getMedalData()
          this.getMedalDataLoading = false
        }, 3000)
        if (result.data.code === 0) {
          this.$Message.success('佩戴成功')
        }
        if (result.data.code === -1) {
          this.$Message.error('佩戴失败')
        }
      } catch (e) {
        this.$Message.error(`${e.message}`)
      } finally {
        this.isWearing = false
      }
    },

    async withCookie(status) {
      this.$store.dispatch('UPDATE_CONFIG', {
        isWithCookie: status,
      })
    },

    async closeLiveWindow() {
      this.win = null
      this.isShowLiveWindow = false
      this.isShowLiveWindowLoading = false
    },

    changeAlwaysOnTop(status) {
      ipcRenderer.send(IPC_LIVE_WINDOW_ON_TOP, {
        windowId: this.liveWindowId,
        status,
      })
    },

    changeLiveWindowOpacity(number) {
      const data = {
        liveWindowOpacity: Number((number / 100).toFixed(2)),
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    changeLiveVolume(number) {
      const liveVolume = Number((number / 100).toFixed(2))
      const data = {
        liveVolume: liveVolume,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)

      const videoDOM = document.getElementById('live-player')
      videoDOM.volume = liveVolume
    },

    async showLiveWindow(status) {
      this.isShowLiveWindowLoading = true

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
          liveWindowId: win.id,
        })

        const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080/#/live-window` : `file://${__dirname}/index.html#live-window`

        win.loadURL(winURL)
        win.setIcon(nativeImage.createFromDataURL(icon))
        this.win = win
        this.isShowLiveWindow = true
        this.isShowLiveWindowLoading = false
      } else {
        this.closeLiveWindow()

        ipcRenderer.send(IPC_LIVE_WINDOW_CLOSE, {
          windowId: this.liveWindowId,
        })
      }
    },
    // onResize: function () {
    //   const liveWrapper = document.getElementById("live-wrapper");
    //   console.log( liveWrapper.clientHeight)
    //   this.videoHeight = liveWrapper.clientHeight - 70
    // },
  },
}
</script>

<style scoped>
#live-wrapper {
  user-select: none;
}
#live-config-wrapper {
  height: 105px;
}
.opcity-controller-slider {
  height: 30px;
  display: inline-block;
  vertical-align: bottom;
  width: 100px;
}
.volume-controller-slider {
  height: 35px;
  display: inline-block;
  width: 100px;
  vertical-align: middle;
}
.volume-icon {
  padding-right: 3px;
  font-size: 18px;
  vertical-align: middle;
  cursor: pointer;
}
.space-left-5px {
  margin-left: 5px;
}
</style>
