<template>
  <div class="container" :style="{ opacity: liveWindowOpacity }">
    <video id="live-player" :style="{ height: `${videoHeight}px` }" />
    <div class="bottom-container">
      <div class="danmaku-container">
        <Input v-model="message" placeholder="弹幕..." clearable :style="{ width: '360px' }" @on-keyup.ctrl.enter="sendMessage" />
        <Tooltip placement="top">
          <Button :style="{ 'margin-left': '3px' }" :disabled="!message || !userCookie || !realRoomId" :loading="isSending" @click="sendMessage">发送</Button>
          <template #content>
            <div :style="{ color: 'pink', 'white-space': 'normal' }">
              <p>快捷键: ctrl + enter</p>
            </div>
          </template>
        </Tooltip>
      </div>
    </div>
    <!-- <Icon type="md-menu" /> -->
  </div>
</template>

<script>
import { debounce } from 'lodash'
import { ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
import * as flvjs from 'flv.js'
import { IPC_LIVE_WINDOW_CLOSE, IPC_LIVE_WINDOW_PLAY, IPC_LIVE_WINDOW_ON_TOP } from '../../service/const'
import { sendMessage } from '../../service/bilibili-api'
const win = getCurrentWindow()

export default {
  data() {
    return {
      flvPlayer: null,
      videoHeight: 0,
      checkOnTopInterval: null,
      message: '',
    }
  },
  computed: {
    liveWindowOpacity() {
      return this.$store.state.Config.liveWindowOpacity
    },
    isOnTopForce() {
      return this.$store.state.Config.isOnTopForce
    },
    disableIgnoreMouseEvent() {
      return this.$store.state.Config.disableIgnoreMouseEvent
    },
    onTopLevel() {
      return this.$store.state.Config.onTopLevel
    },
    realRoomId() {
      return this.$store.state.Config.realRoomId
    },
    userCookie() {
      return this.$store.state.Config.userCookie
    },
    liveVolume() {
      return this.$store.state.Config.liveVolume
    },
  },
  watch: {
    liveVolume(newValue) {
      const videoDOM = document.getElementById('live-player')
      videoDOM.volume = newValue
    },
  },
  beforeCreate() {
    document.getElementsByTagName('body')[0].setAttribute('style', 'background-color:rgba(0,0,0,0);')
  },
  mounted() {
    const [, height] = win.getSize()
    this.videoHeight = height
    console.log(`live window id: ${win.id}`)

    win.on(
      'resize',
      debounce(() => {
        const [width, height] = win.getSize()
        this.$store.dispatch('UPDATE_CONFIG', {
          liveWindowHeight: height,
        })
        this.videoHeight = height
      }, 500)
    )

    win.on(
      'move',
      debounce(() => {
        const [x, y] = win.getPosition()
        this.$store.dispatch('UPDATE_CONFIG', {
          liveWindowX: x,
          liveWindowY: y,
        })
      }, 500)
    )

    document.addEventListener('keyup', function (e) {
      if (e.key === 'Escape') {
        this.closeLiveWindow()
        ipcRenderer.send(IPC_LIVE_WINDOW_CLOSE)
      }
    })

    ipcRenderer.on(IPC_LIVE_WINDOW_PLAY, (event, args) => {
      this.play({ playUrl: args.playUrl })
    })

    ipcRenderer.on(IPC_LIVE_WINDOW_CLOSE, () => {
      this.closeLiveWindow()
    })

    ipcRenderer.on(IPC_LIVE_WINDOW_ON_TOP, (event, args) => {
      this.changeAlwaysOnTop(args.status)
    })
  },
  methods: {
    async play({ playUrl }) {
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
        },
        {
          headers,
          autoCleanupSourceBuffer: true,
        }
      )

      this.flvPlayer.on(flvjs.Events.ERROR, (e) => {
        this.$Message.error(`播放失败: ${e}`)
      })

      livePlayer.volume = this.liveVolume
      this.flvPlayer.attachMediaElement(livePlayer)
      this.flvPlayer.load()
      await this.flvPlayer.play()

      this.resize(livePlayer.offsetWidth, livePlayer.offsetHeight)
    },

    resize(width, height) {
      if (!win) return
      win.setSize(width, height)
      win.setAspectRatio(width / height)
    },

    changeAlwaysOnTop(status) {
      win.setFocusable(!status)
      // this.win.setVisibleOnAllWorkspaces(true)
      if (this.isOnTopForce && status) {
        this.checkOnTopInterval = setInterval(() => {
          if (!win) return
          win.moveTop()
        }, 1000)
      } else if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      win.setAlwaysOnTop(status, this.onTopLevel)
      // this.win.setFullScreenable(false)
      // 如果鼠标穿透 或者 取消置顶时，设置ignore
      if (!this.disableIgnoreMouseEvent || !status) {
        win.setIgnoreMouseEvents(status, { forward: true })
      }
      this.$store.dispatch('UPDATE_CONFIG', {
        isLiveWindowAlwaysOnTop: status,
      })
    },

    closeLiveWindow() {
      if (!win) return

      if (this.flvPlayer) {
        this.flvPlayer.destroy()
        this.flvPlayer = null
      }

      this.$store.dispatch('UPDATE_CONFIG', {
        liveWindowId: null,
        isLiveWindowAlwaysOnTop: false,
      })
      // clear
      if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }

      win.close()
    },

    async sendMessage() {
      if (!this.userCookie || !this.realRoomId || !this.message) return
      this.isSending = true
      try {
        const result = await sendMessage(
          {
            message: this.message,
            roomId: this.realRoomId,
            color: 16777215,
            fontsize: 25,
            mode: 1,
            bubble: 0,
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
  },
}
</script>

<style scoped>
.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background: rgba(0, 0, 0, 0.3);
  -webkit-app-region: drag;
  user-select: none;
  overflow: hidden;
}
.container:hover > .bottom-container {
  opacity: 1;
}
.danmaku-container {
  margin: auto;
  width: 500px;
  left: 0;
  right: 0;
}
.bottom-container {
  position: absolute;
  bottom: 3px;
  width: 100%;
  opacity: 0;
  -webkit-app-region: no-drag;
}
</style>
