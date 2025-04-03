<template>
  <div id="home">
    <div id="title-bar">
      <div id="title-bar-title">
        <img id="title-bar-logo" src="../assets/logo.png" />
        <span id="title-bar-text">bilibili-danmaku</span>
      </div>
      <div id="title-bar-status">
        <span v-if="isRecording">录制中...</span>
      </div>
      <div id="title-bar-controller">
        <div id="tray" @click="hideToTray">
          <!-- <Icon type="ios-arrow-down" /> -->
          <Icon type="logo-windows" />
        </div>
        <div id="minimize" @click="minimize">
          <Icon type="md-remove" />
        </div>
        <div id="close" @click="close">
          <Icon type="md-close" />
        </div>
      </div>
    </div>
    <div class="header-container disable-user-select">
      <img class="header-background-img" :src="topPhoto" />

      <div class="user-info-container">
        <div class="avatar-wrapper">
          <Avatar :src="avatar || 'https://static.hdslb.com/images/member/noface.gif'" size="large" />
          <span class="username-label" :style="isConnected && { cursor: 'pointer' }" @click="openBiliLiveRoom">{{ username ? username : '未连接' }}</span>
          <span v-if="username" :class="liveStatus === 1 ? 'live-tag-on' : 'live-tag-off'">
            {{ liveStatus === 1 ? '直播中' : '未开播' }}
          </span>
        </div>

        <div class="status-wrapper">
          <div class="status-padding status-shadow">
            <Icon type="md-star" />
            <span class="header-icon-text"> 关注数 </span>
            {{ fansNumber }}
          </div>
          <div class="status-padding status-shadow">
            <Icon type="md-heart" />
            <span class="header-icon-text"> 粉丝团 </span>
            {{ fansClubNumber }}
          </div>
          <div class="status-padding status-shadow">
            <Icon class="status-shadow" type="md-eye" />
            <span class="header-icon-text"> 观看数 </span>
            {{ watchedNumber }}
          </div>
        </div>
        <div class="status-wrapper">
          <div class="status-padding">
            <Tooltip content="舰队">
              <Icon class="status-shadow" type="md-cog" />
            </Tooltip>
            <span class="space-left-2px status-shadow">{{ guardNumber }}</span>
          </div>
          <div class="status-padding">
            <Tooltip content="房间观众">
              <Icon class="status-shadow" type="md-person" />
            </Tooltip>
            <span class="space-left-2px status-shadow">{{ onlineNumber }}</span>
          </div>
          <div class="status-padding">
            <Poptip v-model="showLikeConfirm">
              <Icon class="status-shadow like-button" type="md-thumbs-up" />
              <template #content>
                我要给喜欢的主播点
                <InputNumber size="small" max="1000" min="1" :style="{ width: '50px' }" v-model="addlikeNumber"></InputNumber>
                次赞！
                <Button size="small" :disabled="!userCookie" @click="like">确定</Button>
              </template>
            </Poptip>
            <span class="space-left-2px status-shadow">{{ likeNumber }}</span>
          </div>
        </div>
        <div v-if="hasNewVersion" class="updater-wrapper">
          <template v-if="!isAppUpdating">
            <Button shape="circle" type="dashed" :loading="isAppUpdateStarting" @click="updateApp">
              <Icon type="md-arrow-round-up" color="green" />
              <span :style="{ color: 'green' }">更新</span>
            </Button>
          </template>
          <template v-else>
            <i-circle :percent="percent" :size="60" :style="{ top: '2px' }">
              <span class="demo-Circle-inner" style="font-size: 12px">{{ downloadRate }}</span>
            </i-circle>
          </template>
        </div>
      </div>
      <div class="room-controller-container transparent-mask">
        <div>
          <span>直播间号：</span>
          <AutoComplete clearable :model-value="displayRoomId" placeholder="请输入直播间号" size="small" :disabled="isConnected" style="width: 120px" @on-change="changeRoomId">
            <Option v-for="room in selfHistoryRooms" :key="room.roomId" :value="room.roomId">
              <Avatar :src="room.face || DEFAULT_AVATAR" size="small" />
              {{ `${room.uname} (${room.roomId})` }}
              <span :style="room.liveStatus === 1 ? { 'font-size': '12px', color: 'green' } : { 'font-size': '12px', color: 'silver' }">{{ room.liveStatus === 1 ? '直播中' : '未开播' }}</span>
              <Icon type="md-close" class="remove-history-room" @click="removeHistoryRoom(room)" />
            </Option>
          </AutoComplete>
          <span :style="{ 'padding-left': '10px' }">连接</span>
          <i-switch class="space-left-2px" :model-value="isConnected" :loading="isConnecting" :disabled="!displayRoomId" @on-change="connect" />
          <span :style="{ 'padding-left': '20px' }">弹幕窗</span>
          <i-switch class="space-left-2px" :model-value="isShowDanmakuWindow" :loading="isShowDanmakuWindowLoading" @on-change="showDanmakuWindow" />
          <template v-if="isShowDanmakuWindow">
            <span :style="{ 'padding-left': '20px' }">窗口置顶</span>
            <i-switch v-model="isAlwaysOnTop" @on-change="alwaysOnTop" />
          </template>
          <Tooltip placement="right" content="天选时刻中">
            <Icon v-if="isLottering" class="lottery-icon" type="md-cube" />
          </Tooltip>
          <!-- <Tooltip placement="right" content="天选时刻获奖">
              <Icon v-if="!isLottering && lotteryAwardUsers" type="md-cube" />
            </Tooltip> -->
        </div>
      </div>
    </div>

    <div class="main-container">
      <Layout :style="{ height: '100%' }">
        <Sider class="sider-bar" v-model="isCollapsed" collapsible :collapsed-width="78" :width="140">
          <Menu theme="light" width="auto" :class="menuitemClasses">
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
            <MenuItem name="1-6" to="/statistic">
              <Icon type="md-stats" />
              <span>统计</span>
            </MenuItem>
            <MenuItem name="1-7" to="/auto-reply">
              <Icon type="md-repeat" />
              <span>回复</span>
            </MenuItem>
            <MenuItem name="1-9" to="/danmaku-scroll">
              <Icon type="ios-water" />
              <span>弹幕2</span>
            </MenuItem>
            <MenuItem name="1-5" to="/lottery">
              <div :style="{ position: 'relative', display: 'inline-block' }">
                <Icon type="md-bonfire" />
                <div :style="{ position: 'absolute', right: '-25px', top: '-10px', 'font-size': '10px' }">beta</div>
              </div>
              <span>祈愿</span>
            </MenuItem>
            <MenuItem name="1-8" to="/command">
              <div :style="{ position: 'relative', display: 'inline-block' }">
                <!-- <Icon type="md-code" /> -->
                <Icon type="md-color-wand" />
                <div :style="{ position: 'absolute', right: '-25px', top: '-10px', 'font-size': '10px' }">beta</div>
              </div>
              <span>咒语</span>
            </MenuItem>
            <MenuItem name="1-10" to="/asr">
              <div :style="{ position: 'relative', display: 'inline-block' }">
                <Icon type="md-ionitron" />
                <div :style="{ position: 'absolute', right: '-25px', top: '-10px', 'font-size': '10px' }">beta</div>
              </div>
              <span>语音识别</span>
            </MenuItem>
            <MenuItem name="1-11" to="/config">
              <Icon type="md-settings" />
              <span>设置</span>
            </MenuItem>
            <MenuItem name="1-12" to="/help">
              <Icon type="md-help" />
              <span>帮助</span>
            </MenuItem>
          </Menu>
          <!-- <template #trigger>
            <Icon type="ios-arrow-forward" />
          </template> -->
        </Sider>
        <Layout>
          <div class="layout-content">
            <router-view :style="{ height: '100%' }" />
          </div>
        </Layout>
      </Layout>
    </div>
  </div>
