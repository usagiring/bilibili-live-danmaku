<template>
  <div :style="rootStyle">
    <!-- 礼物头条 -->
    <div
      v-if="isShowHeadline"
      id="gift-headline-wrapper"
      class="gift-headline-wrapper"
      style="-webkit-app-region: no-drag"
      @wheel.prevent="giftScroll">
      <transition-group name="fade">
        <template
          v-for="(msg, index) of headlines"
          :key="index"
          @mouseleave="unhoverHeadline()">
          <div
            class="gift-tag-wrapper"
            @mouseenter="hoverHeadline(msg.id)">
            <GiftTag
              v-if="false"
              :gift="msg" />
            <GiftTagExpand
              v-else
              :gift="msg"
              :is-show-super-chat-jpn="isShowSuperChatJPN" />
          </div>
        </template>
      </transition-group>
    </div>

    <!-- 消息列表 -->
    <div
      class="message-content-wrapper"
      :style="contentWrapperStyle">
      <transition-group
        name="fade"
        tag="div"
        class="message-content">
        <div
          v-for="message in messages"
          :key="message.id">
          <!-- 弹幕评论 -->
          <template v-if="message.category === 'comment' || message.category === 'interact'">
            <span
              :class="!isBorderAdaptContent ? 'max-width' : ''"
              class="border-image-default"
              :style="{ ...borderImageStyle, ...getContainerStyle(message) }">
              <!-- 管理员图标 -->
              <template v-if="adminIcon && message.isAdmin">
                <Icon
                  :type="adminIcon"
                  class="admin-icon"
                  :color="adminIconColor" />
              </template>

              <!-- 行内插槽：头像 / 勋章 / 昵称 /  正文 -->
              <template
                v-for="(s, index) of messageSlots"
                :key="index">
                <Avatar
                  v-if="s.type === 'face' && s.isShow"
                  class="margin-lr-1px"
                  :src="message.face"
                  :style="{ ...faceSizeStyle }" />
                <FanMedal
                  v-if="s.type === 'medal' && s.isShow && message.medal"
                  class="margin-lr-1px vertical-align-middle"
                  :medal="message.medal"
                  :anchorIcon="message.anchorIcon" />
                <span
                  v-if="s.type === 'name' && s.isShow"
                  class="vertical-align-middle"
                  :style="{ ...fontStyle, ...getNameStyle(message), ...getTextShadow(message, 'name') }">
                  {{ `${message.username}${isShowColon ? '：' : ''}` }}
                </span>
                <span v-if="s.type === 'comment' && s.isShow">
                  <img
                    v-if="message.emojiUrl"
                    class="vertical-align-middle"
                    :src="message.emojiUrl"
                    :style="{ height: `${emojiSize}px` }" />
                  <span
                    v-else-if="message.emots"
                    class="vertical-align-middle"
                    :style="{ ...fontStyle, ...getCommentStyle(message), ...getTextShadow(message, 'comment') }">
                    <template
                      v-for="(str, index) of message.splitContent"
                      :key="index">
                      <template v-if="message.emots[str]">
                        <img
                          class="vertical-align-middle"
                          :src="message.emots[str].url"
                          :style="{ height: `${message.emots[str].height || 20}px` }" />
                      </template>
                      <template v-else>{{ str }}</template>
                    </template>
                  </span>
                  <span
                    v-else
                    class="vertical-align-middle"
                    :style="{
                      ...fontStyle,
                      ...getCommentStyle(message),
                      ...getTextShadow(message, 'comment'),
                    }"
                    >{{ message.content }}</span
                  >
                  <!-- 语音 -->
                  <span
                    v-if="message.voiceUrl"
                    class="voice-container"
                    @click="playAudio(message.voiceUrl)">
                    <Icon type="md-play" />
                    <span>{{ message.fileDuration ? `${message.fileDuration}"` : '' }}</span>
                  </span>
                </span>
              </template>

              <!-- 相似评论标记 -->
              <SimilarCommentBadge
                v-if="message.similar! > 0"
                class="vertical-align-middle"
                :number="message.similar!"
                :color="message.similarColor!"
                :style="{ 'margin-left': '5px' }" />
            </span>
          </template>

          <!-- SuperChat -->
          <template v-else-if="message.category === 'superchat'">
            <GiftCard
              v-if="!isUseMiniGiftCard"
              :gift="message.gift"
              :username="message.username"
              :face="message.face">
              <div :style="{ padding: '10px' }">
                {{ message.content }}
                <template v-if="message.contentJPN && isShowSuperChatJPN">
                  <div class="divider" />
                  {{ message.contentJPN }}
                </template>
              </div>
            </GiftCard>
            <GiftCardMini
              v-else
              :gift="message.gift"
              :username="message.username"
              :face="message.face">
              {{ `: ${message.content}` }}
            </GiftCardMini>
          </template>

          <!-- 礼物 -->
          <template v-else-if="message.category === 'gift'">
            <GiftCard
              v-if="!isUseMiniGiftCard"
              :gift="message.gift"
              :username="message.username"
              :face="message.face">
              <span :style="{ display: 'inline-block', padding: '10px 0px 10px 10px' }">
                {{ `${message.username} 赠送了 ${message.gift?.count} 个 ${message.gift?.name}` }}
              </span>
              <img
                :src="giftGifMap[message.id] && giftGifMap[message.id].webp"
                :style="{ 'vertical-align': 'middle', width: '35px' }" />
            </GiftCard>
            <GiftCardMini
              v-else
              :gift="message.gift"
              :username="message.username"
              :face="message.face">
              {{ ` 赠送了 ${message.gift?.count}个 ${message.gift?.name}` }}
            </GiftCardMini>
          </template>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRefs } from 'vue'
