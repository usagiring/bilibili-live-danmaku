<template>
  <div id="home">
    <!-- 标题栏 -->
    <div id="title-bar">
      <div id="title-bar-title">
        <img
          id="title-bar-logo"
          src="../assets/logo.png" />
        <span id="title-bar-text">Bilive</span>
      </div>
      <div id="title-bar-status"></div>
      <div id="title-bar-controller">
        <div
          id="window"
          @click="showWindowList = true"
          ref="windowBtnRef">
          <Icon type="md-desktop" />
          <span
            v-if="dmWindows.length"
            class="window-badge"
            >{{ dmWindows.length }}</span
          >
        </div>
        <div
          id="tray"
          @click="hideToTray">
          <Icon type="md-arrow-dropdown" />
        </div>
        <div
          id="minimize"
          @click="minimize">
          <Icon type="md-remove" />
        </div>
        <div
          id="close"
          @click="close">
          <Icon type="md-close" />
        </div>
      </div>
    </div>

    <!-- 主体两栏 -->
    <div class="main-body">
      <!-- 左侧：直播间列表 -->
      <div
        class="room-panel"
        :class="{ collapsed: isRoomPanelCollapsed }">
        <template v-if="!isRoomPanelCollapsed">
          <div class="room-panel-header">
            <h3>直播间</h3>
            <div class="add-room-wrapper">
              <button
                ref="addRoomBtn"
                class="add-room-btn"
                title="添加直播间"
                @click.stop="toggleAddRoom">
                <Icon type="md-add" />
              </button>
            </div>
            <!-- 弹出面板（Teleport 到 body 避免被裁剪） -->
            <Teleport to="body">
              <div
                v-if="showAddRoom"
                class="add-room-popover"
                :style="popoverStyle"
                @click.stop>
                <div class="popover-label">直播间号</div>
                <Input
                  v-model="newRoomId"
                  placeholder="请输入直播间号"
                  size="small"
                  @on-enter="handleAddRoom" />
                <div class="popover-actions">
                  <Button
                    size="small"
                    @click="showAddRoom = false"
                    >取消</Button
                  >
                  <Button
                    size="small"
                    type="primary"
                    @click="handleAddRoom"
                    >连接</Button
                  >
                </div>
              </div>
            </Teleport>
            <span style="flex: 1"></span>
          </div>
          <div class="room-list">
            <div
              v-for="(room, index) in store.rooms"
              :key="index"
              class="room-card"
              :class="{ active: room.isActive, connect: room.isConnected }"
              @click="selectRoom(index)">
              <img
                class="room-avatar"
                :src="room.face || DEFAULT_FACE" />
              <div class="room-info">
                <div class="room-name">{{ room.username || '未连接' }}</div>
                <div class="room-id">
                  直播间 {{ room.displayId || room.id }}
                  <span
                    v-if="room.liveStatus === 1"
                    class="live-bars">
                    <i class="bar bar1"></i><i class="bar bar2"></i><i class="bar bar3"></i>
                  </span>
                </div>
              </div>
              <button
                class="delete-btn"
                @click.stop="removeRoom(index)">
                <Icon type="md-close" />
              </button>
            </div>

            <!-- 空状态 -->
            <div
              v-if="store.rooms.length === 0"
              class="empty-rooms">
              <Icon
                type="md-add-circle"
                size="32"
                style="color: #ddd" />
              <p>点击 + 添加直播间</p>
            </div>
          </div>
          <!-- 左下角设置栏 -->
          <div
            class="config-bar"
            @click="toConfigTab">
            <Icon
              type="md-settings"
              size="16" />
            <span>设置</span>
          </div>
        </template>
        <!-- 缩进切换按钮 - 右侧 -->
        <div
          class="panel-toggle"
          @click="toggleRoomPanel"
          :title="isRoomPanelCollapsed ? '展开侧栏' : '收起侧栏'">
          <span class="hamburger"> <i></i><i></i><i></i> </span>
        </div>
      </div>

      <!-- 右侧：详情区 -->
      <div class="detail-panel">
        <!-- 配置页占满整个右侧 -->
        <Config v-if="activeTab === 'config'" />

        <!-- 概览：需要活动房间 -->
        <template v-else-if="store.activeRoom">
          <!-- Banner 包裹区：用户信息 + 连接 + 路由 -->
          <div class="detail-banner">
            <!-- 默认banner "https://i0.hdslb.com/bfs/activity-plat/static/0977767b2e79d8ad0a36a731068a83d7/1sz3p8w2Sk.png" -->
            <img
              class="banner-bg"
              :src="activeRoom?.userSpaceBanner || ''" />
            <div class="banner-overlay">
              <!-- 用户信息 + 连接 -->
              <div class="banner-profile">
                <div class="banner-profile-row">
                  <img
                    class="banner-avatar"
                    :src="activeRoom?.face || DEFAULT_FACE" />
                  <div class="banner-info">
                    <div class="banner-name">{{ activeRoom?.username || '未连接' }}</div>
                    <div class="banner-id">
                      直播间 {{ activeRoom?.displayId || activeRoom?.id }}
                      <span
                        v-if="activeRoom?.liveStatus === 1"
                        class="live-bars">
                        <i class="bar bar1"></i><i class="bar bar2"></i><i class="bar bar3"></i>
                      </span>
                    </div>
                  </div>
                </div>
                <div class="banner-actions">
                  <label class="switch">
                    <input
                      type="checkbox"
                      :checked="activeRoom?.isConnected"
                      :disabled="connecting"
                      @change="toggleConnect" />
                    <span class="slider">
                      <span class="slider-text on">已连接</span>
                      <span class="slider-text off">未连接</span>
                    </span>
                  </label>
                  <Button
                    class="btn-danmaku"
                    size="small"
                    @click="handleShowDanmaku()">
                    <Icon
                      type="md-chatboxes"
                      size="13" />
                    弹幕窗
                  </Button>
                  <Button
                    class="btn-danmaku"
                    size="small"
                    @click="handleShowRawDanmaku()">
                    <Icon
                      type="md-text"
                      size="13" />
                    仿原弹幕窗
                  </Button>
                  <Button
                    class="btn-danmaku"
                    size="small"
                    @click="handleShowLiveWindow()">
                    <Icon
                      type="md-play"
                      size="13" />
                    直播窗
                  </Button>
                  <Button
                    class="btn-danmaku"
                    size="small"
                    @click="handleToggleRecord()">
                    <Icon
                      :type="isRecording ? 'md-square' : 'md-recording'"
                      size="13" />
                    {{ isRecording ? '停止录制' : '录制' }}
                  </Button>
                </div>
              </div>
              <!-- Tab 导航 -->
              <div class="room-tabs">
                <div
                  class="room-tab"
                  :class="{ active: activeTab === 'overview' }"
                  @click="activeTab = 'overview'">
                  <Icon type="md-home" /> 概览
                </div>
                <div
                  class="room-tab"
                  :class="{ active: activeTab === 'message' }"
                  @click="activeTab = 'message'">
                  <Icon type="md-chatboxes" /> 弹幕
                </div>
                <div
                  class="room-tab"
                  :class="{ active: activeTab === 'vote' }"
                  @click="activeTab = 'vote'">
                  <Icon type="md-stats" /> 投票
                </div>
                <div
                  class="room-tab"
                  :class="{ active: activeTab === 'stats' }"
                  @click="activeTab = 'stats'">
                  <Icon type="md-podium" /> 统计
                </div>
                <div
                  class="room-tab"
                  :class="{ active: activeTab === 'autoreply' }"
                  @click="activeTab = 'autoreply'">
                  <Icon type="md-chatbubbles" /> 回复
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 内容区 -->
          <div class="tab-content">
            <OverviewPanel v-if="activeTab === 'overview'" />
            <Message v-if="activeTab === 'message'" />
            <Vote v-if="activeTab === 'vote'" />
            <Stats v-if="activeTab === 'stats'" />
            <AutoReply v-if="activeTab === 'autoreply'" />
          </div>
        </template>

        <!-- 空状态（无房间时） -->
        <div
          class="empty-state"
          v-else>
          <Icon
            type="md-home"
            size="48"
            style="opacity: 0.15" />
          <p>选择或添加一个直播间</p>
        </div>
      </div>
    </div>

    <Modal
      v-model="showWindowList"
      width="320"
      :footer-hide="true"
      :closable="false"
      class="window-list-modal">
      <div
        v-if="!dmWindows.length"
        style="text-align: center; padding: 20px; color: #ccc; font-size: 13px">
        暂无弹幕窗口
      </div>
      <div
        v-for="win in dmWindows"
        :key="win.id"
        class="modal-window-item"
        @click="focusWindow(win.id)">
        <Icon
          type="md-desktop"
          size="16"
          color="#2d8cf0" />
        <span class="modal-window-label">{{ winTypeLabel(win.type) }} #{{ win.id }}</span>
        <span class="modal-window-room">直播间 {{ win.roomId }}</span>
        <span
          class="modal-window-close"
          @click.stop="closeDmWindow(win.id)">
          <Icon
            type="md-close"
            size="14" />
        </span>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useConfigStore } from '../store'