</template>

<script>
import { isProxy, toRaw } from 'vue'
import { debounce } from 'lodash'
import { ipcRenderer, shell } from 'electron'
import path from 'path'
import { BrowserWindow, getCurrentWindow, Tray, nativeImage, Menu } from '@electron/remote'

import { parseDownloadRate, dateFormat } from '../../service/util'
import {
  connect as connectRoom,
  getRealTimeViewersCount,
  getRoomStatus,
  disconnect,
  updateSetting,
  getRoomInfoV2,
  getGuardInfo,
  getRoomInfoByIds,
  getUserInfoV2,
  record,
  cancelRecord,
  getRecordState,
  // getGiftConfig,
  addLike,
} from '../../service/api'
import { IPC_CHECK_FOR_UPDATE, IPC_UPDATE_AVAILABLE, IPC_DOWNLOAD_UPDATE, IPC_DOWNLOAD_PROGRESS, IPC_UPDATE_DOWNLOADED, MAX_HISTORY_ROOM, IPC_GET_EXE_PATH } from '../../service/const'
import ws from '../../service/ws'
import icon from '../assets/logo.png'
import { PORT } from '../../service/config-loader'

const synth = window.speechSynthesis

// 0 未开播
// 1 准备中（web开推流码）
// 2 直播中（obs开始推流）
let LIVE_STATUS = 0