import { DEFAULT_FACE, INTERACT_TYPE, ANCHOR_ICON_MAP, MAX_MESSAGE, COLORS } from '../../service/const'
import { getPriceProperties, wait } from '../../service/util'
import PromiseQueue from '../../service/promise-queue'
import GiftTag from '@tokine/shared/components/GiftTag.vue'
import GiftTagExpand from '@tokine/shared/components/GiftTagExpand.vue'
import SimilarCommentBadge from '@tokine/shared/components/SimilarCommentBadge.vue'
import FanMedal from '@tokine/shared/components/FanMedal.vue'
import GiftCard from '@tokine/shared/components/GiftCard.vue'
import GiftCardMini from '@tokine/shared/components/GiftCardMini.vue'
import { getClientConfig } from '../../service/api'
import { sse } from '../../service/sse-client'
import config from '../../service/config'

defineProps<{ isPreview?: boolean; isSingleWindow?: boolean }>()

let promiseQueue: PromiseQueue | null = null

const giftGifMap = ref<Record<string, any>>({})
const roomId = ref<String>('')
const headlines = ref<Message[]>([
  // {
  //   id: 192,
  //   content: '残*** 赠送了 盛典门票',
  //   color: null,
  //   category: 'gift',
  //   type: null,
  //   sendAt: 1782125493078,
  //   roomId: '5050',
  //   clientId: 'dd987939-7cf2-4cc9-8173-7857a9c22950',
  //   userId: '0',
  //   username: '残***',
  //   usernameColor: null,
  //   roles: [0],
  //   face: 'http://i1.hdslb.com/bfs/face/865dff24ced774fb2557456bc45644389910a17f.jpg@48w_48h',
  //   emots: null,
  //   voiceUrl: null,
  //   fileDuration: null,
  //   emojiUrl: null,
  //   gift: {
  //     id: '34144',
  //     type: 'gift',
  //     name: '盛典门票',
  //     price: 0.1,
  //     count: 1,
  //     coinType: 'gold',
  //     batchComboId: 'batch:gift:combo_id:343333383836353939d41d8cd98f00b204e9800998ecf8427e:433351:34144:1782125492.2750',
  //     totalPrice: 0.1,
  //     priceProperties: {
  //       colors: ['#EDF5FF', '#2A60B2'],
  //       duration: 60000,
  //     },
  //   },
  //   medal: null,
  //   interact: null,
  //   createdAt: 1782125493000,
  //   styleSuffix: '0',
  // },
])
const emojiSize = ref(24)

const dmStyle = reactive<DmStyle>({
  isShowFace: true,
  isShowAnchorIcon: true,
  isShowFanMedal: true,
  isShowHeadline: true,
  faceSize: 12,
  combineSimilarTime: 3000,
  hiddenExpiredTime: 0,
  showHeadlineThreshold: 0,
  isShowInteractInfo: true,
  showGiftCardThreshold: 0,
  isShowSilverGift: false,
  font: 'auto',
  fontWeight: 'normal',
  isUseMiniGiftCard: false,
  adminIcon: 'ios-home-outline',
  isShowAdminIcon: false,
  adminIconColor: 'coral',
  isShowType1: true,
  isShowType2: true,
  channelCount: 1,
  channelDelayTime: 20,
  isShowSuperChatJPN: true,
  windowOpacity: 1,
  windowBackground: 'rgba(0,0,0,0)',
  messageSlots: [],
  borderImages: [],

  messageContainer0: {},
  messageUsername0: {},
  messageComment0: {},
  messageContainer1: {},
  messageUsername1: {},
  messageComment1: {},
  messageContainer2: {},
  messageUsername2: {},
  messageComment2: {},
  messageContainer3: {},
  messageUsername3: {},
  messageComment3: {},
  messageContainer99: {},
  messageUsername99: {},
  messageComment99: {},
  messageContainerInteract: {},
  messageCommentInteract: {},
})

