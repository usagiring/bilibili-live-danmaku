<template>
  <div>
    <div class="config-item-container">
      <Poptip confirm title="确认还原弹幕样式？" placement="right" width="300" @on-ok="restoreDefaultStyleSetting">
        <Button class="config-item">还原默认弹幕样式</Button>
      </Poptip>
    </div>
    <div class="config-item-container">
      <Poptip confirm title="确认备份并清理数据库？" placement="right" width="400" word-wrap @on-ok="backupAndClearDB">
        <Button class="config-item">备份并清理数据库</Button>
      </Poptip>
      <Tooltip placement="top" max-width="300">
        <Icon type="md-help" />
        <template #content>
          <div :style="{ 'white-space': 'normal' }">
            <p>弹幕数据留存过多可能会导致启动变慢。可以尝试清理并备份，备份数据自行选择留档或手动删除。数据文件夹: {{ userDataPath }}</p>
          </div>
        </template>
      </Tooltip>
    </div>
    <div class="config-item-container">
      <Poptip confirm title="确认清理用户头像缓存？" placement="right" width="400" @on-ok="clearUserDB">
        <Button class="config-item">清理用户头像缓存</Button>
      </Poptip>
      <Tooltip placement="top" max-width="300">
        <Icon type="md-help" />
        <template #content>
          <div :style="{ 'white-space': 'normal' }">
            <p>为了防止触发B站限流，用户头像会缓存，可以清理并重新获取最新数据。</p>
          </div>
        </template>
      </Tooltip>
    </div>
    <div class="config-item-container">
      Cookie
      <Input class="config-item" :model-value="userCookie" type="password" placeholder="Cookie..." clearable @on-change="changeCookie" />
      <Tooltip placement="top">
        <Icon type="md-alert" :style="{ 'font-size': '20px', 'vertical-align': 'middle' }" />
        <template #content>
          <div :style="{ 'white-space': 'normal' }">
            <p>输入Cookie可以使用发送弹幕/更换粉丝牌等功能。</p>
            <p :style="{ color: 'pink' }">Cookie即为你在Bilibili上的身份信息，请勿泄露你的身份凭证！</p>
          </div>
        </template>
      </Tooltip>
    </div>
    <div class="config-item-container">
      <Checkbox :model-value="isAutoRecord" :style="{ height: '30px', 'line-height': '30px' }" @on-change="changeAutoRecord"> 自动录制 </Checkbox>
      <Tooltip transfer placement="top">
        <Icon type="md-help" />
        <template #content>
          <div :style="{ 'white-space': 'normal' }">
            <p>当连接直播间时，如果开播会自动开始录制</p>
          </div>
        </template>
      </Tooltip>
      <Tooltip placement="top" content="实验性功能，可能不稳定">
        <span :style="{ 'font-size': '12px', color: 'dodgerblue' }">
          <Icon type="ios-flask" />
        </span>
      </Tooltip>
    </div>

    <div class="config-item-container">
      <Input v-model="text" placeholder="让系统说..." :style="{ display: 'inline-block', width: '300px' }" />
      <Button class="space-left-5px" type="primary" shape="circle" icon="ios-play" @click="speak" />
      声音
      <Select v-model="currentVoice" size="small" :style="{ width: '100px', display: 'inline-block' }">
        <Option v-for="voice in displayVoices" :key="voice.key" :value="voice.key" :label="voice.label">
          <span>{{ voice.value }}</span>
        </Option>
      </Select>
      <span class="space-left-5px">语速</span>
      <InputNumber v-model="voiceSpeed" size="small" :min="0" :step="0.1" :style="{ width: '55px' }" />
    </div>

    <div class="config-item-container">
      <Tooltip placement="top" transfer>
        色彩表
        <template #content>
          <div :style="{ 'white-space': 'normal' }">
            <p>控制图表可选色</p>
          </div>
        </template>
      </Tooltip>
      <Select class="color-selector space-left-5px" :model-value="colors" multiple filterable allow-create @on-change="onChangeColor">
        <Option v-for="option in colorOptions" :key="option.index" :value="option.value" :label="option.label">
          <span :style="{ display: 'inline-block', background: option.value, width: '8px', height: '8px' }" />
          <span>{{ option.label }}</span>
        </Option>
      </Select>
    </div>

    <div class="config-item-container">
      <Tooltip placement="top" transfer>
        获取头像速率限制
        <template #content>
          <div :style="{ 'white-space': 'normal' }">
            <p>限制获取头像频率, 单位毫秒。由于频繁调获取头像接口会触发速率限制, 建议 2000 以上为比较安全的值</p>
            <p>生效需重新启动</p>
          </div>
        </template>
      </Tooltip>
      <InputNumber class="space-left-5px" :model-value="userInfoFrequencyLimit" :min="0" :step="100" :style="{ width: '100px' }" @on-change="onChangeUserInfoFrequencyLimit" />
    </div>

    <div class="config-item-container">
      <Tooltip placement="top" transfer>
        弹幕窗置顶等级
        <template #content>
          <div :style="{ 'white-space': 'normal' }">
            <p>从上到下优先级依次升高</p>
            <p>
              <span :style="{ color: 'pink' }">screen-saver</span>
              为最高置顶等级
            </p>
          </div>
        </template>
      </Tooltip>
      <Select class="on-top-level-selector space-left-5px" :model-value="onTopLevel" :style="{ width: '200px' }" @on-change="onChangeOnTopLevel">
        <Option v-for="(option, index) in opTopLevelOptions" :key="index" :value="option" :label="option">
          <span>{{ option }}</span>
        </Option>
      </Select>
      <Checkbox class="space-left-5px" :model-value="isOnTopForce" @on-change="onChangeIsOnTopForce">
        <Tooltip placement="top" transfer>
          强制置顶
          <template #content>
            <div :style="{ 'white-space': 'normal' }">
              <p>如遇到全屏场景下无法展示弹幕窗，可尝试勾选该项</p>
              <p>该选项将多次尝试置顶弹幕窗口。</p>
              <p><span :style="{ color: 'pink' }">仅在必要时使用</span></p>
            </div>
          </template>
        </Tooltip>
      </Checkbox>
      <Tooltip placement="top" content="实验性功能，可能不稳定">
        <span :style="{ 'font-size': '12px', color: 'dodgerblue' }">
          <Icon type="ios-flask" />
        </span>
      </Tooltip>
    </div>

    <div class="config-item-container">
      <Input :model-value="signInMessage" placeholder="打卡" :style="{ display: 'inline-block', width: '200px' }" @on-change="onChangeSignInMessage" />
      <Poptip confirm title="通过用户身份在有牌子的直播间发送一条弹幕每天可获得100亲密度，弹幕内容可自定义，确定？" placement="right" width="400" word-wrap @on-ok="signIn">
        <Button class="space-left-5px" type="primary" :disabled="!userCookie">一键签到</Button>
      </Poptip>
      <Checkbox v-model="isLightMedal" class="space-left-5px"> 点亮20级以上牌子 </Checkbox>
      <span v-if="signInTotalCount" :style="{ color: 'green' }"> {{ signInCount }} / {{ signInTotalCount }} </span>
    </div>
  </div>