import { IPC_WINDOW_ACTION, IPC_WINDOW_CREATE, IPC_WINDOW_FIND, IPC_WINDOW_CLOSE, IPC_GET_EXE_PATH } from '../../service/const'
import OverviewPanel from './OverviewPanel.vue'
import Message from './Message.vue'
import Config from './Config.vue'
import Vote from './Vote.vue'
import Stats from './Stats.vue'
import AutoReply from './AutoReply.vue'
import {
  connect as connectApi,
  disconnect as disconnectApi,
  updateClientConfig,
  getRoomInfoV2,
  getUserInfoV2,
  record,
  cancelRecord,
  getRecordState,
} from '../service/api'
import globalVar from '../../service/global'
import config from '../service/config'
import { Message as $Message } from 'view-ui-plus'
import { DEFAULT_FACE } from '@tokine/shared'

const store = useConfigStore()
const activeRoom = computed(() => store.activeRoom)
const activeTab = ref('overview')
const showAddRoom = ref(false)
const newRoomId = ref('')
const isRoomPanelCollapsed = ref(config.isRoomPanelCollapsed)
const addRoomBtn = ref<HTMLElement | null>(null)
const popoverStyle = reactive({ top: '0px', left: '0px' })
const connecting = ref(false)
const isRecording = ref(false)
const clientId = computed(() => store.id)

