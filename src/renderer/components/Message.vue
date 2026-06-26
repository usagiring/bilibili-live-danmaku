<template>
  <div>
    <div class="searcher-wrapper">
      <DatePicker
        class="space-left-5px"
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        placeholder="选择时间范围"
        style="width: 280px"
        size="small"
        :model-value="dateRange"
        @on-change="changeDateRange"
        @on-clear="clearDateRange" />
      <Input
        v-model="q"
        class="space-left-5px"
        placeholder="ID/名称/评论"
        clearable
        style="width: 200px"
        size="small" />
      <Button
        class="space-left-5px"
        type="primary"
        shape="circle"
        icon="ios-search"
        :disabled="isRealTimeMode"
        @click="searchAll" />
      <Checkbox
        :model-value="isShowSilverGift"
        @on-change="showSilverGift">
        显示银瓜子礼物
      </Checkbox>
      <Checkbox
        :model-value="isRealTimeMode"
        @on-change="changeIsRealTimeMode">
        实时更新模式
      </Checkbox>
    </div>
    <div class="content-wrapper">
      <Split
        v-model="split1"
        @on-moving="onResize">
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
                  <span class="date-style">{{ dateFormat(msg.sendAt) }}</span>
                  <FanMedal
                    v-if="msg.medal"
                    class="margin-lr-1px vertical-align-middle"
                    :medal="msg.medal"
                    :anchorIcon="msg.anchorIcon" />
                  <span class="space-left-2">{{ `${msg.username}` }}</span>
                  <span
                    v-if="isShowUserSpaceLink"
                    class="user-link"
                    @click="openBiliUserSpace(msg.userId)">
                    {{ `(${msg.userId})` }}
                  </span>
                  <span>: </span>
                  <!-- <span
                      v-if="msg.voiceUrl"
                      class="voice-container"
                      @click="playAudio(msg.voiceUrl)">
                      <Icon type="md-play" />
                      <span>{{ `${msg.fileDuration}"` }}</span>
                    </span> -->
                  <img
                    v-if="msg.emojiUrl"
                    :style="{ 'vertical-align': 'middle', height: '20px' }"
                    :src="msg.emojiUrl" />
                  <span v-else>{{ msg.content }}</span>
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
                      :username="msg.username"
                      :face="msg.face"
                      :isShowSendAt="true">
                      {{ `: ${msg.content}` }}
                    </GiftCardMini>
                  </template>
                  <template v-else>
                    <GiftCardMini
                      :gift="msg.gift"
                      :username="msg.username"
                      :face="msg.face"
                      :isShowSendAt="true">
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useConfigStore } from '../store'
import { shell } from 'electron'
import { getPriceProperties, dateFormat, wait, INTERACT_TYPE } from '@tokine/shared'
import { MessageQuery, queryMessages } from '../service/api'
import GiftCardMini from '@tokine/shared/components/GiftCardMini.vue'
import FanMedal from '@tokine/shared/components/FanMedal.vue'
import { sse } from '../service/sse-client'
import config from '../service/config'
import { Message } from '@tokine/shared/types.js'

const store = useConfigStore()

// ── state ──
const q = ref('')
const split1 = ref(0.6)
const dateRange = ref<Date[]>([])
const messages = ref<Message[]>([])
const gifts = ref<Message[]>([])
const scrollHeightLeft = ref(300)
const scrollHeightRight = ref(1000)

const isShowSilverGift = ref(config.messageConfig?.isShowSilverGift)
const isShowUserSpaceLink = ref(true)
const isRealTimeMode = ref(config.messageConfig?.isRealTimeMode)

const room = computed(() => {
  return store.activeRoom
})

// ── methods ──
function changeDateRange([startTime, endTime]: string[]) {
  dateRange.value = [new Date(startTime), new Date(endTime)]
}

async function searchAll(options?: any) {
  const messages = await searchMessage(options)
  messages.value = messages
  const gift = await searchGift(options)
  gifts.value = gift
}