</template>

<script>
import { uniq } from 'lodash'
import { ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
const browserWindow = getCurrentWindow()
import { DEFAULT_STYLE, COLORS, IPC_GET_USER_PATH } from '../../service/const'

import { clearDB, backupDB, updateSetting } from '../../service/api'
import { getGiftConfig, wait } from '../../service/util'
import { sendMessage, getMedalList, getRoomInfoV2 } from '../../service/bilibili-api'
const synth = window.speechSynthesis

export default {
  data() {
    return {
      userDataPath: '',
      advancedAutoReplyRuleModal: false,
      giftSelectors: [],
      selectedGiftIds: [],
      advancedAutoReplyRules: [],
      voices: [],
      currentVoice: '',
      text: '',
      voiceSpeed: 1.0,
      opTopLevelOptions: ['normal', 'floating', 'torn-off-menu', 'modal-panel', ' main-menu', 'status', 'pop-up-menu', 'screen-saver'],
      signInCount: 0,
      signInTotalCount: 0,
      isLightMedal: true,
      displayVoices: [],
    }
  },
  computed: {
    userCookie() {
      return this.$store.state.Config.userCookie
    },
    isAutoRecord() {
      return this.$store.state.Config.isAutoRecord
    },
    isWatchLottery() {
      return this.$store.state.Config.isWatchLottery
    },
    autoReplyRules() {
      return this.$store.state.Config.autoReplyRules
    },
    autoReplyText() {
      return this.$store.state.Config.autoReplyRules[0].text
    },
    onlyGold() {
      return this.$store.state.Config.autoReplyRules[0].onlyGold
    },
    onlyMyselfRoom() {
      return this.$store.state.Config.onlyMyselfRoom
    },
    isAutoReply() {
      return this.$store.state.Config.isAutoReply
    },
    isTextReply() {
      return this.$store.state.Config.autoReplyRules[0].isTextReply
    },
    isSpeakReply() {
      return this.$store.state.Config.autoReplyRules[0].isSpeakReply
    },
    colors() {
      return this.$store.state.Config.colors.length ? this.$store.state.Config.colors : COLORS
    },
    colorOptions() {
      const color = uniq(COLORS, this.colors)
      return color.map((color, index) => {
        return {
          key: index,
          value: color,
          label: color,
        }
      })
    },
    userInfoFrequencyLimit() {
      return this.$store.state.Config.userInfoFrequencyLimit
    },
    onTopLevel() {
      return this.$store.state.Config.onTopLevel
    },
    isOnTopForce() {
      return this.$store.state.Config.isOnTopForce
    },
    signInMessage() {
      return this.$store.state.Config.signInMessage
    },
    onlyTodayZeroIntimacy() {
      return this.$store.state.Config.onlyTodayZeroIntimacy
    },
  },
  async mounted() {
    const giftConfig = await getGiftConfig()
    for (const key in giftConfig) {
      const { name, webp } = giftConfig[key]
      this.giftSelectors.push({
        key: key,
        value: name,
        label: name,
        webp: webp,
      })
    }

    this.advancedAutoReplyRules = this.autoReplyRules.slice(1)

    setTimeout(() => {
      this.voices = this.$global?.voices || []

      this.displayVoices = this.voices.map((voice) => {
        return {
          key: voice.name,
          value: voice.name,
          label: voice.name,
        }
      })
    }, 500)

    this.userDataPath = await ipcRenderer.invoke(IPC_GET_USER_PATH)
  },
  methods: {
    async restoreDefaultStyleSetting() {
      await updateSetting(DEFAULT_STYLE)
      this.$store.dispatch('UPDATE_CONFIG', DEFAULT_STYLE)
      browserWindow.reload()
    },

    async backupAndClearDB() {
      // 从 ./data 里备份 comment gift interact, 并 removeall
      await backupDB({ names: ['comment', 'gift', 'interact', 'lottery'] })
      await clearDB({ names: ['comment', 'gift', 'interact', 'lottery'] })
      browserWindow.reload()
    },

    async clearUserDB() {
      // 清空用户数据缓存
      await clearDB({ names: ['user'] })
      browserWindow.reload()
    },

    async changeCookie(e) {
      const data = {
        userCookie: e.target.value,
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async changeAutoRecord(status) {
      this.$store.dispatch('UPDATE_CONFIG', {
        isAutoRecord: status,
      })
    },

    async changeWatchLottery(status) {
      this.$store.dispatch('UPDATE_CONFIG', {
        isWatchLottery: status,
      })
    },

    async changeAutoReplyText(e) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.text = e.target.value
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async changeOnlyGold(status) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.onlyGold = !status
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    showAdvancedAutoReplyRule() {
      this.advancedAutoReplyRuleModal = true
    },

    // 清空高级规则，保留第一条默认规则
    async restoreDefaultAutoReplyRule() {
      this.advancedAutoReplyRules = []
      const data = {
        autoReplyRules: [this.autoReplyRules[0]],
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
      this.$Message.success('清空成功！')
    },

    // addAutoReplyRule() {
    //   const autoReplyRules = [...this.autoReplyRules]
    //   const initRule = {
    //     priority: Math.max(...autoReplyRules.map(r => r.priority)) + 1,
    //     giftNumber: 0,
    //     giftId: null,
    //     text: '',
    //     isTextReply: false,
    //     isSpeakReply: false,
    //   }
    //   this.advancedAutoReplyRules.push(initRule)
    // },

    async submitAutoReplyRules() {
      const data = {
        autoReplyRules: [this.autoReplyRules[0], ...this.advancedAutoReplyRules],
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
      this.$Message.success('保存成功！')
    },

    removeAutoReplyRule(index) {
      this.advancedAutoReplyRules.splice(index, 1)
    },

    async changeOnlyMyselfRoom(status) {
      const data = {
        onlyMyselfRoom: status,
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async changeSpeakReply(status) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.isSpeakReply = status
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async changeTextReply(status) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.isTextReply = status
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    speak() {
      const voice = this.voices.find((voice) => voice.name === this.currentVoice)
      const utterThis = new SpeechSynthesisUtterance()
      utterThis.text = this.text
      utterThis.voice = voice
      utterThis.rate = this.voiceSpeed
      synth.speak(utterThis)
    },

    async onChangeColor(value) {
      if (!value.length) {
        this.$Message.warning('至少需要一个值')
      }
      const data = {
        colors: value,
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async onChangeUserInfoFrequencyLimit(value) {
      const data = {
        userInfoFrequencyLimit: value,
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    onChangeOnTopLevel(value) {
      const data = {
        onTopLevel: value,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    onChangeIsOnTopForce(value) {
      const data = {
        isOnTopForce: value,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    onChangeSignInMessage(e) {
      const data = {
        signInMessage: e.target.value,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    changeOnlyTodayZeroIntimacy(status) {
      const data = {
        onlyTodayZeroIntimacy: status,
      }
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async signIn() {
      const userCookie = this.userCookie
      if (!userCookie) return
      const signInMessage = this.signInMessage || '打卡'

      const pageSize = 10
      let total = 0
      let page = 1
      this.signInCount = 0

      do {
        try {
          const { data } = await getMedalList({ page, pageSize }, userCookie)
          const { count, items } = data
          total = count
          this.signInTotalCount = total

          for (const medal of items) {
            const { roomid: roomId, medal_name: medalName, uname, level, today_feed: todayFeed, is_lighted: isLighted } = medal
            // 今天有亲密度不需要签到
            if (Number(todayFeed)) {
              this.signInCount++
              continue
            }

            // 20级以上牌子不需要签到
            if (level > 20 && (isLighted || !this.isLightMedal)) {
              this.signInCount++
              continue
            }

            const { data } = await getRoomInfoV2(roomId)
            const { room_id: realRoomId } = data.room_info
            const result = await sendMessage(
              {
                message: signInMessage,
                roomId: realRoomId,
              },
              userCookie
            )
            if (result.data.message) {
              this.$Message.error({
                content: `签到未成功: ${result.data.message}, 用户名: ${uname}, 粉丝牌: ${medalName}, ${this.signInCount}/${this.signInTotalCount}`,
                duration: 10,
              })
            } else {
              this.signInCount++
              this.$Message.success({
                content: `签到成功, 用户名: ${uname}, 粉丝牌: ${medalName}, ${this.signInCount}/${this.signInTotalCount}`,
                duration: 1,
              })
            }
            await wait(1000)
          }
        } catch (e) {
          this.$Message.error(`${e.message}`)
          console.log(e)
        }

        page++
      } while (page <= Math.ceil(total / pageSize))

      this.$Message.success('签到完成！')
    },
  },
}
</script>

<style scoped>
.config-item-container {
  padding: 10px 5px 0px 10px;
}
.config-item {
  width: 150px;
}
.close-icon {
  color: crimson;
  font-size: 16px;
  cursor: pointer;
  margin-left: 5px;
}

.settings-icon {
  font-size: 16px;
  cursor: pointer;
}

.settings-icon:hover {
  color: deepskyblue;
}

.color-selector {
  width: 700px;
}
.space-left-5px {
  margin-left: 5px;
}
</style>
