<template>
  <div style="height: 100%; display: flex; flex-direction: column">
    <div class="searcher-wrapper">
      <div class="search-row">
        <span class="filter-label">关键词</span>
        <Input
          v-model="q"
          class="search-input"
          placeholder="用户ID | 昵称 | 内容"
          clearable
          style="width: 240px"
          size="small" />
        <Button
          type="primary"
          shape="circle"
          icon="ios-search"
          style="width: 28px; height: 28px"
          :disabled="isRealTimeMode"
          @click="searchAll" />
        <span class="row-sep"></span>
        <div class="chips">
          <span
            class="chip"
            :class="{ on: isShowUserId }"
            @click="changeIsShowUserId()">
            显示UID
          </span>
          <span
            class="chip"
            :class="{ on: isShowInteract }"
            @click="changeIsShowInteract()">
            显示入场
          </span>
          <span
            class="chip"
            :class="{ on: isShowSendAt }"
            @click="changeIsShowSendAt()">
            显示时间
          </span>
          <span
            class="chip"
            :class="{ on: isRealTimeMode }"
            @click="changeIsRealTimeMode()">
            实时模式
          </span>
        </div>
      </div>
      <div class="search-extra">
        <div class="search-row">
          <span class="filter-label">时间范围</span>
          <DatePicker
            type="datetimerange"
            format="yyyy-MM-dd HH:mm"
            placeholder="选择时间范围"
            style="width: 240px"
            size="small"
            :model-value="dateRange"
            @on-change="changeDateRange"
            @on-clear="clearDateRange" />
        </div>
        <div class="search-row">
          <span class="filter-label">礼物价格</span>
          <Input
            v-model="totalPriceGte"
            placeholder="最低"
            size="small"
            :number="true"
            style="width: 80px" />
          <span class="filter-sep">—</span>
          <Input
            v-model="totalPriceLte"
            placeholder="最高"
            size="small"
            :number="true"
            style="width: 80px" />
        </div>
      </div>
    </div>
    <div class="content-wrapper">
      <Split v-model="split1">
        <template #left>
          <div
            id="split-left"
            class="split-pane scroll-box"
            @wheel="onWheelMessage">
            <template
              v-for="msg in messages"
              :key="msg.id">
              <div class="comment-content">
                <span
                  v-if="isShowSendAt"
                  class="date-style">
                  {{ dateFormat(msg.sendAt) }}
                </span>
                <FanMedal
                  v-if="msg.medal"
                  class="margin-lr-1px vertical-align-middle"
                  :medal="msg.medal"
                  :anchorIcon="msg.anchorIcon" />
                <template v-if="msg.category === 'comment'">
                  <span class="space-left-2">{{ `${msg.username}` }}</span>
                  <span
                    v-if="isShowUserId && msg.userId"
                    class="user-link"
                    @click="openBiliUserSpace(msg.userId)">
                    {{ `(${msg.userId})` }}
                  </span>
                  <span>：</span>
                  <img
                    v-if="msg.emojiUrl"
                    :style="{ 'vertical-align': 'middle', height: '20px' }"
                    :src="msg.emojiUrl" />
                  <span
                    v-else-if="msg.emots"
                    class="vertical-align-middle">
                    <template
                      v-for="(str, index) of msg.splitContent"
                      :key="index">
                      <template v-if="msg.emots[str]">
                        <img
                          class="vertical-align-middle"
                          :src="msg.emots[str].url"
                          :style="{ height: `${msg.emots[str].height || 20}px` }" />
                      </template>
                      <template v-else>{{ str }}</template>
                    </template>
                  </span>
                  <span v-else>{{ msg.content }}</span>
                </template>
                <template v-else>
                  <span class="space-left-2">{{ `${msg.username}` }}</span>
                  <span
                    v-if="isShowUserId && msg.userId"
                    class="user-link"
                    @click="openBiliUserSpace(msg.userId)">
                    {{ `(${msg.userId})` }}
                  </span>
                  <span>{{ msg.content }}</span>
                </template>
                <!-- <span
                      v-if="msg.voiceUrl"
                      class="voice-container"
                      @click="playAudio(msg.voiceUrl)">
                      <Icon type="md-play" />
                      <span>{{ `${msg.fileDuration}"` }}</span>
                    </span> -->
              </div>
            </template>
          </div>
        </template>
        <template #right>
          <div
            id="split-right"
            class="split-pane scroll-box"
            @wheel="onWheelGift">
            <template
              v-for="msg in gifts"
              :key="msg.id">
              <div :style="{ padding: '0 10px' }">
                <template v-if="msg.category === 'superchat'">
                  <GiftCardMini
                    :gift="msg.gift"
                    :username="`${msg.username}：`"
                    :face="msg.face"
                    :sendAt="msg.sendAt"
                    :isShowSendAt="isShowSendAt">
                    {{ `${msg.content}` }}
                  </GiftCardMini>
                </template>
                <template v-else>
                  <GiftCardMini
                    :gift="msg.gift"
                    :username="msg.username"
                    :face="msg.face"
                    :sendAt="msg.sendAt"
                    :isShowSendAt="isShowSendAt">
                    {{ ` 赠送了 ${msg.gift!.count}个 ${msg.gift!.name}` }}
                  </GiftCardMini>
                </template>
              </div>
            </template>
          </div>
        </template>
      </Split>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, computed, onMounted, onBeforeUnmount, triggerRef } from 'vue'