function toggleRoomPanel() {
  isRoomPanelCollapsed.value = !isRoomPanelCollapsed.value
  config.isRoomPanelCollapsed = isRoomPanelCollapsed.value
  updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: 'isRoomPanelCollapsed', value: isRoomPanelCollapsed.value }],
  }).catch(() => {})
}

function toggleAddRoom() {
  showAddRoom.value = !showAddRoom.value
  if (showAddRoom.value) {
    nextTick(() => {
      updatePopoverPosition()
    })
  }
}

function updatePopoverPosition() {
  if (!addRoomBtn.value) return
  const rect = addRoomBtn.value.getBoundingClientRect()
  popoverStyle.top = rect.bottom + 8 + 'px'
  popoverStyle.left = rect.left + 'px'
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const insideBtn = addRoomBtn.value?.contains(target)
  const popover = document.querySelector('.add-room-popover')
  const insidePopover = popover?.contains(target)
  if (!insideBtn && !insidePopover) {
    showAddRoom.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// const isRecording = computed(() => store.isRecording)

async function selectRoom(index: number) {
  store.rooms.forEach((room, i) => {
    room.isActive = i === index
  })

  activeTab.value = 'overview'

  await updateClientConfig({ clientId: clientId.value, kvs: [{ key: 'rooms', value: store.rooms }] })
}

async function removeRoom(index: number) {
  store.rooms.splice(index, 1)

  await updateClientConfig({ clientId: clientId.value, kvs: [{ key: 'rooms', value: store.rooms }] })
}

async function initializeRoom({ roomId, force }: { roomId?: string; force?: boolean } = {}) {
  if (!activeRoom?.value) return
  // if (!force && activeRoom.value.isInitialized) {
  //   return
  // }

  try {
    const roomId = activeRoom.value?.displayId || activeRoom.value?.id
    const { data } = await getRoomInfoV2({ roomId })

    if (!data) {
      $Message.error('连接失败：无法获取房间信息')
      connecting.value = false
      return
    }

    const userId = data.room_info?.uid
    const realRoomId = data.room_info?.room_id
    const liveStatus = data.room_info?.live_status
    const username = data.anchor_info?.base_info?.uname
    const face = data.anchor_info?.base_info?.face
    const fansNumber = data.anchor_info?.relation_info?.attention
    const fansclubNumber = data.anchor_info?.medal_info?.fansclub
    const watchedNumber = data.watched_show?.num
    const likeNumber = data.like_info_v3?.total_likes
    const ninkiNumber = data.room_info?.online
    const onlineNumber = data.room_rank_info?.user_rank_entry?.user_contribution_rank_entry?.count
    const anchorNumber = data.guard_info?.count

    const room = store.rooms.find(room => room.id === roomId)
    if (!room) throw new Error('房间未找到')
    room.id = String(realRoomId)
    room.realId = String(realRoomId)
    room.userId = String(userId)
    room.username = username
    room.face = face
    room.fansNumber = fansNumber || 0
    room.fansclubNumber = fansclubNumber || 0
    room.liveStatus = liveStatus || 0
    room.ninkiNumber = ninkiNumber || 0
    room.onlineNumber = onlineNumber || 0
    room.watchedNumber = watchedNumber || 0
    room.likeNumber = likeNumber || 0
    room.anchorNumber = anchorNumber || 0

    if (!room.userSpaceBanner) {
      const { data } = await getUserInfoV2({ userId })
      const userSpaceBanner = data.top_photo_v2.l_img
      room.userSpaceBanner = userSpaceBanner
    }
  } catch (e: any) {
    Message.error(`连接失败: ${e.message}`)
  }
}

async function handleAddRoom() {
  const roomId = newRoomId.value.trim()
  if (!roomId) return

  store.rooms.forEach((room, i) => {
    room.isActive = false
  })

  store.rooms.push({
    id: roomId,
    userId: '',
    isActive: true,
  })

  await initializeRoom({ force: true })

  showAddRoom.value = false
  newRoomId.value = ''

  await updateClientConfig({ clientId: clientId.value, kvs: [{ key: 'rooms', value: store.rooms }] })
}

async function toggleConnect() {
  const room = activeRoom.value
  if (!room) return
  connecting.value = true
  try {
    if (room.isConnected) {
      await disconnectApi({ roomId: room.id, clientId: clientId.value })
      room.isConnected = false
    } else {
      await connectApi({ roomId: room.id, userId: room.userId, clientId: clientId.value })
      await initializeRoom()
      room.isConnected = true
    }
  } catch {
    /* ignore */
  }
  connecting.value = false
}

function toConfigTab() {
  activeTab.value = 'config'

  // 临时切换到配置页不显示Active样式
  store.rooms.forEach((room, i) => {
    room.isActive = false
  })
}

function handleConnect(_status: boolean) {
  // 由 OverviewPanel emit 上来触发连接
  // TODO 状态变化
}

async function handleShowDanmaku() {
  const room = activeRoom.value
  if (!room) return
  const url = `http://127.0.0.1:${globalVar.port}/dm?clientId=${clientId.value}&roomId=${room.id}`
  await window.ipcRenderer.invoke(IPC_WINDOW_CREATE, {
    url,
    width: 440,
    height: 600,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: false,
    type: 'dm',
    roomId: room.id,
    clientId: clientId.value,
  })
  fetchWindows()
}

async function handleShowRawDanmaku() {
  const room = activeRoom.value
  if (!room) return
  const url = `http://127.0.0.1:${globalVar.port}/dm-raw-style?clientId=${clientId.value}&roomId=${room.id}`
  await window.ipcRenderer.invoke(IPC_WINDOW_CREATE, {
    url,
    width: 440,
    height: 600,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: false,
    type: 'dm-raw',
    roomId: room.id,
    clientId: clientId.value,
  })
  fetchWindows()
}

async function handleShowLiveWindow() {
  const room = activeRoom.value
  if (!room) return
  const url = `http://127.0.0.1:${globalVar.port}/live-player?clientId=${clientId.value}&roomId=${room.id}`
  await window.ipcRenderer.invoke(IPC_WINDOW_CREATE, {
    url,
    width: 640,
    height: 360,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: false,
    type: 'live',
    roomId: room.id,
    clientId: clientId.value,
  })
  fetchWindows()
}

let recordTimer: ReturnType<typeof setInterval> | null = null

async function handleToggleRecord() {}

// ── 标题栏窗口列表 ──
interface WindowItem {
  id: number
  type: string
  roomId: string
}
const dmWindows = ref<WindowItem[]>([])
const showWindowList = ref(false)

async function fetchWindows() {
  const list = (await window.ipcRenderer.invoke(IPC_WINDOW_FIND)) as WindowItem[]
  dmWindows.value = list || []
}

function winTypeLabel(type: string) {
  const map: Record<string, string> = {
    dm: '弹幕窗',
    'dm-raw': '仿原弹幕窗',
    live: '直播窗',
  }
  return map[type] || '窗口'
}

async function focusWindow(id: number) {
  await window.ipcRenderer.invoke('IPC_WINDOW_CONTROL', { windowId: id, method: 'moveTop' })
}

async function closeDmWindow(id: number) {
  await window.ipcRenderer.invoke(IPC_WINDOW_CLOSE, { id })
  fetchWindows()
}

onMounted(() => {
  fetchWindows()
  setInterval(fetchWindows, 3000)
})

// 监听 dmStyle 的 Electron 窗口配置变化，同步到 DM 窗口
watch(
  () => config.dmStyle?.ignoreMouseEvent,
  async val => {
    await window.ipcRenderer.invoke(IPC_WINDOW_ACTION, {
      type: 'dm',
      action: 'setIgnoreMouseEvents',
      value: [val, { forward: true }],
    })
  },
)

watch(
  () => config.dmStyle?.isWindowAlwaysOnTop,
  async val => {
    await window.ipcRenderer.invoke(IPC_WINDOW_ACTION, {
      type: 'dm',
      action: 'setAlwaysOnTop',
      value: [val, 'floating'],
    })
  },
)

watch(
  () => config.liveConfig?.ignoreMouseEvent,
  async val => {
    await window.ipcRenderer.invoke(IPC_WINDOW_ACTION, {
      type: 'live',
      action: 'setIgnoreMouseEvents',
      value: [val, { forward: true }],
    })
  },
)

watch(
  () => config.liveConfig?.isWindowAlwaysOnTop,
  async val => {
    await window.ipcRenderer.invoke(IPC_WINDOW_ACTION, {
      type: 'live',
      action: 'setAlwaysOnTop',
      value: [val, 'floating'],
    })
  },
)

function close() {
  window.ipcRenderer.invoke(IPC_WINDOW_ACTION, { action: 'close' })
}
function minimize() {
  window.ipcRenderer.invoke(IPC_WINDOW_ACTION, { action: 'minimize' })
}
function hideToTray() {
  // ipcRenderer.invoke(IPC_WINDOW_ACTION, { action: 'hide' })
}
</script>

<style scoped>
#home {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f7fa;
}

/* ── 标题栏 ── */
#title-bar {
  height: 28px;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
  padding: 0 8px;
  flex-shrink: 0;
}