const {
  showGiftCardThreshold,
  combineSimilarTime,
  showHeadlineThreshold,
  isShowFanMedal,
  isUseMiniGiftCard,
  font,
  faceSize,
  windowBackground,
  windowOpacity,
  isShowInteractInfo,
  isShowSilverGift,
  isShowHeadline,
  fontWeight,
  hiddenExpiredTime,
  messageSlots,
  borderImages,
  isShowType1,
  isShowType2,
  isShowSuperChatJPN,
  adminIcon,
  adminIconColor,
  channelDelayTime,
} = toRefs(dmStyle)

const messages = ref<Message[]>([
  {
    id: 135,
    content: '就有一个17智力头环，不是关键的东西',
    color: '#ffffff',
    category: 'comment',
    type: 0,
    sendAt: 1782125409239,
    roomId: '5050',
    clientId: 'dd987939-7cf2-4cc9-8173-7857a9c22950',
    userId: '0',
    username: 's***',
    usernameColor: '#000000',
    roles: [1],
    face: 'http://i0.hdslb.com/bfs/face/member/noface.jpg@48w_48h',
    emots: null,
    voiceUrl: null,
    fileDuration: null,
    emojiUrl: null,
    gift: null,
    medal: null,
    interact: null,
    createdAt: 1782125410000,
    styleSuffix: '0',
    isAdmin: false,
  },
  {
    id: 192,
    content: '残*** 赠送了 盛典门票',
    color: null,
    category: 'gift',
    type: null,
    sendAt: 1782125493078,
    roomId: '5050',
    clientId: 'dd987939-7cf2-4cc9-8173-7857a9c22950',
    userId: '0',
    username: '残***',
    usernameColor: null,
    roles: [0],
    face: 'http://i1.hdslb.com/bfs/face/865dff24ced774fb2557456bc45644389910a17f.jpg@48w_48h',
    emots: null,
    voiceUrl: null,
    fileDuration: null,
    emojiUrl: null,
    gift: {
      id: '34144',
      type: 'gift',
      name: '盛典门票',
      price: 0.1,
      count: 1,
      coinType: 'gold',
      batchComboId: 'batch:gift:combo_id:343333383836353939d41d8cd98f00b204e9800998ecf8427e:433351:34144:1782125492.2750',
      totalPrice: 0.1,
      priceProperties: {
        colors: ['#EDF5FF', '#2A60B2'],
        duration: 60000,
      },
    },
    medal: null,
    interact: null,
    createdAt: 1782125493000,
    styleSuffix: '0',
  },
  {
    id: 466,
    content: '只算最高',
    color: '#e33fff',
    category: 'comment',
    type: 0,
    sendAt: 1782125594993,
    roomId: '5050',
    clientId: 'dd987939-7cf2-4cc9-8173-7857a9c22950',
    userId: '0',
    username: '蝉***',
    usernameColor: '#000000',
    roles: [1],
    face: 'https://i1.hdslb.com/bfs/face/ad40d9066b0e4ea2f120a1c04d25eec273b37363.jpg@48w_48h',
    emots: null,
    voiceUrl: null,
    fileDuration: null,
    emojiUrl: null,
    gift: null,
    medal: {
      name: '大母鹅',
      level: 35,
      roomId: '5050',
      color: {
        bg: '#4C7DFF99',
        border: '#58A1F8',
        level: '#4C7DFFE6',
        text: '#FFFFFF',
      },
    },
    interact: null,
    createdAt: 1782125596000,
    styleSuffix: '1',
    anchorIcon: 'https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard3.png@44w_44h.webp',
    isAdmin: false,
  },
])

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

const rootStyle = computed(
  () =>
    ({
      position: 'absolute',
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px',
      padding: '4px',
      background: windowBackground.value,
      opacity: windowOpacity.value,
      '-webkit-user-select': 'none',
      '-webkit-app-region': 'drag',
    }) as Record<string, string | number>,
)

