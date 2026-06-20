<template>
  <div
    :style="{ position: 'absolute', top: '0px', bottom: '0px', left: '0px', right: '0px', background: windowBackground }">
    <div
      :style="{ position: 'absolute', top: '4px', bottom: '4px', left: '4px', right: '4px', '-webkit-user-select': 'none', opacity: windowOpacity }">
      <!-- @mouseenter="isSingleWindow ? setUnIgnoreMouseEvent() : undefined" @mouseleave="isSingleWindow ? setIgnoreMouseEvent() : undefined" -->
      <div v-if="isShowHeadline" id="gift-headline-wrapper" class="gift-headline-wrapper" @wheel.prevent="giftScroll">
        <transition-group name="fade">
          <template v-for="(gift, index) of headlines" :key="index">
            <div class="gift-tag-wrapper" @mouseenter="hoverGift(gift._id)" @mouseleave="unhoverGift(gift._id)">
              <GiftTag v-if="!giftHover.includes(gift._id)" :gift="gift" />
              <GiftTagExpand v-else :gift="gift" :is-show-super-chat-jpn="isShowSuperChatJPN" />
            </div>
          </template>
        </transition-group>
      </div>
      <div class="message-content-wrapper" :style="{ top: `${headlines.length && isShowHeadline ? '36px' : '0px'}` }">
        <div :style="{ position: 'absolute', height: '100%', width: '80%', '-webkit-app-region': 'drag' }" />
        <div :style="{ position: 'absolute', height: '100%', width: '20%', right: '0' }" />
        <transition-group name="fade" tag="div" class="message-content">
          <p v-for="message in messages" :key="message._id">
            <template v-if="message.category === 'comment'">
              <span :class="!isBorderAdaptContent ? 'max-width' : ''" class="border-image-default" :style="{
                ...borderImageStyle,
                ...getMessageStyleByRole(message),
              }">
                <!-- <Space align="center" :size="0"> -->
                <template v-if="isShowAdminIcon && message.isAdmin">
                  <Icon :type="adminIcon" class="admin-icon" :color="adminIconColor" />
                </template>
                <template v-for="(setting, index) of messageSettings" :key="index">
                  <Avatar v-if="setting.type === 'avatar' && setting.isShow" class="margin-lr-1px" :src="message.avatar"
                    :style="{ ...getAvatarSizeStyle(setting) }" />
                  <!-- <img v-if="setting.type === 'guard' && setting.isShow && message.role" class="guard-icon margin-lr-1px" :src="`${getGuardIcon(message.role)}`" /> -->
                  <FanMedal v-if="setting.type === 'medal' && setting.isShow && message.medal"
                    class="margin-lr-1px vertical-align-middle" :medal="message.medal" :role="message.role" />
                  <span v-if="setting.type === 'name'" class="vertical-align-middle"
                    :style="{ ...fontStyle, ...getNameStyleByRole(message), ...getTextShadow(message, 'name') }">{{
                      message.uname
                    }}</span>
                  <span v-if="setting.type === 'colon' && setting.isShow"
                    :style="{ ...fontStyle, ...getNameStyleByRole(message), ...getTextShadow(message, 'name') }"
                    class="vertical-align-middle">：</span>
                  <span v-if="setting.type === 'comment'">
                    <img v-if="message.emojiUrl" :style="{ height: `${emojiSize}px` }" class="vertical-align-middle"
                      :src="message.emojiUrl" />
                    <span v-else-if="message.emots"
                      :style="{ ...fontStyle, ...getCommentStyleByRole(message), ...getTextShadow(message, 'comment') }"
                      class="vertical-align-middle">
                      <template v-for="(str, index) of message.splitContent" :key="index">
                        <template v-if="message.emots[str]">
                          <img :style="{ height: `${message.emots[str].height || 20}px` }" class="vertical-align-middle"
                            :src="message.emots[str].url" />
                        </template>
                        <template v-else>
                          {{ str }}
                        </template>
                      </template>
                    </span>
                    <span v-else
                      :style="{ ...fontStyle, ...getCommentStyleByRole(message), ...getTextShadow(message, 'comment') }"
                      class="vertical-align-middle">
                      {{ message.content }}
                    </span>
                    <span v-if="message.voiceUrl" class="voice-container" @click="playAudio(message.voiceUrl)">
                      <Icon type="md-play" />
                      <span>{{ `${comment.fileDuration}"` }}</span>
                    </span>
                  </span>
                </template>
                <!-- v-bind="message" -->
                <SimilarCommentBadge v-if="message.similar > 0" class="vertical-align-middle"
                  :style="{ 'margin-left': '5px' }" :number="message.similar" />
                <!-- </Space> -->
              </span>
            </template>
            <template v-if="message.category === 'interactWord'">
              <!-- 入场消息设置默认使用普通设置 -->
              <p :style="getInteractMessageStyle()">
                <Avatar class="margin-lr-1px" :src="message.face"
                  :style="{ width: `28px`, height: `28px`, 'line-height': `28px` }" />
                <!-- <img class="guard-icon margin-lr-1px" :src="`${getGuardIcon(message.role)}`" /> -->
                <FanMedal v-if="isShowFanMedal && message.medal" :medal="message.medal" :role="message.medal.guard" />
                <span :style="{ ...getInteractContentStyle(), ...getInteractTextShadow() }">{{ `${message.uname}
                  ${parseMsgType(message.type)}了直播间` }}</span>
              </p>
            </template>
            <template v-if="message.category === 'superChat'">
              <GiftCard v-if="!isUseMiniGiftCard" v-bind="message">
                <div :style="{ padding: '10px' }">
                  {{ message.content }}
                  <template v-if="message.contentJPN && isShowSuperChatJPN">
                    <div class="divider" />
                    {{ message.contentJPN }}
                  </template>
                </div>
              </GiftCard>
              <GiftCardMini v-else v-bind="message"> {{ `: ${message.content}` }} </GiftCardMini>
            </template>
            <template v-if="message.category === 'gift'">
              <GiftCard v-if="!isUseMiniGiftCard" v-bind="message">
                <span :style="{ display: 'inline-block', padding: '10px 0px 10px 10px' }">{{ `${message.uname} 赠送了
                  ${message.count} 个 ${message.name}` }}</span>
                <img :style="{ 'vertical-align': 'middle', width: '35px' }"
                  :src="giftGifMap[message.id] && giftGifMap[message.id].webp" />
              </GiftCard>
              <GiftCardMini v-else v-bind="message">
                {{ ` 赠送了 ${message.count}个 ${message.name}` }}
              </GiftCardMini>
            </template>
          </p>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { DEFAULT_AVATAR, INTERACT_TYPE, GUARD_ICON_MAP, MAX_MESSAGE } from '../../service/const'