import { useConfigStore } from '../store'
import { getPriceProperties, dateFormat, wait, INTERACT_TYPE, getAnchorIcon } from '@tokine/shared'
import { MessageQuery, queryMessages, updateClientConfig } from '../service/api'
import GiftCardMini from '@tokine/shared/components/GiftCardMini.vue'
import FanMedal from '@tokine/shared/components/FanMedal.vue'
import { sse } from '../service/sse-client'
import config from '../service/config'
import { Message } from '@tokine/shared/types.js'

const MAX_MESSAGE_LIST_COUNT = 150
const MAX_GIFT_LIST_COUNT = 150

const store = useConfigStore()

// ── state ──
const q = ref('')
const totalPriceGte = ref<number | null>(0.1)
const totalPriceLte = ref<number | null>(null)
const split1 = ref(0.6)
const dateRange = ref<Date[]>([])
const messages = ref<Message[]>([])
const gifts = ref<Message[]>([])
const loadingMessage = ref(false)
const loadingGift = ref(false)

const isShowUserId = toRef(config.messageConfig!, 'isShowUserId')
const isShowInteract = toRef(config.messageConfig!, 'isShowInteract')
const isShowSendAt = toRef(config.messageConfig!, 'isShowSendAt')
const isRealTimeMode = toRef(config.messageConfig!, 'isRealTimeMode')

const room = computed(() => store.activeRoom)
const clientId = computed(() => store.id)

// ── methods ──
function changeDateRange([startTime, endTime]: string[]) {
  dateRange.value = [new Date(startTime), new Date(endTime)]
}

async function searchAll() {
  const msgs = await searchMessage({ type: 'message' })
  messages.value = msgs
  const gfs = await searchMessage({ type: 'gift' })
  gifts.value = gfs
}

async function searchMessage({
  type,
  cursor,
  order,
  limit = 50,
}: {
  type?: 'message' | 'gift'
  cursor?: string
  order?: string
  limit?: number
} = {}) {
  if (!room.value) return []
  const query: MessageQuery = {
    roomId: room.value!.id,
  }

  if (dateRange.value.length) {
    query.sendAtGte = dateRange.value[0].getTime()
    query.sendAtLte = dateRange.value[1].getTime()
  }
  if (q.value) {
    query.search = q.value
  }
  if (cursor) {
    query.cursor = cursor
  }

  if (type === 'gift') {
    query.category = ['gift', 'superchat']

    if (totalPriceGte.value != null) query.totalPriceGte = totalPriceGte.value
    if (totalPriceLte.value != null) query.totalPriceLte = totalPriceLte.value
  } else {
    if (isShowInteract.value) {
      query.category = ['comment', 'interact']
    } else {
      query.category = ['comment']
    }
  }

  if (order) query.order = order
  if (limit) query.limit = limit

  const { data } = await queryMessages(query)

  for (const msg of data) {
    formatMessage(msg)
  }

  return data
}