export default {
  data() {
    return {
      displayRoomId: 0,
      isCollapsed: true,
      isShowDanmakuWindow: false,
      isShowDanmakuWindowLoading: false,
      isAlwaysOnTop: false,
      giftTimer: null,
      // peopleTimer: null,
      isConnecting: false,
      hasNewVersion: false,
      isAppUpdating: false,
      isAppUpdateStarting: false,
      isLottering: false,
      topPhoto: '',
      downloadRate: '0 KB/s',
      percent: 0,
      selfHistoryRooms: [],
      waitingSpeakers: [],
      showLikeConfirm: false,
      addlikeNumber: 1,

      username: '',
      avatar: null,
      ninkiNumber: 0,
      fansNumber: 0,
      fansClubNumber: 0,
      liveStatus: 0,
      // peopleNumber: 0,
      onlineNumber: 0,
      guardNumber: 0,
      roomUserId: 0,
      watchedNumber: 0,
      likeNumber: 0,
    }
  },
  computed: {
    menuitemClasses: function () {
      return ['menu-item', this.isCollapsed ? 'collapsed-menu' : '']
    },
    isConnected() {
      return this.$store.state.Config.isConnected || false
    },
    windowWidth() {
      return this.$store.state.Config.windowWidth
    },
    windowHeight() {
      return this.$store.state.Config.windowHeight
    },
    windowX() {
      return this.$store.state.Config.windowX
    },
    windowY() {
      return this.$store.state.Config.windowY
    },
    realRoomId() {
      return this.$store.state.Config.realRoomId
    },
    recordDir() {
      return this.$store.state.Config.recordDir
    },
    userCookie() {
      return this.$store.state.Config.userCookie
    },
    isWithCookie() {
      return this.$store.state.Config.isWithCookie
    },
    isAutoRecord() {
      return this.$store.state.Config.isAutoRecord
    },
    historyRooms() {
      return this.$store.state.Config.historyRooms
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
      return this.$store.state.Config.isWatchLottery
    },
    onTopLevel() {
      return this.$store.state.Config.onTopLevel
    },
    isOnTopForce() {
      return this.$store.state.Config.isOnTopForce
    },
    disableIgnoreMouseEvent() {
      return this.$store.state.Config.disableIgnoreMouseEvent
    },
    danmakuWindowId() {
      return this.$store.state.Config.danmakuWindowId
    },
    waitingSpeakerCount() {
      return this.$store.state.Config.waitingSpeakerCount
    },
    isRecording() {
      return this.$store.state.Config.isRecording
    },
  },
  watch: {
    async historyRooms(newValue, oldValue) {
      this.selfHistoryRooms = newValue
      if (newValue.length < oldValue.length) return
      await this.fillRoomLiveStatus(newValue)
    },
  },
  created() {},
  async mounted() {
    this.displayRoomId = this.realRoomId

    await this.initRoomInfo()

    ws.addEventListener('message', (msg) => {
      const payload = JSON.parse(msg.data)

      if (payload.cmd === 'ROOM_REAL_TIME_MESSAGE_UPDATE') {
        this.onFansNumber(payload.payload)
      }
      if (payload.cmd === 'NINKI') {
        this.onNinKi(payload.payload)
      }

      if (payload.cmd === 'LIVE') {
        // 直播中
        this.liveStatus = 1
        LIVE_STATUS++
        if (this.isAutoRecord && LIVE_STATUS === 2) {
          // 延时 5s 等待服务端延时
          setTimeout(() => {
            console.log('auto record start...')
            this.startRecord()
          }, 5000)
        }
        if (this.isAutoRecord && LIVE_STATUS > 2) {
          console.log('auto record restart...')
          this.cancelRecord()
          this.startRecord()
        }
      }

      if (payload.cmd === 'PREPARING') {
        // 未开播
        this.liveStatus = 0
        LIVE_STATUS = 0
        console.log('auto record stop...')
        this.cancelRecord()
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

      if (payload.cmd === 'GIFT_CONFIG') {
      }

      if (payload.cmd === 'DANMAKU_COMMAND_RESULT') {
        const { status, message, user } = payload.payload
        // if (status === 'success') {
        //   this.$Message.success(`禁言成功：${user.uname}`)
        // } else {
        //   this.$Message.error(`禁言失败`)
        // }
        // console.log(status, message, user)
      }

      if (payload.cmd === 'WATCHED_CHANGE') {
        const { watchedNumber } = payload.payload
        this.watchedNumber = watchedNumber
      }

      if (payload.cmd === 'SPEAK') {
        const { text, voice, speed } = payload.payload

        if (this.waitingSpeakers.length > this.waitingSpeakerCount) {
          // clear list
          this.waitingSpeakers = []
        }
        this.waitingSpeakers.push({ text, voice, speed })

        if (synth.speaking) {
          console.log('speaking...')
          return
        } else {
          this.speakerRunner()
        }

        // this.speak({ text, voice, speed })
      }

      if (payload.cmd === 'LIKE_CHANGE') {
        const { likeNumber } = payload.payload
        this.likeNumber = likeNumber
      }

      // if (payload.cmd === 'BILI_WS_CONNECT') {
      //   const { status } = payload.payload
      //   if (status === 'failed') {
      //     this.$Message.error('弹幕连接失败，请尝试更新或清空Cookie后重试连接...')
      //   }
      // }
      // if (payload.cmd === 'LOG_IN_NOTICE') {
      //   this.$Message.error('检测到B站用户名显示异常，尝试重新连接弹幕系统...')
      // }
    })

    ipcRenderer.once(IPC_UPDATE_AVAILABLE, () => {
      this.hasNewVersion = true
    })
    ipcRenderer.send(IPC_CHECK_FOR_UPDATE)

    // this.peopleTimer = setInterval(async () => {
    //   if (!this.realRoomId || !this.isConnected) return
    //   const result = await getRealTimeViewersCount({ roomId: this.realRoomId })
    //   this.peopleNumber = result.data
    // }, 10000)

    // 刷新舰长数 间隔1分钟
    this.guardNumberTimer = setInterval(() => {
      if (!this.isConnected || !this.realRoomId || !this.roomUserId) return

      getGuardInfo(this.realRoomId, this.roomUserId)
        .then((result) => {
          this.guardNumber = result.data.info.num
        })
        .catch((e) => {
          console.error('get guard info failed')
        })
    }, 60000)

    const { data } = await getRecordState({ roomId: this.realRoomId })
    this.$store.dispatch('UPDATE_CONFIG', {
      isRecording: data?.isRecording,
    })

    await this.fillRoomLiveStatus(this.historyRooms)

    setTimeout(() => {
      this.$global.voices = synth.getVoices()
    }, 500)
  },
  beforeUnmount() {
    if (this.giftTimer) {
      clearInterval(this.giftTimer)
    }
    // if (this.peopleTimer) {
    //   clearInterval(this.peopleTimer)
    // }
  },
  methods: {
    async connect(status) {
      this.isConnecting = true
      const data = await this.initRoomInfo(status)

      if (status && this.displayRoomId) {
        // const { data } = await getRoomInfoV2(this.displayRoomId);
        if (!data) {
          this.$Message.error('连接失败')
          this.isConnecting = false
          return
        }

        const { uid, room_id: roomId, live_status: liveStatus } = data.room_info
        const { uname, face, gender } = data.anchor_info.base_info

        await connectRoom({ roomId: Number(roomId), uid: uid || 0 })

        const config = {
          isConnected: status,
        }
        this.$store.dispatch('UPDATE_CONFIG', config)

        const { data: recordData } = await getRecordState({
          roomId: this.realRoomId,
        })
        const isRecording = recordData?.isRecording
        this.$store.dispatch('UPDATE_CONFIG', {
          isRecording: isRecording,
        })
        if (liveStatus === 1 && this.isAutoRecord && !isRecording) {
          LIVE_STATUS = 2
          this.startRecord()
        }

        // 加入历史连接房间号
        if (!this.historyRooms.find((room) => room.roomId === roomId)) {
          let historyRooms = this.historyRooms.map((room) => toRaw(room))
          historyRooms = [...(historyRooms.length > MAX_HISTORY_ROOM ? historyRooms.slice(1) : historyRooms), { roomId, uname, face }]
          this.$store.dispatch('UPDATE_CONFIG', {
            historyRooms,
          })
        }
      } else {
        await disconnect({ roomId: this.displayRoomId })
      }
      this.isConnecting = false
    },

    async initRoomInfo(status) {
      let isConnected

      let win
      if (this.danmakuWindowId) {
        win = BrowserWindow.fromId(this.danmakuWindowId)
      }

      if (win) {
        this.win = win
        this.danmakuWindowBindEvent()
        this.isShowDanmakuWindow = true
      }

      if (status === true) {
        isConnected = true
      } else if (status === false) {
        isConnected = false
      } else {
        const result = await getRoomStatus({ roomId: this.realRoomId })
        isConnected = result.data.isConnected
      }
      if (isConnected) {
        const { data } = await getRoomInfoV2(this.displayRoomId)
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
        } = data.room_info

        const { uname, face, gender } = data.anchor_info.base_info
        const { level, level_color } = data.anchor_info.live_info
        const { attention } = data.anchor_info.relation_info
        const { medal_name, medal_id, fansclub } = data.anchor_info.medal_info || {}
        const { num: watchedNumber } = data.watched_show || {}
        const { total_likes: likeNumber } = data.like_info_v3 || {}
        const onlineNumber = data.room_rank_info?.user_rank_entry?.user_contribution_rank_entry?.count || 0

        this.username = uname
        this.avatar = face
        this.ninkiNumber = online
        this.fansNumber = attention
        this.fansClubNumber = fansclub || 0
        this.liveStatus = liveStatus
        this.roomUserId = uid
        this.watchedNumber = watchedNumber
        this.likeNumber = likeNumber
        this.onlineNumber = onlineNumber

        try {
          const { data: userInfo } = await getUserInfoV2(uid)
          console.log(userInfo)
          const {
            // face,
            pendant, // 头像框 { image, image_enhance }
            top_photo,
          } = userInfo

          this.topPhoto = top_photo
        } catch (e) {
          console.log(e)
        }

        // 传递 当前主播userId
        await updateSetting({
          roomUserId: uid,
        })
        getGuardInfo(roomId, uid).then((guardInfo) => {
          this.guardNumber = guardInfo.data.info.num
        })

        const config = {
          isConnected: true,
          realRoomId: roomId,
          displayRoomId: this.displayRoomId, // 输入的roomId，仅作为保留输入框值用
          medalId: medal_id,
          medalName: medal_name,
        }
        this.$store.dispatch('UPDATE_CONFIG', config)

        return data
      } else {
        this.username = ''
        this.avatar = null
        this.ninkiNumber = 0
        this.fansNumber = 0
        this.fansClubNumber = 0
        this.liveStatus = 0
        // this.peopleNumber = 0
        this.onlineNumber = 0
        this.guardNumber = 0
        this.topPhoto = ''
        this.watchedNumber = 0
        this.likeNumber = 0

        this.$store.dispatch('UPDATE_CONFIG', {
          isConnected: false,
        })
      }
    },

    showDanmakuWindow(status) {
      // const { x, y } = screen.getCursorScreenPoint();
      this.isShowDanmakuWindowLoading = true

      if (status) {
        const win = new BrowserWindow({
          width: this.windowWidth || 480,
          height: this.windowHeight || 540,
          // x, y,
          x: this.windowX || 0,
          y: this.windowY || 0,
          frame: false,
          transparent: true,
          hasShadow: false,
          // webPreferences: {
          //   nodeIntegration: true,
          // },
          resizable: true,
        })

        this.$store.dispatch('UPDATE_CONFIG', {
          danmakuWindowId: win.id,
        })

        // const winURL =
        //   process.env.NODE_ENV === "development"
        //     ? `http://localhost:9080/#/danmaku-window`
        //     : `file://${__dirname}/index.html#danmaku-window`;

        const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:${PORT}?port=${PORT}&roomId=${this.realRoomId}` : `http://localhost:${PORT}?port=${PORT}&roomId=${this.realRoomId}`
        win.setIcon(nativeImage.createFromDataURL(icon))
        win.loadURL(winURL)
        this.win = win
        this.danmakuWindowBindEvent()
        this.isShowDanmakuWindow = true
        this.isShowDanmakuWindowLoading = false
      } else {
        if (!this.win) return
        try {
          this.win.close()
        } catch (e) {
          console.log('Close danmaku window error', e)
        }
        this.clearDanmakuWindowInfo()
      }
    },

    danmakuWindowBindEvent() {
      if (!this.win) return
      this.win.on('close', (e) => {
        if (!this.win) return
        this.$store.dispatch('UPDATE_CONFIG', {
          danmakuWindowId: null,
        })
        // clear
        if (this.checkOnTopInterval) {
          clearInterval(this.checkOnTopInterval)
          this.checkOnTopInterval = null
        }
        this.win = null
        this.isShowDanmakuWindow = false
        this.isShowDanmakuWindowLoading = false
      })

      this.win.on(
        'resize',
        debounce(() => {
          const [width, height] = this.win.getSize()
          this.$store.dispatch('UPDATE_CONFIG', {
            windowWidth: width,
            windowHeight: height,
          })
        }, 200)
      )

      this.win.on(
        'move',
        debounce(() => {
          const [x, y] = this.win.getPosition()
          this.$store.dispatch('UPDATE_CONFIG', {
            windowX: x,
            windowY: y,
          })
        }, 200)
      )
    },

    clearDanmakuWindowInfo() {
      this.$store.dispatch('UPDATE_CONFIG', {
        danmakuWindowId: null,
      })
      // clear
      if (this.checkOnTopInterval) {
        clearInterval(this.checkOnTopInterval)
        this.checkOnTopInterval = null
      }
      this.win = null
      this.isShowDanmakuWindow = false
      this.isShowDanmakuWindowLoading = false
    },

    alwaysOnTop(status) {
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
      // this.win.setFullScreenable(false)

      // 如果鼠标穿透 或者 取消置顶时，设置ignore
      if (!this.disableIgnoreMouseEvent || !status) {
        this.win.setIgnoreMouseEvents(status, { forward: true })
      }
      this.$store.dispatch('UPDATE_CONFIG', {
        isAlwaysOnTop: status,
      })
    },

    changeRoomId(roomId) {
      try {
        if (typeof roomId === 'string') {
          roomId = roomId.replace(/[^\d]/g, '')
        }
      } catch (e) {
        this.$Message.warning('请输入正确数字')
      }
      this.displayRoomId = roomId
    },

    onFansNumber(payload) {
      const { fansNumber, fansClubNumber } = payload
      this.fansNumber = fansNumber
      this.fansClubNumber = fansClubNumber
    },

    onNinKi(payload) {
      const { ninkiNumber } = payload
      this.ninkiNumber = ninkiNumber
    },

    async updateApp() {
      ipcRenderer.send(IPC_DOWNLOAD_UPDATE)
      this.isAppUpdateStarting = true

      ipcRenderer.on(IPC_DOWNLOAD_PROGRESS, (event, args) => {
        this.isAppUpdating = true

        // bytesPerSecond: 63694
        // delta: 82001
        // percent: 17.95023024398921
        // total: 59005232
        // transferred: 10591575
        const { bytesPerSecond, delta, percent, total, transferred } = args.progress
        this.downloadRate = parseDownloadRate(bytesPerSecond)
        this.percent = Number(percent).toFixed(0)
      })

      // 更新会退出应用，不监听也可以
      ipcRenderer.once(IPC_UPDATE_DOWNLOADED, () => {
        ipcRenderer.removeAllListeners(IPC_DOWNLOAD_PROGRESS)
        this.isAppUpdating = false
        this.isAppUpdateStarting = false
      })
    },

    async startRecord() {
      try {
        if (!this.realRoomId) {
          throw new Error('roomId required.')
        }

        const recordDir = this.recordDir || (await ipcRenderer.invoke(IPC_GET_EXE_PATH)) + '/record'
        const output = path.join(recordDir, `./${roomId}_${dateFormat(new Date(), 'YYYYMMDD_HHmmss')}.flv`)
        console.log(`record: OUTPUT: ${output}`)

        const { data } = await record({
          roomId: this.realRoomId,
          output: output,
          qn: 10000,
          withCookie: this.isWithCookie,
        })
        this.$store.dispatch('UPDATE_CONFIG', {
          isRecording: true,
        })
      } catch (e) {
        this.$Message.error(`录制失败: ${e.message}`)
      }
    },
    async cancelRecord() {
      const { data } = await getRecordState({
        roomId: this.realRoomId,
      })
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
    },

    removeHistoryRoom(room) {
      const historyRooms = this.historyRooms.filter((e) => e.roomId !== room.roomId)
      this.$store.dispatch('UPDATE_CONFIG', {
        historyRooms: historyRooms,
      })
    },

    async fillRoomLiveStatus(rooms) {
      const { data } = await getRoomInfoByIds(rooms.map((room) => room.roomId))
      this.selfHistoryRooms = rooms.map((room) => {
        // room.liveStatus = data[room.roomId].live_status
        return {
          ...room,
          liveStatus: data[room.roomId].live_status,
        }
      })
    },

    openBiliLiveRoom() {
      if (!this.isConnected || !this.realRoomId) return
      shell.openExternal(`https://live.bilibili.com/${this.realRoomId}`)
    },

    // fix: say.js 使用cp调用shell放声音，导致声音控制器单独出shell通道，无法通过本进程控制音量
    // auto rule -> backend -> if(speak) -> send ws to client -> this function
    speak({ text, voice, speed }) {
      if (synth.speaking) return
      const utterThis = new SpeechSynthesisUtterance()
      utterThis.text = text
      if (voice) {
        const voiceInstance = this.$global.voices.find((v) => v.name === voice)
        utterThis.voice = voiceInstance
      }
      if (speed) {
        utterThis.rate = speed
      }
      synth.speak(utterThis)
    },

    speakerRunner() {
      const speaker = this.waitingSpeakers.shift()
      if (!speaker) return

      const { text, voice, speed } = speaker
      const utterThis = new SpeechSynthesisUtterance()
      utterThis.text = text
      if (voice) {
        const voiceInstance = this.$global.voices.find((v) => v.name === voice)
        utterThis.voice = voiceInstance
      }
      if (speed) {
        utterThis.rate = speed
      }
      utterThis.onend = () => {
        console.log('speak end...')
        this.speakerRunner()
      }

      synth.speak(utterThis)
      // this.speak(speaker)
      // this.speakRunner()
    },

    close() {
      const win = getCurrentWindow()
      win.close()
    },

    minimize() {
      const win = getCurrentWindow()
      win.minimize()
    },

    hideToTray() {
      const win = getCurrentWindow()
      win.hide()
      const tray = new Tray(nativeImage.createFromDataURL(icon))
      const func = () => {
        win.show()
        tray.destroy()
      }
      tray.on('click', func)
      const contextMenu = Menu.buildFromTemplate([
        {
          label: '显示',
          type: 'normal',
          click: func,
        },
        { label: '关闭', role: 'quit', type: 'normal' },
      ])
      tray.setToolTip('bilibili-danmaku')
      tray.setContextMenu(contextMenu)
    },

    async like() {
      await addLike({
        roomId: this.realRoomId,
        ruid: this.roomUserId,
        count: this.addlikeNumber || 1,
      })
      this.showLikeConfirm = false
    },
  },
}
</script>