import { getPriceProperties, wait } from '../../service/util'
import PromiseQueue from '../../service/promise-queue'
import GiftTag from './GiftTag.vue'
import GiftTagExpand from './GiftTagExpand.vue'
import { getClientConfig } from '../../service/api'
import { sse } from '../../service/sse-client'
import config from '../../service/config'

defineProps<{ isPreview?: boolean; isSingleWindow?: boolean }>()

let promiseQueue: PromiseQueue | null = null

const roomId = ref(0)
const giftHover = ref<string[]>([])
const giftGifMap = ref<Record<string, any>>({})
const headlines = ref<any[]>([])
const port = ref(3000)
const showGiftCardThreshold = ref(0)
const combineSimilarTime = ref(3000)
const showHeadlineThreshold = ref(0)
const isShowFanMedal = ref(true)
const isUseMiniGiftCard = ref(false)
const isShowFace = ref(true)
const isShowAnchorIcon = ref(true)
const font = ref('auto')
const faceSize = ref(12)
const windowBackground = ref('rgba(0,0,0,0)')
const windowOpacity = ref(1)
const emojiSize = ref(24)
const messages = ref<any[]>([])
const isShowInteractInfo = ref(false)
const isShowSilverGift = ref(false)
const isShowHeadline = ref(true)
const fontWeight = ref('normal')
const hiddenExpiredTime = ref(0)
const messageSettings = ref<any[]>([])
const borderImages = ref<any[]>([])
const isShowType1 = ref(true)
const isShowType2 = ref(true)
const isShowSuperChatJPN = ref(true)
const isShowAdminIcon = ref(false)
const adminIcon = ref('ios-home-outline')
const adminIconColor = ref('coral')
const channelDelayTime = ref(20)
const channelCount = ref(1)

