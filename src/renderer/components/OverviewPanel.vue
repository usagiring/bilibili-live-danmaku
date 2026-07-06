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
          <Poptip
            trigger="click"
            v-model="isShowLikePoptip"
            placement="bottom"
            transfer
            width="300">
            <div class="stat-label stat-card--clickable"><Icon type="md-thumbs-up" /> 点赞</div>

            <template #content>
              <div style="display: flex; align-items: center; gap: 6px; white-space: nowrap">
                <span style="font-size: 12px; white-space: nowrap">我要给喜欢的主播点</span>
                <InputNumber
                  v-model="likeCount"
                  size="small"
                  :min="1"
                  :max="1000"
                  :step="10"
                  style="width: 100px" />
                <span style="font-size: 12px">次赞！</span>
                <Button
                  size="small"
                  type="primary"
                  @click="doLike">
                  确定
                </Button>
              </div>
            </template>
          </Poptip>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { addLike } from '../service/api'
import { useConfigStore } from '../store'

const store = useConfigStore()
const activeRoom = computed(() => store.activeRoom)
const likeCount = ref(1)
const isShowLikePoptip = ref(false)

async function doLike() {
  if (!activeRoom?.value) return
  await addLike({ clientId: store.id, roomId: activeRoom.value.id, roomUserId: activeRoom.value.userId, count: likeCount.value })
  isShowLikePoptip.value = false
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
  user-select: none;
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

.stat-card--clickable {
  cursor: pointer;
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