<style>
.ivu-layout-sider-trigger {
  background: white;
}

.ivu-layout-sider {
  background: white;
}

.ivu-layout-sider-trigger-icon {
  color: #515a6e;
}
</style>

<style scoped>
#home {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#title-bar {
  height: 35px;
  -webkit-app-region: drag;
  flex: 0 0 auto;
  /* background: seashell; */
}

#title-bar-title {
  height: 35px;
  position: relative;
  width: 150px;
  display: inline-block;
}

#title-bar-logo {
  left: 10px;
  width: 25px;
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
}

#title-bar-text {
  left: 40px;
  height: 20px;
  position: absolute;
  color: gray;
  top: 0;
  bottom: 0;
  margin: auto;
  vertical-align: middle;
}

#title-bar-status {
  height: 35px;
  display: inline-block;
  vertical-align: top;
  position: relative;
  width: 150px;
}

#title-bar-status > span {
  display: inline-block;
  height: 16px;
  position: absolute;
  font-size: 12px;
  color: gray;
  top: 0;
  bottom: 0;
  margin: auto;
}

#title-bar-controller {
  top: 0px;
  right: 0px;
  height: 35px;
  position: absolute;
  line-height: 35px;
  font-size: 20px;
  font-weight: light;
  -webkit-app-region: no-drag;
}