const message_lv0 = ref<Record<string, any>>({})
const name_lv0 = ref<Record<string, any>>({})
const comment_lv0 = ref<Record<string, any>>({})
const message_lv3 = ref<Record<string, any>>({})
const name_lv3 = ref<Record<string, any>>({})
const comment_lv3 = ref<Record<string, any>>({})
const message_lv2 = ref<Record<string, any>>({})
const name_lv2 = ref<Record<string, any>>({})
const comment_lv2 = ref<Record<string, any>>({})
const message_lv1 = ref<Record<string, any>>({})
const name_lv1 = ref<Record<string, any>>({})
const comment_lv1 = ref<Record<string, any>>({})
const message_lvadmin = ref<Record<string, any>>({})
const name_lvadmin = ref<Record<string, any>>({})
const comment_lvadmin = ref<Record<string, any>>({})
const message_lvinteract = ref<Record<string, any>>({})
const comment_lvinteract = ref<Record<string, any>>({})

const stateMap: Record<string, any> = {
  roomId,
  giftHover,
  giftGifMap,
  headlines,
  port,
  showGiftCardThreshold,
  combineSimilarTime,
  showHeadlineThreshold,
  isShowFanMedal,
  isUseMiniGiftCard,
  isShowFace,
  isShowAnchorIcon,
  font,
  faceSize,
  windowBackground,
  windowOpacity,
  emojiSize,
  messages,
  isShowInteractInfo,
  isShowSilverGift,
  isShowHeadline,
  fontWeight,
  hiddenExpiredTime,
  messageSettings,
  borderImages,
  isShowType1,
  isShowType2,
  isShowSuperChatJPN,
  isShowAdminIcon,
  adminIcon,
  adminIconColor,
  channelDelayTime,
  channelCount,
  message_lv0,
  name_lv0,
  comment_lv0,
  message_lv3,
  name_lv3,
  comment_lv3,
  message_lv2,
  name_lv2,
  comment_lv2,
  message_lv1,
  name_lv1,
  comment_lv1,
  message_lvadmin,
  name_lvadmin,
  comment_lvadmin,
  message_lvinteract,
  comment_lvinteract,
}

const borderImageStyle = computed(() => {
  const img = borderImages.value.find((i: any) => i.isSelected)
  if (!img) return {}
  return {
    'border-width': img['border-width'] + 'px',
    'border-image-width': img['border-image-width'],
    'border-image-repeat': img['border-image-repeat'],
    'border-image-slice': img['border-image-slice'],
    'border-image-outset': img['border-image-outset'],
    'border-image-source': 'url(' + img.dataUrl + ')',
  }
})

const isBorderAdaptContent = computed(() => {
  const img = borderImages.value.find((i: any) => i.isSelected)
  return img ? img.isAdaptContent : false
})

const fontStyle = computed(() => ({
  'font-family': font.value,
  'font-weight': fontWeight.value,
}))

function setupSSE() {
  sse.on('SETTING', (payload: any) => onSetting(payload.payload || payload))
  sse.on('COMMENT', (payload: any) => {
    if (promiseQueue) {
      promiseQueue.push(async () => { onComment(payload.payload || payload); await wait(channelDelayTime.value) })
    } else { onComment(payload.payload || payload) }
  })
  sse.on('GIFT', (payload: any) => onGift(payload.payload || payload))
  sse.on('INTERACT', (payload: any) => onInteract(payload.payload || payload))
  sse.on('SUPER_CHAT', (payload: any) => onSuperChat(payload.payload || payload))
  sse.on('MESSAGE_CLEAR', () => clearMessages())
}

function onSetting(payload: Record<string, any>) {
  for (const key in payload) {
    const t = stateMap[key]
    if (t) t.value = payload[key]
  }
}

function onComment(comment: any) {
  comment.category = 'comment'
  comment.avatar = comment.avatar ? comment.avatar + '@48w_48h' : DEFAULT_AVATAR
  comment.role = comment.guard || comment.role
  comment.sendAt = comment.sendAt || Date.now()
  if (comment.type === 1 && !isShowType1.value) return
  if (comment.type === 2 && !isShowType2.value) return
  if (combineSimilarTime.value) {
    const rev = messages.value.filter((m: any) => m.category === 'comment')
    for (const m of rev) {
      if (m.sendAt < Date.now() - combineSimilarTime.value) break
      if (m.content === comment.content) { m.similar = (m.similar || 0) + 1; return }
    }
  }
  if (comment.emots) {
    const regstr = Object.keys(comment.emots).map((k: string) => k.replace(/\[|\]/g, '')).map((k: string) => '\[' + k + '\]').join('|')
    comment.splitContent = comment.content.split(new RegExp('(' + regstr + ')', 'g'))
  }
  if (messages.value.length > MAX_MESSAGE) messages.value.pop()
  messages.value = [comment, ...messages.value]
}