const contentWrapperStyle = computed(
  () =>
    ({
      top: `${headlines.value.length && isShowHeadline.value ? '36px' : '0px'}`,
      '-webkit-app-region': 'no-drag',
    }) as Record<string, string>,
)

const faceSizeStyle = computed(() => {
  console.log(faceSize.value)
  return {
    width: `${faceSize.value}px`,
    height: `${faceSize.value}px`,
    'line-height': `${faceSize.value}px`,
  }
})

const isShowColon = computed(() => {
  const showSlots = messageSlots.value.filter(s => s.isShow)
  const index = messageSlots.value.findIndex(s => s.type === 'name')
  return index !== showSlots.length - 1
})

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const port = params.get('port') || window.location.port || '30031'
  // port.value = parseInt(params.get('port') || '8081')
  const clientId = params.get('clientId') || ''
  roomId.value = String(params.get('roomId') || '')

  config.set('baseUrl', `http://127.0.0.1:${port}`)

  const { data: clientConfig } = await getClientConfig({ clientId })

  if (clientConfig.dmStyle) {
    Object.assign(dmStyle, clientConfig.dmStyle)
  }

  console.log(dmStyle)

  // promiseQueue = new PromiseQueue({ limit: channelCount.value })
  setupSSE()
  sse.connect(`http://127.0.0.1:${port}`, clientId)
  setInterval(() => {
    headlines.value = headlines.value
      .map((h: any) => {
        h.existsTime = (h.existsTime || 0) + 1000
        return h
      })
      .filter((h: any) => h.sendAt + h.priceProperties.time > Date.now())
  }, 1000)
  setInterval(() => {
    if (!hiddenExpiredTime.value) return
    messages.value = messages.value.filter((m: any) => m.sendAt + hiddenExpiredTime.value > Date.now())
  }, 2000)
})

function setupSSE() {
  sse.on('DM_STYLE', data => onDMStyle(data))
  sse.on('MESSAGE', data => {
    if (roomId.value && roomId.value !== '*') {
      if (data.roomId !== roomId.value) return
    }

    if (promiseQueue) {
      promiseQueue.push(async () => {
        onMessage(data)
        await wait(channelDelayTime.value)
      })
    } else {
      onMessage(data)
    }
  })
  sse.on('MESSAGE_CLEAR', () => {
    messages.value = []
    headlines.value = []
  })
}

function onDMStyle(data: Record<string, any>) {
  console.log(data)
  Object.assign(dmStyle, data)
}

function getStyleSuffix(msg: Message) {
  if (msg.category === 'interact') {
    return 'interact'
  }

  if (Array.isArray(msg.roles) && msg.roles.length) {
    return String(Math.max(...msg.roles.map(Number)))
  }

  return '0'
}

function onMessage(msg: Message) {
  let isAddMessage = true

  // common
  msg.face = msg.face ? msg.face + '@48w_48h' : DEFAULT_FACE
  msg.sendAt = msg.sendAt || Date.now()
  msg.styleSuffix = getStyleSuffix(msg)
  msg.anchorIcon = getAnchorIcon(msg)

  // comment
  if (msg.category === 'comment') {
    msg.isAdmin = getIsAdmin(msg)
    if (msg.type === 1 && !isShowType1.value) isAddMessage = false
    if (msg.type === 2 && !isShowType2.value) isAddMessage = false
    if (combineSimilarTime.value) {
      const rev = messages.value.filter((m: any) => m.category === 'comment')
      for (const m of rev) {
        if (m.sendAt < Date.now() - combineSimilarTime.value) break
        if (m.content === msg.content) {
          m.similar = (m.similar || 0) + 1
          if (!m.similarColor) m.similarColor = getRandomColor()
          isAddMessage = false
        }
      }
    }
    if (msg.emots) {
      const regstr = Object.keys(msg.emots)
        .map((k: string) => k.replace(/\[|\]/g, ''))
        .map((k: string) => '\[' + k + '\]')
        .join('|')
      msg.splitContent = msg.content.split(new RegExp('(' + regstr + ')', 'g'))
    }
  }

  // gift
  if (msg.category === 'gift' && msg.gift) {
    const totalPrice = msg.gift?.count * msg.gift?.price
    msg.gift.totalPrice = totalPrice

    if (!isShowSilverGift.value && msg.gift?.coinType !== 'gold') return
    msg.gift.priceProperties = getPriceProperties(totalPrice)

    addToHeadline(msg)

    const exist = messages.value.find((m: any) => m.id === msg.id)
    if (exist) {
      exist.gift = msg.gift
    }

    if (totalPrice < showGiftCardThreshold.value) isAddMessage = false
  }

  if (msg.category === 'interact' && msg.interact) {
    if (!isShowInteractInfo.value) isAddMessage = false
    msg.content = msg.content || INTERACT_TYPE[msg.type || 1]
  }

  if (msg.category === 'superchat' && msg.gift) {
    const totalPrice = msg.gift?.count * msg.gift?.price
    addToHeadline(msg)
    if (totalPrice < showGiftCardThreshold.value) isAddMessage = false
  }

  if (isAddMessage) {
    console.log(msg)
    if (messages.value.length > MAX_MESSAGE) messages.value.pop()
    messages.value = [msg, ...messages.value]
  }
}

