<template>
  <div id="home">
    <!-- 标题栏 -->
    <div id="title-bar">
      <div id="title-bar-title">
        <img id="title-bar-logo" src="../assets/logo.png" />
        <span id="title-bar-text">bilibili-danmaku</span>
      </div>
      <div id="title-bar-status">
        <span v-if="isRecording">录制中...</span>
      </div>
      <div id="title-bar-controller">
        <div id="tray" @click="hideToTray"><Icon type="logo-windows" /></div>
        <div id="minimize" @click="minimize"><Icon type="md-remove" /></div>
        <div id="close" @click="close"><Icon type="md-close" /></div>
      </div>
    </div>

    <!-- 主体两栏 -->
    <div class="main-body">
      <!-- 左侧：直播间列表 -->
      <div class="room-panel">
        <div class="room-panel-header">
          <h3>直播间</h3>
          <button class="add-room-btn" title="添加直播间" @click="showAddRoom = true">
            <Icon type="md-add" />
          </button>
        </div>
        <div class="room-list">
          <div
            v-for="(room, index) in store.rooms"
            :key="index"
            class="room-card"
            :class="{ active: store.activeRoomIndex === index }"
            @click="store.SET_ACTIVE_ROOM(index)"
          >
            <Avatar :src="room.avatar || 'https://static.hdslb.com/images/member/noface.gif'" size="small" />
            <div class="room-info">
              <div class="room-name">{{ room.username || '未连接' }}</div>
              <div class="room-id">房间号 {{ room.displayRoomId }}</div>
            </div>
            <span class="status-dot" :class="room.liveStatus === 1 ? 'live' : 'offline'"></span>
            <button class="delete-btn" @click.stop="store.REMOVE_ROOM(index)"><Icon type="md-close" /></button>
          </div>

          <!-- 空状态 -->
          <div v-if="store.rooms.length === 0" class="empty-rooms">
            <Icon type="md-add-circle" size="32" style="color:#ddd" />
            <p>点击 + 添加直播间</p>
          </div>
        </div>
      </div>

      <!-- 右侧：详情区 -->
      <div class="detail-panel">
        <!-- 房间内 Tab 导航 -->
        <div class="room-tabs" v-if="store.activeRoom">
          <div class="room-tab" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
            <Icon type="md-home" /> 概览
          </div>
          <div class="room-tab" :class="{ active: activeTab === 'style' }" @click="activeTab = 'style'">
            <Icon type="md-color-palette" /> 样式
          </div>
          <div class="room-tab" :class="{ active: activeTab === 'vote' }" @click="activeTab = 'vote'">
            <Icon type="md-pie" /> 投票
          </div>
          <div class="room-tab" :class="{ active: activeTab === 'lottery' }" @click="activeTab = 'lottery'">
            <Icon type="md-bonfire" /> 祈愿
          </div>
          <div class="room-tab" :class="{ active: activeTab === 'live' }" @click="activeTab = 'live'">
            <Icon type="md-play" /> 直播
          </div>
          <div class="room-tab" :class="{ active: activeTab === 'autoReply' }" @click="activeTab = 'autoReply'">
            <Icon type="md-repeat" /> 回复
          </div>
          <div class="room-tab" style="margin-left:auto" :class="{ active: activeTab === 'config' }" @click="activeTab = 'config'">
            <Icon type="md-settings" /> 设置
          </div>
        </div>

        <!-- Tab 内容区 -->
        <div class="tab-content" v-if="store.activeRoom">
          <!-- 概览 -->
          <OverviewPanel v-if="activeTab === 'overview'" @connect="handleConnect" @show-danmaku="handleShowDanmaku" />
          <!-- 样式 -->
          <StyleSetting v-if="activeTab === 'style'" />
          <!-- 投票 -->
          <Vote v-if="activeTab === 'vote'" />
          <!-- 祈愿 -->
          <Lottery v-if="activeTab === 'lottery'" />
          <!-- 直播 -->
          <Live v-if="activeTab === 'live'" />
          <!-- 自动回复 -->
          <AutoReply v-if="activeTab === 'autoReply'" />
          <!-- 设置 -->
          <Config v-if="activeTab === 'config'" />
        </div>

        <!-- 空状态（无房间时） -->
        <div class="empty-state" v-else>
          <Icon type="md-home" size="48" style="opacity:0.15" />
          <p>选择或添加一个直播间</p>
        </div>
      </div>
    </div>

    <!-- 添加直播间弹窗 -->
    <Modal v-model="showAddRoom" title="添加直播间" :width="360">
      <div style="margin-bottom:14px">
        <label style="font-size:12px;color:#999;display:block;margin-bottom:6px">直播间号</label>
        <Input v-model="newRoomId" placeholder="请输入直播间号，如 55609" size="large" />
      </div>
      <template #footer>
        <Button @click="showAddRoom = false">取消</Button>
        <Button type="primary" @click="handleAddRoom">连接</Button>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ipcRenderer, shell, BrowserWindow } from 'electron'