function onGift(gift: any) {
  if (!isShowSilverGift.value && gift.coinType !== 1) return
  gift.category = 'gift'
  gift.avatar = gift.avatar ? gift.avatar + '@48w_48h' : DEFAULT_AVATAR
  gift.sendAt = Date.now()
  gift.totalPrice = gift.price * gift.count || 0
  gift.priceProperties = getPriceProperties(gift.totalPrice) || {}
  addToHeadline(gift)
  if (gift.totalPrice < showGiftCardThreshold.value) return
  const exist = messages.value.find((m: any) => m._id === gift._id)
  if (exist) { exist.count = gift.count; exist.totalPrice = gift.price * (exist.count || 1); exist.priceProperties = gift.priceProperties }
  else { if (messages.value.length > MAX_MESSAGE) messages.value.pop(); messages.value = [gift, ...messages.value] }
}

function onInteract(interact: any) {
  if (!isShowInteractInfo.value) return
  interact.category = 'interactWord'
  if (messages.value.length > MAX_MESSAGE) messages.value.pop()
  messages.value = [interact, ...messages.value]
}

function onSuperChat(sc: any) {
  sc.category = 'superChat'
  sc.avatar = sc.avatar ? sc.avatar + '@48w_48h' : DEFAULT_AVATAR
  sc.sendAt = Date.now()
  sc.totalPrice = sc.price || 0
  sc.priceProperties = getPriceProperties(sc.totalPrice) || {}
  addToHeadline(sc)
  const exists = messages.value.find((m: any) => m._id === sc._id)
  if (exists) { if (sc.contentJPN) exists.contentJPN = sc.contentJPN; return }
  if (sc.totalPrice < showGiftCardThreshold.value) return
  if (messages.value.length > MAX_MESSAGE) messages.value.pop()
  messages.value = [sc, ...messages.value]
}

function addToHeadline(item: any) {
  if (item.totalPrice < showHeadlineThreshold.value) return
  const exist = headlines.value.find((m: any) => m._id === item._id)
  if (exist) { exist.count = item.count; exist.totalPrice = item.price * item.count; exist.priceProperties = item.priceProperties; exist.contentJPN = item.contentJPN || exist.contentJPN }
  else { giftHover.value = [...giftHover.value, item._id]; setTimeout(() => { giftHover.value = giftHover.value.filter((h: string) => h !== item._id) }, 5000); headlines.value = [item, ...headlines.value] }
}

// async function getSetting() {
//   const { data } = await fetchSetting()
//   for (const key in data) { const t = stateMap[key]; if (t) t.value = data[key] }
// }

function getAvatarSizeStyle(setting: any) {
  if (setting.type !== 'avatar') return
  return { width: setting.size + 'px', height: setting.size + 'px', 'line-height': setting.size + 'px' }
}

function getMessageStyleByRole(msg: any) { return stateMap['message_lv' + (msg.isAdmin ? 'admin' : msg.role)]?.value }
function getNameStyleByRole(msg: any) { return stateMap['name_lv' + (msg.isAdmin ? 'admin' : msg.role)]?.value }
function getCommentStyleByRole(msg: any) { return stateMap['comment_lv' + (msg.isAdmin ? 'admin' : msg.role)]?.value }
function getInteractMessageStyle() { return message_lvinteract.value }
function getInteractContentStyle() { return comment_lvinteract.value }

function getTextShadow(msg: any, type: string) {
  const role = msg.isAdmin ? 'admin' : msg.role
  const style = stateMap[type + '_lv' + role]?.value || {}
  const w = style['--textStrokeWidth']; const c = style['--textStrokeColor']
  if (!parseFloat(w) || !c) return { textShadow: '' }
  return { textShadow: w + ' 0px ' + w + ' ' + c + ', 0px ' + w + ' ' + w + ' ' + c + ', -' + w + ' 0px ' + w + ' ' + c + ', 0px -' + w + ' ' + w + ' ' + c }
}