#title-bar-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

#title-bar-logo {
  width: 22px;
  height: 22px;
}

#title-bar-text {
  font-size: 13px;
  color: #999;
}

#title-bar-status {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

.titlebar-sep {
  font-size: 11px;
  color: #ddd;
  margin: 0 2px;
  user-select: none;
}

.titlebar-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0 6px;
  height: 18px;
  font-size: 10px;
  color: #aaa;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: all 0.15s;
}

.titlebar-chip:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.1);
}

.titlebar-chip-label {
  font-size: 10px;
}

.titlebar-chip-close {
  font-size: 10px;
  line-height: 1;
  width: 12px;
  height: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.12s;
  margin-left: -2px;
}

.titlebar-chip:hover .titlebar-chip-close {
  opacity: 0.5;
}

.titlebar-chip-close:hover {
  opacity: 1 !important;
  color: #fff;
  background: #ed4014;
}

#title-bar-controller {
  display: flex;
  -webkit-app-region: no-drag;
}

#title-bar-controller > div {
  width: 36px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  color: #999;
  font-size: 16px;
}

#title-bar-controller > div:hover {
  background: #f0f2f5;
}

#close:hover {
  background: #ed4014 !important;
  color: #fff !important;
}

#window {
  position: relative;
}

.window-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 12px;
  height: 12px;
  padding: 0 3px;
  font-size: 8px;
  line-height: 12px;
  text-align: center;
  color: #fff;
  background: #999;
  border-radius: 6px;
}