function formatMessage(msg: Message) {
  msg.anchorIcon = getAnchorIcon(msg)

  if (msg.category === 'interact') {
    msg.content = `${INTERACT_TYPE[Number(msg.type)]}直播间`
  }

  if (msg.emots) {
    const regstr = Object.keys(msg.emots)
      .map((k: string) => k.replace(/[\[\]]/g, ''))
      .map((k: string) => `\\[${k}\\]`)
      .join('|')
    msg.splitContent = msg.content.split(new RegExp(`(${regstr})`, 'g')).filter(Boolean)
  }

  if (['gift', 'superchat'].includes(msg.category) && msg.gift) {
    const gift = msg.gift
    gift.priceProperties = getPriceProperties(Number(gift.totalPrice))
  }
}

async function onWheelMessage(e: WheelEvent) {
  if (loadingMessage.value) return
  if (isRealTimeMode.value) return
  const el = e.currentTarget as HTMLElement
  if (e.deltaY < 0 && el.scrollTop <= 0) {
    loadingMessage.value = true

    const first = messages.value[0]
    if (first) {
      const list = await searchMessage({
        type: 'message',
        cursor: `prev$sendAt:${first.sendAt},id:${first.id}`,
        limit: 10,
      })
      messages.value = [...list, ...messages.value].slice(0, MAX_MESSAGE_LIST_COUNT)
    }

    await wait(100)
    loadingMessage.value = false
  }

  if (e.deltaY > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
    loadingMessage.value = true

    const last = messages.value[messages.value.length - 1]
    if (last) {
      const list = await searchMessage({
        type: 'message',
        cursor: `next$sendAt:${last.sendAt},id:${last.id}`,
        limit: 10,
      })
      messages.value = [...messages.value, ...list].slice(-MAX_MESSAGE_LIST_COUNT)
    }

    await wait(100)
    loadingMessage.value = false
  }
}

async function onWheelGift(e: WheelEvent) {
  if (loadingGift.value) return
  if (isRealTimeMode.value) return
  const el = e.currentTarget as HTMLElement

  if (e.deltaY < 0 && el.scrollTop <= 0) {
    loadingGift.value = true

    const first = gifts.value[0]
    if (first) {
      const list = await searchMessage({
        type: 'gift',
        cursor: `prev$sendAt:${first.sendAt},id:${first.id}`,
        limit: 10,
      })
      gifts.value = [...list, ...gifts.value].slice(0, MAX_GIFT_LIST_COUNT)
    }

    await wait(100)
    loadingGift.value = false
  }

  if (e.deltaY > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
    loadingGift.value = true
    const last = gifts.value[gifts.value.length - 1]
    if (last) {
      const list = await searchMessage({
        type: 'gift',
        cursor: `next$sendAt:${last.sendAt},id:${last.id}`,
        limit: 10,
      })
      gifts.value = [...gifts.value, ...list].slice(-MAX_GIFT_LIST_COUNT)
    }

    await wait(100)
    loadingGift.value = false
  }
}

function clearDateRange() {
  setTimeout(() => {
    dateRange.value = []
  }, 0)
}

function openBiliUserSpace(userId: string) {
  window.openExternal(`https://space.bilibili.com/${userId}`)
}

async function changeIsRealTimeMode() {
  isRealTimeMode.value = !isRealTimeMode.value
  if (isRealTimeMode.value) {
    await searchAll()
    listenStart()
  } else {
    listenStop()
  }
  await updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: 'messageConfig.isRealTimeMode', value: isRealTimeMode.value }],
  })
}

async function changeIsShowUserId() {
  isShowUserId.value = !isShowUserId.value
  await updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: 'messageConfig.isShowUserId', value: isShowUserId.value }],
  })
}