#close {
  display: inline-block;
  width: 45px;
  text-align: center;
}

#close:hover {
  transition: background-color 0.2s ease, color 0.2s ease;
  background-color: crimson;
  color: aliceblue;
}

#minimize {
  display: inline-block;
  width: 45px;
  text-align: center;
}

#minimize:hover {
  transition: background-color 0.2s ease;
  background-color: aliceblue;
}

#tray {
  display: inline-block;
  width: 45px;
  text-align: center;
}

#tray:hover {
  transition: background-color 0.2s ease;
  background-color: aliceblue;
}

.header-container {
  flex: 0 0 auto;
  background: ghostwhite;
}

.main-container {
  flex: 1 1 auto;
  overflow: auto;
  z-index: 1;
}

.avatar-wrapper {
  display: inline-block;
  vertical-align: top;
}

.header-icon-text {
  font-size: 12px;
}

.status-wrapper {
  vertical-align: top;
  display: inline-block;
  line-height: 0px;
  padding: 6px 0 0 20px;
}

.status-padding {
  padding: 5px 25px 5px 10px;
}

.status-shadow {
  /* background: radial-gradient(farthest-side, white 20%, rgba(0, 0, 0, 0) 100%); */
  text-shadow: white 1px 0 2px, white 0 1px 2px, white -1px 0 2px, white 0 -1px 2px;
}