.window-list-mask {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.window-list-panel {
  position: fixed;
  top: 29px;
  right: 80px;
  width: 200px;
  background: #fff;
  border: 1px solid #e8eaec;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.window-list-empty {
  padding: 12px;
  text-align: center;
  font-size: 11px;
  color: #ccc;
}

.window-list-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  font-size: 11px;
  color: #555;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.window-list-item:hover {
  background: #f0f2f5;
}

.window-list-label {
  flex: 1;
}

.window-list-room {
  font-size: 10px;
  color: #bbb;
}

.window-list-close {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 10px;
  color: #999;
  transition: all 0.1s;
}

.window-list-close:hover {
  color: #fff;
  background: #ed4014;
}

/* ── 主体 ── */
.main-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ── 房间面板 ── */
.room-panel {
  width: 210px;
  user-select: none;
  background: #fff;
  border-right: 1px solid #e8eaec;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease;
  overflow: hidden;
  position: relative;
}

.room-panel.collapsed {
  width: 12px;
}

.panel-toggle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: transparent;
  transition:
    color 0.15s,
    background 0.15s;
  z-index: 1;
}

.hamburger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 18px;
  width: 18px;
}

.hamburger i {
  display: block;
  width: 8px;
  height: 2.5px;
  border-radius: 1px;
  background: currentColor;
}

