<template>
  <div class="overview-panel">
    <!-- 连接栏 -->
    <div class="connect-bar" v-if="!activeRoom || !activeRoom.isConnected">
      <div class="connect-form">
        <span>直播间号：</span>
        <InputNumber v-model="inputRoomId" placeholder="输入房间号" size="small" :min="1" style="width:130px" @on-enter="doConnect" />
        <Button type="primary" size="small" :loading="connecting" @click="doConnect" style="margin-left:8px">
          连接
        </Button>
      </div>
    </div>

    <!-- 已连接时的信息卡片 -->
    <template v-if="activeRoom && activeRoom.isConnected">
      <div class="profile-card">
        <Avatar :src="activeRoom.avatar || 'https://static.hdslb.com/images/member/noface.gif'" size="large" />
        <div class="p-info">
          <div class="p-name">
            {{ activeRoom.username }}
            <Tag color="blue" style="vertical-align:middle">连接中</Tag>
          </div>
          <div class="p-id">房间号 {{ activeRoom.displayRoomId }} · UID {{ activeRoom.roomUserId }}</div>
          <Tag :color="activeRoom.liveStatus === 1 ? 'success' : 'default'" style="margin-top:4px">
            {{ activeRoom.liveStatus === 1 ? '● 直播中' : '未开播' }}
          </Tag>
        </div>
        <div class="p-actions">
          <Button size="small" @click="doDisconnect">断开</Button>
          <Button type="primary" size="small" @click="$emit('showDanmaku', true)">弹幕窗</Button>
        </div>
      </div>

      <!-- 统计条 -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(activeRoom.ninkiNumber) }}</div>
          <div class="stat-label"><Icon type="md-eye" /> 热度</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(activeRoom.fansNumber) }}</div>
          <div class="stat-label"><Icon type="md-heart" /> 关注</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(activeRoom.fansClubNumber) }}</div>
          <div class="stat-label"><Icon type="md-star" /> 粉丝团</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeRoom.guardNumber }}</div>
          <div class="stat-label"><Icon type="md-flag" /> 舰队</div>
        </div>
      </div>

      <!-- 观看/点赞 -->
      <div class="stats-row" style="grid-template-columns: repeat(2, 1fr)">
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(activeRoom.watchedNumber) }}</div>
          <div class="stat-label"><Icon type="md-person" /> 看过</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(activeRoom.likeNumber) }}</div>
          <div class="stat-label"><Icon type="md-thumbs-up" /> 点赞</div>
        </div>
      </div>
    </template>

    <!-- 未选择房间提示 -->
    <div class="empty-hint" v-if="!activeRoom">
      <Icon type="md-home" size="48" style="opacity:0.1" />
      <p>在左侧选择或添加直播间</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useConfigStore } from '../store'
import { sse } from '../../service/sse-client'
import {
  connect as connectRoom,
  disconnect as disconnectRoom,
  getRoomInfoV2,
  getGuardInfo,
  updateSetting,
} from '../../service/api'

