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
            class="split-pane"
            style="flex: 1; min-height: 0">
            <Scroll
              :on-reach-edge="handleReachEdgeMessage"
              :height="scrollHeightLeft"
              :distance-to-edge="[10, 10]">
              <template
                v-for="(msg, i) in messages"
                :key="i">
                <div class="comment-content">
                  <span
                    v-if="isShowSendAt"
                    class="date-style"
                    >{{ dateFormat(msg.sendAt) }}</span
                  >
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
            </Scroll>
          </div>
        </template>
        <template #right>
          <div
            id="split-right"
            class="split-pane">
            <Scroll
              :on-reach-edge="handleReachEdgeGift"
              :height="scrollHeightRight"
              :distance-to-edge="[10, 10]">
              <template
                v-for="(msg, i) in gifts"
                :key="i">
                <div :style="{ padding: '0 10px' }">
                  <template v-if="msg.category === 'superchat'">
                    <GiftCardMini
                      :gift="msg.gift"
                      :username="`${msg.username}：`"
                      :face="msg.face"
                      :sendAt="msg.sendAt"
                      :isShowSendAt="true">
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
            </Scroll>
          </div>
        </template>
      </Split>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, computed, onMounted, onBeforeUnmount } from 'vue'
import { useConfigStore } from '../store'
import { getPriceProperties, dateFormat, wait, INTERACT_TYPE, getAnchorIcon } from '@tokine/shared'
import { MessageQuery, queryMessages, updateClientConfig } from '../service/api'
import GiftCardMini from '@tokine/shared/components/GiftCardMini.vue'
import FanMedal from '@tokine/shared/components/FanMedal.vue'
import { sse } from '../service/sse-client'
import config from '../service/config'
import { Message } from '@tokine/shared/types.js'

const store = useConfigStore()

// ── state ──
const q = ref('')
const totalPriceGte = ref<number | null>(0.1)
const totalPriceLte = ref<number | null>(null)
const split1 = ref(0.6)
const dateRange = ref<Date[]>([])
const messages = ref<Message[]>([])
const gifts = ref<Message[]>([])
const scrollHeightLeft = ref(1000)
const scrollHeightRight = ref(1000)

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
  console.log(gfs)
  gifts.value = gfs
}

async function searchMessage({
  type,
  scrollToken,
}: {
  type?: 'message' | 'gift'
  scrollToken?: string
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
  if (scrollToken) {
    const [scrollKey, scrollValue] = scrollToken.split(':')
    query[scrollKey] = scrollValue
  }

  if (type === 'gift') {
    query.category = ['gift', 'superchat']
  } else {
    if (isShowInteract.value) {
      query.category = ['comment', 'interact']
    } else {
      query.category = ['comment']
    }
  }

  if (totalPriceGte.value != null) query.totalPriceGte = totalPriceGte.value
  if (totalPriceLte.value != null) query.totalPriceLte = totalPriceLte.value

  const { data } = await queryMessages({
    ...query,
    limit: 40,
  })

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
      .map((k: string) => k.replace(/\[|\]/g, ''))
      .map((k: string) => '\[' + k + '\]')
      .join('|')
    msg.splitContent = msg.content.split(new RegExp('(' + regstr + ')', 'g'))
  }

  if (['gift', 'superchat'].includes(msg.category) && msg.gift) {
    const gift = msg.gift
    gift.priceProperties = getPriceProperties(Number(gift.totalPrice))
    console.log(gift.priceProperties)
  }
}

function handleReachEdgeMessage(direct: number) {
  return new Promise(async resolve => {
    if (direct > 0) {
      const first = messages.value[0]
      const list = await searchMessage({ type: 'message', scrollToken: `sendAtGte:${first.sendAt}` })
      // setTimeout(() => {
      messages.value = [...list, ...messages.value]
      // }, 500)
    }
    if (direct < 0) {
      const last = messages.value[messages.value.length - 1]
      const list = await searchMessage({ type: 'message', scrollToken: `sendAtLte:${last.sendAt}` })
      // setTimeout(() => {
      messages.value = [...messages.value, ...list]
      // }, 700)
    }
    resolve(undefined)
  })
}

function handleReachEdgeGift(direct: number) {
  return new Promise(async resolve => {
    if (direct > 0) {
      const first = gifts.value[0]
      const list = await searchMessage({ type: 'gift', scrollToken: `sendAtGte:${first.sendAt}` })
      // setTimeout(() => {
      gifts.value = [...list, ...gifts.value]
      // }, 700)
    }
    if (direct < 0) {
      const last = gifts.value[gifts.value.length - 1]
      const list = await searchMessage({ type: 'gift', scrollToken: `sendAtLte:${last.sendAt}` })
      // setTimeout(() => {
      gifts.value = [...gifts.value, ...list]
      // }, 700)
    }
    resolve(undefined)
  })
}

function clearDateRange() {
  setTimeout(() => {
    dateRange.value = []
  }, 0)
}

function openBiliUserSpace(userId: string) {
  window.openExternal(`https://space.bilibili.com/${userId}`)
}

function onResize() {
  const elLeft = document.getElementById('split-left')
  scrollHeightLeft.value = elLeft?.clientHeight || 300
  const elRight = document.getElementById('split-right')
  scrollHeightRight.value = elRight?.clientHeight || 1000
}

// function playAudio(url: string) {
//   const audio = new Audio(url)
//   audio.play()
// }

async function changeIsRealTimeMode() {
  isRealTimeMode.value = !isRealTimeMode.value
  if (isRealTimeMode.value) {
    await searchAll()
    listenStart()
  } else {
    listenStop()
  }
  await updateClientConfig({ clientId: clientId.value, kvs: [{ key: 'messageConfig.isRealTimeMode', value: isRealTimeMode.value }] })
}

async function changeIsShowUserId() {
  isShowUserId.value = !isShowUserId.value
  await updateClientConfig({ clientId: clientId.value, kvs: [{ key: 'messageConfig.isShowUserId', value: isShowUserId.value }] })
}

async function changeIsShowInteract() {
  isShowInteract.value = !isShowInteract.value
  await searchMessage()
  await updateClientConfig({ clientId: clientId.value, kvs: [{ key: 'messageConfig.isShowInteract', value: isShowInteract.value }] })
}

async function changeIsShowSendAt() {
  isShowSendAt.value = !isShowSendAt.value
  await updateClientConfig({ clientId: clientId.value, kvs: [{ key: 'messageConfig.isShowSendAt', value: isShowSendAt.value }] })
}

function listenStart() {
  sse.on('MESSAGE', onMessage)
}

function listenStop() {
  sse.off('MESSAGE', onMessage)
}

function onMessage(message: Message) {
  if (message.category === 'interact' && !isShowInteract.value) return

  formatMessage(message)

  if (['comment', 'interact'].includes(message.category)) {
    if (messages.value.length > 1000) messages.value.pop()
    messages.value = [message, ...messages.value]
  }

  if (['gift', 'superchat'].includes(message.category)) {
    const exist = gifts.value.find(g => g.id === message.id)
    if (exist) {
      exist.gift = message.gift
    } else {
      if (gifts.value.length > 500) gifts.value.pop()
      gifts.value = [message, ...gifts.value]
    }
  }
}

// ── lifecycle ──
onMounted(async () => {
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