.room-panel:hover .panel-toggle,
.room-panel.collapsed .panel-toggle {
  color: #999;
}

.panel-toggle:hover {
  color: #2d8cf0 !important;
  background: rgba(45, 140, 240, 0.08);
}

.room-panel-header {
  padding: 4px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e8eaec;
}

.room-panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.add-room-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px dashed #ddd;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.add-room-btn:hover {
  border-color: #2d8cf0;
  color: #2d8cf0;
  background: rgba(45, 140, 240, 0.06);
}

.add-room-popover {
  position: fixed;
  width: 240px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 14px;
  z-index: 1000;
}

.popover-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.room-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 2px;
}

.room-list::-webkit-scrollbar {
  width: 3px;
}

.room-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.room-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  /* border-radius: 8px; */
  cursor: pointer;
  transition: 0.15s;
  position: relative;
  border-left: 3px solid transparent;
}

.room-card.connect {
  border-left-color: #19be6b;
}

.room-card:hover {
  background: #f0f2f5;
}

.room-card.active {
  background: rgba(45, 140, 240, 0.06);
}

.room-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  background: #eee;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.live-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 12px;
  flex-shrink: 0;
}

.live-bars .bar {
  display: inline-block;
  width: 3px;
  border-radius: 1px;
  background: #999;
  transform-origin: bottom;
  animation: live-bounce 0.7s ease-in-out infinite;
}

.live-bars .bar1 {
  height: 3px;
  animation-delay: 0s;
}

.live-bars .bar2 {
  height: 5px;
  animation-delay: 0.12s;
}

.live-bars .bar3 {
  height: 4px;
  animation-delay: 0.24s;
}

@keyframes live-bounce {
  0%,
  100% {
    transform: scaleY(0.5);
  }

  50% {
    transform: scaleY(2.2);
  }
}

.room-id {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.delete-btn {
  position: absolute;
  /* top: 4px; */
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  font-size: 10px;
  transition: 0.15s;
}

.room-card:hover .delete-btn {
  color: #999;
}

.delete-btn:hover {
  color: #ed4014 !important;
  background: rgba(237, 64, 20, 0.08);
}

.empty-rooms {
  padding: 40px 20px;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}

.config-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-top: 1px solid #e8eaec;
  cursor: pointer;
  color: #999;
  font-size: 12px;
  transition:
    color 0.15s,
    background 0.15s;
  flex-shrink: 0;
}

.config-bar:hover {
  color: #2d8cf0;
  background: rgba(45, 140, 240, 0.04);
}

/* ── 详情面板 ── */
.detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Banner 包裹区 ── */
.detail-banner {
  position: relative;
  flex-shrink: 0;
  user-select: none;
}

.banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: relative;
}