async function searchMessage({ sort, scrollToken }: { sort?: string; scrollToken?: string } = {}) {
  if (!room) return
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
    // const [scrollKey, scrollValue] = scrollToken.split(':')
    // query.sendAt = query.sendAt || {}
    // query.sendAt[scrollKey] = Number(scrollValue)
  }
  const { data } = await queryMessages({
    ...query,
    category: ['comment', 'interact'],
    limit: 40,
  })
  return data
}

async function searchGift({ sort, scrollToken }: { sort?: string; scrollToken?: string } = {}) {
  if (!room) return
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
    // const [scrollKey, scrollValue] = scrollToken.split(':')
    // query.sendAt = query.sendAt || {}
    // query.sendAt[scrollKey] = Number(scrollValue)
  }

  if (!isShowSilverGift.value) {
    query.coinType = 'gold'
  }

  const { data } = await queryMessages({
    ...query,
    category: ['gift', 'superchat'],
    limit: 40,
  })

  for (const msg of data) {
    formatGift(msg)
  }

  return data
}

function formatGift(msg: Message) {
  const gift = msg.gift
  if (!gift) return
  const totalPrice = (gift.count || 1) * gift.price
  gift.totalPrice = totalPrice
  gift.priceProperties = getPriceProperties(gift.totalPrice)
}

function handleReachEdgeMessage(direct: number) {
  return new Promise(async resolve => {
    if (direct > 0) {
      const first = messages.value[0]
      const list = await searchMessage({ scrollToken: `sendAtGte:${first.sendAt}` })
      // setTimeout(() => {
      messages.value = [...list, ...messages.value]
      // }, 500)
    }
    if (direct < 0) {
      const last = messages.value[messages.value.length - 1]
      const list = await searchMessage({ scrollToken: `sendAtLte:${last.sendAt}` })
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
      const list = await searchGift({ scrollToken: `sendAtGte:${first.sendAt}` })
      // setTimeout(() => {
      gifts.value = [...list, ...gifts.value]
      // }, 700)
    }
    if (direct < 0) {
      const last = gifts.value[gifts.value.length - 1]
      const list = await searchGift({ scrollToken: `sendAtLte:${last.sendAt}` })
      // setTimeout(() => {
      gifts.value = [...gifts.value, ...list]
      // }, 700)
    }
    resolve(undefined)
  })
}

function showUserSpaceLink(status: boolean) {}

async function showSilverGift(status: boolean) {
  isShowSilverGift.value = status
  let list = await searchGift()
  gifts.value = list
}

function clearDateRange() {
  setTimeout(() => {
    dateRange.value = []
  }, 0)
}

function openBiliUserSpace(userId: string) {
  shell.openExternal(`https://space.bilibili.com/${userId}`)
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

async function changeIsRealTimeMode(status: boolean) {
  if (status) {
    await searchAll()
    listenStart()
  } else {
    listenStop()
  }
}

function listenStart() {
  sse.on('MESSAGE', onMessage)
}

function listenStop() {
  sse.off('COMMENT', onMessage)
}

function onMessage(message: Message) {
  if (['comment', 'interact'].includes(message.category)) {
    if (messages.value.length > 1000) messages.value.pop()
    messages.value = [message, ...messages.value]
  }

  if (['gift', 'superchat'].includes(message.category)) {
    formatGift(message)
    if (!isShowSilverGift.value && message.gift?.coinType === 'silver') return
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
  setTimeout(() => onResize(), 0)
  await searchAll()
  if (isRealTimeMode.value) listenStart()
})

window.addEventListener('resize', onResize)

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  listenStop()
})
</script>

<style scoped>
.content-wrapper {
  height: calc(100% - 35px);
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
  height: 35px;
  position: relative;
  min-width: 1000px;
  padding: 0px 30px;
  border-bottom: 1px solid lightgray;
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
</style>