export default defineComponent({
  emits: ['connect', 'showDanmaku'],
  data() {
    return {
      inputRoomId: 0,
      connecting: false,
    }
  },
  computed: {
    store() { return useConfigStore() },
    activeRoom() { return useConfigStore().activeRoom },
  },
  watch: {
    activeRoom: {
      immediate: true,
      handler(room) {
        if (room) {
          this.inputRoomId = room.displayRoomId
        }
      },
    },
  },
  mounted() {
    // 注册全局 SSE 消息监听
    sse.on('NINKI', this.onNinki)
    sse.on('LIVE', this.onLive)
    sse.on('PREPARING', this.onPreparing)
    sse.on('WATCHED_CHANGE', this.onWatchedChange)
    sse.on('LIKE_CHANGE', this.onLikeChange)
    sse.on('ROOM_REAL_TIME_MESSAGE_UPDATE', this.onFansUpdate)
    sse.on('ONLINE_COUNT', this.onOnlineCount)
  },
  beforeUnmount() {
    // 移除监听
    sse.off('NINKI', this.onNinki)
    sse.off('LIVE', this.onLive)
    sse.off('PREPARING', this.onPreparing)
    sse.off('WATCHED_CHANGE', this.onWatchedChange)
    sse.off('LIKE_CHANGE', this.onLikeChange)
    sse.off('ROOM_REAL_TIME_MESSAGE_UPDATE', this.onFansUpdate)
    sse.off('ONLINE_COUNT', this.onOnlineCount)
  },
  methods: {
    formatNumber(n: number): string {
      if (!n) return '0'
      if (n >= 10000) return (n / 10000).toFixed(1) + '万'
      return n.toLocaleString()
    },

    async doConnect() {
      if (!this.inputRoomId) return
      this.connecting = true

      try {
        const roomId = this.inputRoomId
        const { data } = await getRoomInfoV2(roomId)

        if (!data) {
          this.$Message.error('连接失败：无法获取房间信息')
          this.connecting = false
          return
        }

        const { uid, room_id: realRoomId, live_status: liveStatus } = data.room_info
        const { uname, face } = data.anchor_info.base_info
        const { attention: fansNumber } = data.anchor_info.relation_info
        const { fansclub: fansClubNumber } = data.anchor_info.medal_info || {}
        const { num: watchedNumber } = data.watched_show || {}
        const { total_likes: likeNumber } = data.like_info_v3 || {}
        const ninkiNumber = data.room_info.online || 0
        const onlineNumber = data.room_rank_info?.user_rank_entry?.user_contribution_rank_entry?.count || 0

        // 确保房间在列表中
        if (!this.store.rooms.find((r) => r.displayRoomId === roomId)) {
          this.store.ADD_ROOM(roomId)
        } else {
          const idx = this.store.rooms.findIndex((r) => r.displayRoomId === roomId)
          this.store.SET_ACTIVE_ROOM(idx)
        }

        await connectRoom({ roomId: Number(realRoomId), uid: uid || 0 })

        this.store.UPDATE_ACTIVE_ROOM({
          realRoomId,
          isConnected: true,
          username: uname,
          avatar: face,
          fansNumber,
          fansClubNumber: fansClubNumber || 0,
          liveStatus,
          ninkiNumber,
          onlineNumber,
          roomUserId: uid,
          watchedNumber: watchedNumber || 0,
          likeNumber: likeNumber || 0,
        })

        // 获取舰队信息
        try {
          const guardResult = await getGuardInfo(realRoomId, uid)
          this.store.UPDATE_ACTIVE_ROOM({ guardNumber: guardResult.data.info.num })
        } catch { /* ignore */ }

        await updateSetting({ roomUserId: uid })
        this.$emit('connect', true)
      } catch (e: any) {
        this.$Message.error(`连接失败: ${e.message}`)
      }
      this.connecting = false
    },

    async doDisconnect() {
      const room = this.activeRoom
      if (!room) return
      try {
        await disconnectRoom({ roomId: room.realRoomId })
      } catch { /* ignore */ }
      this.store.UPDATE_ACTIVE_ROOM({ isConnected: false, liveStatus: 0 })
      this.$emit('connect', false)
    },

    // ── SSE 回调（由全局 SSE 推送触发）──

    onNinki(data: any) { this.store.UPDATE_ACTIVE_ROOM({ ninkiNumber: data.payload?.ninkiNumber ?? 0 }) },
    onLive() { this.store.UPDATE_ACTIVE_ROOM({ liveStatus: 1 }) },
    onPreparing() { this.store.UPDATE_ACTIVE_ROOM({ liveStatus: 0 }) },
    onWatchedChange(data: any) { this.store.UPDATE_ACTIVE_ROOM({ watchedNumber: data.payload?.watchedNumber ?? 0 }) },
    onLikeChange(data: any) { this.store.UPDATE_ACTIVE_ROOM({ likeNumber: data.payload?.likeNumber ?? 0 }) },
    onFansUpdate(data: any) {
      const p = data.payload || {}
      this.store.UPDATE_ACTIVE_ROOM({
        fansNumber: p.fansNumber ?? this.activeRoom?.fansNumber ?? 0,
        fansClubNumber: p.fansClubNumber ?? this.activeRoom?.fansClubNumber ?? 0,
      })
    },
    onOnlineCount(data: any) { this.store.UPDATE_ACTIVE_ROOM({ onlineNumber: data.payload?.onlineNumber ?? 0 }) },
  },
})
</script>

<style scoped>
.overview-panel { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; height: 100%; }
.overview-panel::-webkit-scrollbar { width: 3px; }
.overview-panel::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }

.connect-bar { padding: 12px 16px; background: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
.connect-form { display: flex; align-items: center; font-size: 13px; }

.profile-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: #fff; border-radius: 8px; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
.p-info { flex: 1; }
.p-name { font-size: 16px; font-weight: 700; }
.p-id { font-size: 12px; color: #999; margin-top: 2px; }
.p-actions { display: flex; gap: 8px; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.stat-card { padding: 14px 16px; background: #fff; border-radius: 8px; text-align: center; box-shadow: 0 1px 6px rgba(0,0,0,0.04); }
.stat-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
.stat-value { font-size: 20px; font-weight: 700; color: #333; }
.stat-label { font-size: 11px; color: #999; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 4px; }

.empty-hint { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ccc; gap: 10px; }
</style>
