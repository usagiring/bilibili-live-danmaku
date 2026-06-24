<template>
  <div class="overview-panel">
    <template v-if="activeRoom">
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
          <div class="stat-value">{{ formatNumber(activeRoom.fansclubNumber) }}</div>
          <div class="stat-label"><Icon type="md-star" /> 粉丝团</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeRoom?.anchorNumber }}</div>
          <div class="stat-label"><Icon type="md-flag" /> 舰队</div>
        </div>
      </div>

      <!-- 观看/点赞 -->
      <div
        class="stats-row"
        style="grid-template-columns: repeat(2, 1fr)">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Message } from 'view-ui-plus'
import { useConfigStore } from '../store'
import { sse } from '../service/sse-client'
import { getRoomInfoV2, updateClientConfig, getUserInfoV2 } from '../service/api'

const store = useConfigStore()
const activeRoom = computed(() => store.activeRoom)

// const initializing = ref(false)
const connecting = ref(false)
const clientId = computed(() => store.id)

onMounted(() => {
  sse.on('NINKI', onNinki)
  sse.on('LIVE', onLive)
  sse.on('PREPARING', onPreparing)
  sse.on('WATCHED_CHANGE', onWatchedChange)
  sse.on('LIKE_CHANGE', onLikeChange)
  sse.on('ROOM_REAL_TIME_MESSAGE_UPDATE', onFansUpdate)
  sse.on('ONLINE_COUNT', onOnlineCount)
})

onBeforeUnmount(() => {
  // sse.off('NINKI', onNinki)
  // sse.off('LIVE', onLive)
  // sse.off('PREPARING', onPreparing)
  // sse.off('WATCHED_CHANGE', onWatchedChange)
  // sse.off('LIKE_CHANGE', onLikeChange)
  // sse.off('ROOM_REAL_TIME_MESSAGE_UPDATE', onFansUpdate)
  // sse.off('ONLINE_COUNT', onOnlineCount)
})

// ── SSE 回调 ──
function onNinki(data: any) {
  const { roomId, ninkiNumber } = data.payload
  const room = store.rooms.find(room => room.id === roomId)
  if (!room) return
  room.ninkiNumber = ninkiNumber
  // store.UPDATE_ACTIVE_ROOM({ ninkiNumber: data.payload?.ninkiNumber ?? 0 })
}
function onLive() {
  // store.UPDATE_ACTIVE_ROOM({ liveStatus: 1 })
}
function onPreparing() {
  //  store.UPDATE_ACTIVE_ROOM({ liveStatus: 0 })
}
function onWatchedChange(data: any) {
  const { roomId, watchedNumber } = data.payload
  const room = store.rooms.find(room => room.id === roomId)
  if (!room) return
  room.watchedNumber = watchedNumber
  //  store.UPDATE_ACTIVE_ROOM({ watchedNumber: data.payload?.watchedNumber ?? 0 })
}
function onLikeChange(data: any) {
  const { roomId, likeNumber } = data.payload
  const room = store.rooms.find(room => room.id === roomId)
  if (!room) return
  room.likeNumber = likeNumber
}
function onFansUpdate(data: any) {
  const { roomId, fansNumber, fansClubNumber } = data.payload
  const room = store.rooms.find(room => room.id === roomId)
  if (!room) return
  room.fansNumber = fansNumber
  room.fansclubNumber = fansClubNumber
}
function onOnlineCount(data: any) {
  const { roomId, onlineNumber } = data.payload
  const room = store.rooms.find(room => room.id === roomId)
  if (!room) return
  room.onlineNumber = onlineNumber
}

function formatNumber(n?: number): string {
  if (!n) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}
</script>

<style scoped>
.overview-panel {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  height: 100%;
}

.overview-panel::-webkit-scrollbar {
  width: 3px;
}

.overview-panel::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.connect-bar {
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.connect-form {
  display: flex;
  align-items: center;
  font-size: 13px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-card {
  padding: 12px 10px;
  background: #fff;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.stat-card:hover {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.empty-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
  gap: 10px;
}
</style>