function addToHeadline(msg: Message) {
  if (!msg.gift) return
  if (msg.gift.totalPrice! < showHeadlineThreshold.value) return

  const exist = headlines.value.find((m: any) => m.id === msg.id)
  if (exist) {
    exist.gift = msg.gift
  } else {
    msg.isHover = true
    setTimeout(() => {
      msg.isHover = false
    }, 5000)
    headlines.value = [msg, ...headlines.value]
  }
}

function styleBySuffix(suffix?: string) {
  if (!suffix) suffix = '0'
  if (suffix === '0')
    return {
      container: dmStyle.messageContainer0,
      username: dmStyle.messageUsername0,
      comment: dmStyle.messageComment0,
    }
  if (suffix === '1')
    return {
      container: dmStyle.messageContainer1,
      username: dmStyle.messageUsername1,
      comment: dmStyle.messageComment1,
    }
  if (suffix === '2')
    return {
      container: dmStyle.messageContainer2,
      username: dmStyle.messageUsername2,
      comment: dmStyle.messageComment2,
    }
  if (suffix === '3')
    return {
      container: dmStyle.messageContainer3,
      username: dmStyle.messageUsername3,
      comment: dmStyle.messageComment3,
    }
  if (suffix === '99')
    return {
      container: dmStyle.messageContainer99,
      username: dmStyle.messageUsername99,
      comment: dmStyle.messageComment99,
    }
  if (suffix === 'interact')
    return {
      container: dmStyle.messageContainerInteract,
      username: dmStyle.messageUsername0,
      comment: dmStyle.messageCommentInteract,
    }
  return { container: dmStyle.messageContainer0, username: dmStyle.messageUsername0, comment: dmStyle.messageComment0 }
}

function getContainerStyle(msg: Message) {
  return styleBySuffix(msg.styleSuffix).container
}
function getNameStyle(msg: Message) {
  return styleBySuffix(msg.styleSuffix).username
}
function getCommentStyle(msg: Message) {
  return styleBySuffix(msg.styleSuffix).comment
}

function getTextShadow(msg: Message, type: string) {
  const style = type === 'name' ? getNameStyle(msg) : getCommentStyle(msg)
  const w = style['--textStrokeWidth']
  const c = style['--textStrokeColor']
  if (!parseFloat(w) || !c) return { textShadow: '' }
  return {
    textShadow: `${w} 0px ${w} ${c}, 0px ${w} ${w} ${c}, -${w} 0px ${w} ${c}, 0px -${w} ${w} ${c}`,
  }
}

function getInteractContentStyle() {
  return dmStyle.messageCommentInteract
}
function getInteractTextShadow() {
  return getTextShadow({ styleSuffix: 'interact' } as Message, 'comment')
}
function hoverHeadline(id: number) {
  for (const headline of headlines.value) {
    if (headline.id === id) {
      headline.isHover = true
    } else {
      headline.isHover = false
    }
  }
}
function unhoverHeadline() {
  for (const headline of headlines.value) {
    headline.isHover = false
  }
}

function giftScroll(e: WheelEvent) {
  document.getElementById('gift-headline-wrapper')!.scrollLeft += e.deltaY
}
function getAnchorIcon(msg: Message): string | undefined {
  for (const role of msg.roles || []) {
    if (ANCHOR_ICON_MAP[role]) return ANCHOR_ICON_MAP[role]
  }
}
function getIsAdmin(msg: Message) {
  return msg.roles?.some(role => role >= 99)
}
function playAudio(url: string) {
  new Audio(url).play()
}

function getRandomColor() {
  const idx = Math.floor(Math.random() * COLORS.length)
  return COLORS[idx]
}

document.getElementsByTagName('body')[0].setAttribute('style', 'background-color:rgba(0,0,0,0);')
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