async function changeIsShowInteract() {
  isShowInteract.value = !isShowInteract.value
  await searchMessage()
  await updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: 'messageConfig.isShowInteract', value: isShowInteract.value }],
  })
}

async function changeIsShowSendAt() {
  isShowSendAt.value = !isShowSendAt.value
  await updateClientConfig({
    clientId: clientId.value,
    kvs: [{ key: 'messageConfig.isShowSendAt', value: isShowSendAt.value }],
  })
}

function listenStart() {
  sse.on('MESSAGE', onMessage)
}

function listenStop() {
  sse.off('MESSAGE', onMessage)
}

function onMessage(message: Message) {
  if (message.roomId !== room!.value!.id) return
  if (message.category === 'interact' && !isShowInteract.value) return

  formatMessage(message)

  if (['comment', 'interact'].includes(message.category)) {
    if (messages.value.length > MAX_MESSAGE_LIST_COUNT) messages.value.pop()
    messages.value = [message, ...messages.value]
  }

  if (['gift', 'superchat'].includes(message.category)) {
    const exist = gifts.value.find(g => g.id === message.id)
    if (exist) {
      exist.gift = message.gift
    } else {
      if (gifts.value.length > MAX_GIFT_LIST_COUNT) gifts.value.pop()
      gifts.value = [message, ...gifts.value]
    }
  }
}

// ── lifecycle ──
onMounted(async () => {
  // setTimeout(() => onResize(), 0)
  await searchAll()
  if (isRealTimeMode.value) listenStart()
})

onBeforeUnmount(() => {
  listenStop()
})
</script>

<style scoped>
.content-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.split-pane {
  height: 100%;
  overflow: auto;
  background: #fff;
}

.scroll-box {
  overflow-y: auto;
  height: 100%;
  padding: 8px 0;
}

.scroll-box::-webkit-scrollbar {
  width: 4px;
}

.scroll-box::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.comment-content {
  font-size: 14px;
  padding: 1px 12px;
  line-height: 1.5;
}

.comment-content:hover {
  background: #f8f9fb;
}

#split-left-top,
#split-left-bottom {
  padding: 5px 10px;
}

.split-pane::-webkit-scrollbar {
  display: none;
}

.ivu-scroll-container::-webkit-scrollbar {
  display: none;
}

.searcher-wrapper {
  height: 30px;
  overflow: visible;
  position: relative;
  z-index: 3;
  padding: 0 14px;
  background: white;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 30px;
}

.search-extra {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  padding: 0px 14px 4px;
  background: #fafbfc;
  border-bottom: 1px solid #e8eaec;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.searcher-wrapper:hover .search-extra {
  opacity: 1;
  pointer-events: auto;
}

.search-input {
  width: 180px;
}

.filter-label {
  font-size: 11px;
  color: #888;
  white-space: nowrap;
  min-width: 52px;
}

.filter-sep {
  font-size: 11px;
  color: #ccc;
}

.row-sep {
  width: 1px;
  height: 14px;
  background: #ddd;
  flex-shrink: 0;
}

.space-left-5px {
  margin-left: 5px;
}

.space-left-2 {
  margin-left: 2px;
}

.guard-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
}
.medal-style {
  font-size: 12px;
  align-content: center;
  border: 0.5px solid gray;
}

.comment-content {
  font-size: 14px;
  padding: 1px 12px;
  line-height: 1.5;
}

.comment-content:hover {
  background: #f8f9fb;
}
.user-link {
  cursor: pointer;
  color: lightsalmon;
  text-decoration: underline;
}
.devider {
  width: 90%;
  height: 1px;
  background: silver;
}
.date-style {
  font-size: 12px;
  font-family: unset;
  font-weight: bold;
  padding: 0px 1px;
}
.voice-container {
  padding: 0 4px;
  border: 1px solid silver;
  border-radius: 8px;
  cursor: pointer;
}

/* 芯片切换 */
.chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  border: 1px solid #ddd;
  font-size: 11px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #666;
  user-select: none;
}

.chip.on {
  background: rgba(45, 140, 240, 0.08);
  border-color: #2d8cf0;
  color: #2d8cf0;
}
</style>