import { useConfigStore } from '../store'
import { IPC_WINDOW_ACTION } from '../../service/const'
import OverviewPanel from './OverviewPanel.vue'
import StyleSetting from './StyleSetting.vue'
import Vote from './Vote.vue'
import Lottery from './Lottery.vue'
import Live from './Live.vue'
import AutoReply from './AutoReply.vue'
import Config from './Config.vue'

export default defineComponent({
  components: { OverviewPanel, StyleSetting, Vote, Lottery, Live, AutoReply, Config },
  data() {
    return {
      activeTab: 'overview' as string,
      showAddRoom: false,
      newRoomId: '',
    }
  },
  computed: {
    store() { return useConfigStore() },
    isRecording() { return (useConfigStore() as any).isRecording },
  },
  methods: {
    handleAddRoom() {
      const roomId = parseInt(this.newRoomId)
      if (!roomId || roomId <= 0) return
      this.store.ADD_ROOM(roomId)
      this.showAddRoom = false
      this.newRoomId = ''
    },
    handleConnect(status: boolean) {
      // 由 OverviewPanel emit 上来触发连接
    },
    handleShowDanmaku(status: boolean) {
      // 由 OverviewPanel emit 上来触发弹幕窗
    },
    close() { ipcRenderer.invoke(IPC_WINDOW_ACTION, { action: 'close' }) },
    minimize() { ipcRenderer.invoke(IPC_WINDOW_ACTION, { action: 'minimize' }) },
    hideToTray() { ipcRenderer.invoke(IPC_WINDOW_ACTION, { action: 'hide' }) },
  },
})
</script>

<style scoped>
#home { height: 100%; display: flex; flex-direction: column; overflow: hidden; background: #f5f7fa; }

/* ── 标题栏 ── */
#title-bar { height: 35px; display: flex; align-items: center; -webkit-app-region: drag; background: #fff; border-bottom: 1px solid #e8eaec; padding: 0 8px; flex-shrink: 0; }
#title-bar-title { display: flex; align-items: center; gap: 8px; }
#title-bar-logo { width: 22px; height: 22px; }
#title-bar-text { font-size: 13px; color: #999; }
#title-bar-status { flex: 1; text-align: center; font-size: 12px; color: #19be6b; }
#title-bar-controller { display: flex; -webkit-app-region: no-drag; }
#title-bar-controller > div { width: 36px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px; color: #999; font-size: 16px; }
#title-bar-controller > div:hover { background: #f0f2f5; }
#close:hover { background: #ed4014 !important; color: #fff !important; }

/* ── 主体 ── */
.main-body { flex: 1; display: flex; overflow: hidden; }

/* ── 房间面板 ── */
.room-panel { width: 230px; background: #fff; border-right: 1px solid #e8eaec; display: flex; flex-direction: column; flex-shrink: 0; }
.room-panel-header { padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e8eaec; }
.room-panel-header h3 { font-size: 14px; font-weight: 600; color: #333; margin: 0; }
.add-room-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px dashed #ddd; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #999; }
.add-room-btn:hover { border-color: #2d8cf0; color: #2d8cf0; background: rgba(45,140,240,0.06); }
.room-list { flex: 1; overflow-y: auto; padding: 4px; }
.room-list::-webkit-scrollbar { width: 3px; }
.room-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
.room-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: .15s; position: relative; }
.room-card:hover { background: #f0f2f5; }
.room-card.active { background: rgba(45,140,240,0.06); }
.room-info { flex: 1; min-width: 0; }
.room-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.room-id { font-size: 11px; color: #999; margin-top: 2px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-dot.live { background: #19be6b; }
.status-dot.offline { background: #ddd; }
.delete-btn { position: absolute; top: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: transparent; font-size: 10px; transition: .15s; }
.room-card:hover .delete-btn { color: #999; }
.delete-btn:hover { color: #ed4014 !important; background: rgba(237,64,20,0.08); }
.empty-rooms { padding: 40px 20px; text-align: center; color: #ccc; font-size: 13px; }

/* ── 详情面板 ── */
.detail-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.room-tabs { display: flex; gap: 0; padding: 0 16px; background: #fff; border-bottom: 1px solid #e8eaec; flex-shrink: 0; }
.room-tab { padding: 10px 14px; font-size: 12px; color: #999; cursor: pointer; border-bottom: 2px solid transparent; transition: .15s; display: flex; align-items: center; gap: 4px; white-space: nowrap; }
.room-tab:hover { color: #333; }
.room-tab.active { color: #2d8cf0; border-bottom-color: #2d8cf0; font-weight: 600; }
.tab-content { flex: 1; overflow: hidden; }
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ccc; gap: 10px; font-size: 14px; }
</style>