.banner-overlay::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.9), transparent);
  pointer-events: none;
}

.room-tabs {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0;
  padding: 0 20px;
  flex-shrink: 0;
}

.room-tab {
  position: relative;
  padding: 8px 18px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.8);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition:
    color 0.25s,
    border-color 0.25s;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  user-select: none;
}

.room-tab:hover {
  transition:
    color 0.25s,
    text-shadow 0.25s;
  text-shadow:
    white 1px 0 1px,
    white 0 1px 1px,
    white -1px 0 1px,
    white 0 -1px 1px;
}

.room-tab.active {
  color: #222;
  font-weight: 600;
  border-bottom-color: #fff;
  text-shadow:
    white 1px 0 1px,
    white 0 1px 1px,
    white -1px 0 1px,
    white 0 -1px 1px;
}

/* ── Banner 内用户信息 ── */
.banner-profile {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 26px 16px 8px;
}

.banner-profile-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  object-fit: cover;
  background: #eee;
  border: 3px solid rgba(255, 255, 255, 0.4);
}

.banner-info {
  flex: 1;
  min-width: 0;
}

.banner-name {
  font-size: 14px;
  font-weight: 600;
  color: #222;
  /* text-shadow: 0 0 8px rgba(255, 255, 255, 0.8); */
  text-shadow:
    white 1px 0 1px,
    white 0 1px 1px,
    white -1px 0 1px,
    white 0 -1px 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-id {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.9);
  /* text-shadow:
    white 0.5px 0 1px,
    white 0 0.5px 1px,
    white -0.5px 0 1px,
    white 0 -0.5px 1px; */
  display: flex;
  align-items: center;
  gap: 4px;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  margin-left: 6px;
}

.btn-danmaku {
  border: 2px solid rgba(255, 255, 255, 1) !important;
  background: rgba(255, 255, 255, 0.6) !important;
  color: rgba(0, 0, 0, 0.8) !important;
  font-size: 11px !important;
  border-radius: 14px !important;
  /* text-shadow: 0 0 4px rgba(255,255,255,0.5); */
}

.btn-danmaku:hover {
  border-color: #fff !important;
  color: #222 !important;
  background: rgba(255, 255, 255, 0.9) !important;
}

/* ── Switch 滑块 ── */
.switch {
  position: relative;
  display: inline-block;
  width: 64px;
  height: 24px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  transition:
    background 0.25s,
    border-color 0.25s;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.slider::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s;
  z-index: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.slider-text {
  position: absolute;
  font-size: 10px;
  transition: opacity 0.2s;
  white-space: nowrap;
  /* text-shadow: 0 0 4px rgba(255,255,255,0.6); */
}

.slider-text.on {
  left: 8px;
  color: #fff;
  opacity: 0;
}

.slider-text.off {
  right: 8px;
  color: rgba(0, 0, 0, 0.9);
  opacity: 1;
}

.switch input:checked + .slider {
  background: rgba(25, 190, 107, 0.8);
  border-color: rgba(255, 255, 255, 0.8);
}

.switch input:checked + .slider::before {
  transform: translateX(40px);
}

.switch input:checked + .slider .slider-text.on {
  opacity: 1;
}

.switch input:checked + .slider .slider-text.off {
  opacity: 0;
}

.switch input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-content {
  flex: 1;
  overflow: clip;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
  gap: 10px;
  font-size: 14px;
}

/* Modal 窗口列表 */
.window-list-modal :deep(.ivu-modal-header),
.window-list-modal :deep(.ivu-modal-footer) {
  display: none;
}

.window-list-modal :deep(.ivu-modal-body) {
  padding: 8px 0;
}

.modal-window-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #555;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s;
}

.modal-window-item:hover {
  background: #f0f2f5;
}

.modal-window-label {
  flex: 1;
}

.modal-window-id {
  font-size: 12px;
  color: #bbb;
}

.modal-window-label {
  flex: 1;
}

.modal-window-room {
  font-size: 12px;
  color: #bbb;
  margin-right: 4px;
}

.modal-window-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 50%;
  color: #ccc;
  transition: all 0.1s;
  height: 16px;
  width: 16px;
}

.modal-window-close:hover {
  color: #fff;
  background: #ed4014;
}
</style>