.updater-wrapper {
  height: 64px;
  position: absolute;
  top: 0px;
  right: 10px;
}

.user-info-container {
  height: 84px;
  line-height: 84px;
  /* background: white; */
  position: relative;
  margin: 0 60px;
}

.room-controller-container {
  position: relative;
  height: 48px;
  line-height: 48px;
  padding: 0 60px;
}

.layout-content {
  height: 100%;
  width: 100%;
  background: white;
  position: relative;
}

/* .ivu-btn-dashed {
  border-color: green;
} */
.ivu-layout-sider {
  width: 150px;
  min-width: 150px;
  max-width: 150px;
  flex: 0 0 150px;
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
  content: '';
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

.header-background-img {
  position: absolute;
  width: 100%;
  min-width: 950px;
}

.live-tag-on {
  border: 1px solid mediumseagreen;
  border-radius: 8px;
  height: 22px;
  padding: 3px 5px;
  margin-left: 5px;
  background: rgba(255, 255, 255, 0.2);
}

.live-tag-off {
  border: 1px solid gray;
  border-radius: 8px;
  height: 22px;
  padding: 3px 5px;
  margin-left: 5px;
}

.transparent-mask {
  background: linear-gradient(to top, white, rgba(0, 0, 0, 0));
}

.username-label {
  padding: 5px 15px;
  /* background: radial-gradient(farthest-side, rgba(255, 255, 255, 0.8) 60%, rgba(0, 0, 0, 0) 100%); */
  text-shadow: white 1px 0 2px, white 0 1px 2px, white -1px 0 2px, white 0 -1px 2px;
}

.space-left-2px {
  margin-left: 2px;
}

.sider-bar {
  overflow-y: auto;
}

.sider-bar::-webkit-scrollbar {
  display: none;
}

.like-button {
  cursor: pointer;
}
</style>