function getInteractTextShadow() { return getTextShadow({ isAdmin: false, role: 'interact' }, 'comment') }
function parseMsgType(type: number) { return (INTERACT_TYPE as any)[type] }
function hoverGift(giftId: string) { giftHover.value = [...giftHover.value, giftId] }
function unhoverGift(giftId: string) { giftHover.value = giftHover.value.filter((id: string) => id !== giftId) }
function clearMessages() { messages.value = []; headlines.value = [] }
function giftScroll(e: WheelEvent) { document.getElementById('gift-headline-wrapper')!.scrollLeft += e.deltaY }
function getGuardIcon(level: number) { return (GUARD_ICON_MAP as any)[level] }
function playAudio(url: string) { new Audio(url).play() }

document.getElementsByTagName('body')[0].setAttribute('style', 'background-color:rgba(0,0,0,0);')

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const port = params.get('port') || '30031'
  // port.value = parseInt(params.get('port') || '8081')
  const clientId = params.get('clientId') || ''
  const roomId = params.get('roomId')

  config.set('baseUrl', `http://127.0.0.1:${port}`)

  const clientConfig = await getClientConfig({ clientId })

  console.log(clientConfig)

  for (const key in clientConfig.dmStyle) {
    const t = stateMap[key]
    if (t) t.value = clientConfig.dmStyle[key]
  }

  promiseQueue = new PromiseQueue({ limit: channelCount.value })
  setupSSE()
  sse.connect(`http://127.0.0.1:${port}`, clientId)
  setInterval(() => {
    headlines.value = headlines.value.map((h: any) => { h.existsTime = (h.existsTime || 0) + 1000; return h }).filter((h: any) => h.sendAt + h.priceProperties.time > Date.now())
  }, 1000)
  setInterval(() => {
    if (!hiddenExpiredTime.value) return
    messages.value = messages.value.filter((m: any) => m.sendAt + hiddenExpiredTime.value > Date.now())
  }, 2000)
})
</script>


<style scoped>
.layout {
  position: relative;
  overflow: hidden;
}

.layout-logo {
  float: left;
  position: relative;
}

.layout-nav {
  margin: 0 auto;
}

.layout-footer-center {
  text-align: center;
}

.gift-headline-wrapper {
  white-space: nowrap;
  position: absolute;
  z-index: 1;
  overflow-x: auto;
  width: 100%;
  top: 0px;
  /* -webkit-app-region: no-drag; */
}

.gift-headline-wrapper::-webkit-scrollbar {
  display: none;
}

.message-content-wrapper {
  /* height: calc(100% - 40px); */
  bottom: 0px;
  width: 100%;
  overflow: hidden;
  position: absolute;
}

.message-content {
  width: 100%;
  position: absolute;
  bottom: 0px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column-reverse;
}

.message-content::-webkit-scrollbar {
  display: none;
}

.gift-tag-wrapper {
  display: inline-block;
  vertical-align: top;
}

.divider {
  border-top: 1px solid;
  width: 100%;
  margin: 10px 0;
  position: relative;
}

.guard-icon {
  width: 22px;
  height: 22px;
  display: inline-block;
  vertical-align: middle;
  background-size: contain;
  background-repeat: no-repeat;
}

.vertical-align-middle {
  vertical-align: middle;
}

/* .username {
  margin: auto;
  white-space: nowrap;
}
.username::before {
  content: attr(text);
  position: absolute;
  z-index: -1;
  -webkit-text-stroke-width: var(--textStrokeWidth);
  -webkit-text-stroke-color: var(--textStrokeColor);
}
.comment {
  margin: auto;
}
.comment::before {
  content: attr(text);
  position: absolute;
  width: max-content;
  z-index: -1;
  -webkit-text-stroke-width: var(--textStrokeWidth);
  -webkit-text-stroke-color: var(--textStrokeColor);
} */

.max-width {
  width: 100%;
}

.border-image-default {
  border-style: solid;
  border-color: transparent;
  display: inline-block;
  border-width: 0px;
}

.margin-lr-1px {
  margin: 0 1px;
}

.admin-icon {
  font-size: 22px;
  vertical-align: middle;
}
</style>
