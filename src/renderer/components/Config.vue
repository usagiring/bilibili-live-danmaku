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
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>弹幕数据留存过多可能会导致启动变慢。可以尝试清理并备份，备份数据自行选择留档或手动删除。数据文件夹: {{userDataPath}}</p>
          </div>
        </div>
      </Tooltip>
    </div>
    <div class="config-item-container">
      <Poptip confirm title="确认清理用户头像缓存？" placement="right" width="400" @on-ok="clearUserDB">
        <Button class="config-item">清理用户头像缓存</Button>
      </Poptip>
      <Tooltip placement="top" max-width="300">
        <Icon type="md-help" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>为了防止触发B站限流，用户头像会缓存，可以清理并重新获取最新数据。</p>
          </div>
        </div>
      </Tooltip>
    </div>
    <div class="config-item-container">
      Cookie
      <Input class="config-item" :value="userCookie" @on-change="changeCookie" type="password" placeholder="Cookie..." clearable />
      <Tooltip placement="top">
        <Icon type="md-alert" :style="{ 'font-size': '20px', 'vertical-align': 'middle' }" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>输入Cookie可以使用发送弹幕/更换粉丝牌等功能。</p>
            <p :style="{ color: 'pink' }">
              Cookie即为你在Bilibili上的身份信息，请勿泄露你的身份凭证！
            </p>
          </div>
        </div>
      </Tooltip>
    </div>
    <div class="config-item-container">
      <Checkbox :value="isAutoRecord" @on-change="changeAutoRecord" :style="{ height: '30px','line-height': '30px'}">
        自动录制
      </Checkbox>
      <Tooltip placement="top">
        <Icon type="md-help" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>当连接直播间时，如果开播会自动开始录制</p>
          </div>
        </div>
      </Tooltip>
      <Tooltip placement="top" content="实验性功能，可能不稳定">
        <span :style="{'font-size': '12px', color: 'dodgerblue'}">
          <Icon type="ios-flask" />
        </span>
      </Tooltip>
    </div>
    <!-- <div class="config-item-container">
      <Checkbox :value="isWatchLottery" @on-change="changeWatchLottery" :style="{ height: '30px','line-height': '30px'}">自动记录天选时刻</Checkbox>
      <Tooltip placement="top">
        <Icon type="md-help" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>当直播间开启天选时刻，会开始统计相关信息</p>
          </div>
        </div>
      </Tooltip>
      <Tooltip placement="top" content="该功能仍在beta阶段，可能不稳定">
        <span :style="{'font-size': '12px', color: 'dodgerblue'}">
          <Icon type="ios-flask" />
        </span>
      </Tooltip>
    </div> -->
    <!-- <div class="config-item-container">
      <Checkbox :value="isAutoReply" @on-change="changeAutoReply">礼物自动回复</Checkbox>
      <span>礼物自动回复</span> 
      <Input class="config-item" :value="autoReplyText" @on-change="changeAutoReplyText" placeholder="回复内容..." />
      <Checkbox :value="isTextReply" @on-change="changeTextReply" :disabled="!userCookie">文字</Checkbox>
      <Checkbox :value="isSpeakReply" @on-change="changeSpeakReply">语音</Checkbox>
      <Checkbox :value="!onlyGold" @on-change="changeOnlyGold" :style="{ height: '30px','line-height': '30px'}">银瓜子</Checkbox>
      <Icon class="settings-icon" type="md-settings" @click="showAdvancedAutoReplyRule" />
      <Tooltip placement="top">
        <Icon type="md-help" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <p>支持占位符替换语法: {keywords}</p>
          <p>目前支持 user.name, gift.name</p>
          <p>例如: 感谢 {user.name} 赠送的 {gift.name}, 将替换为 感谢 xxx 赠送的 xx礼物 </p>
          <p :style="{color: 'pink'}">注意：同一用户一分钟内不会重复回复</p>
          <p :style="{color: 'pink'}">由于B站弹幕限制，不保证回复每次都成功发出</p>
        </div>
      </Tooltip>
      <Tooltip placement="top" content="实验性功能，可能不稳定">
        <span :style="{'font-size': '12px', color: 'dodgerblue'}">
          <Icon type="ios-flask" />
        </span>
      </Tooltip>
    </div> -->

    <div class="config-item-container">
      <Input v-model="text" placeholder="让系统说..." @on-keyup.enter="speak" :style="{display: 'inline-block', width: '300px'}" />
      <Button shape="circle" @click="speak" icon="md-play">
        <!-- <Icon type="md-play" /> -->
      </Button>
      声音
      <Select :style="{ width: '100px', display: 'inline-block' }" :value="currentVoice" @on-change="onChangeVoice">
        <Option v-for="voice in voices" :value="voice.key" :key="voice.key" :label="voice.label">
          <span>{{ voice.value }}</span>
        </Option>
      </Select>
      语速
      <InputNumber v-model="voiceSpeed" @on-change="onChangeVoiceSpeed" :min="0" :step="0.1" :style="{ width: '55px' }" />
    </div>

    <div class="config-item-container">
      <Tooltip placement="top" transfer>
        色彩表
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <p>控制图表可选色</p>
        </div>
      </Tooltip>
      <Select class="color-selector" :value="colors" multiple filterable allow-create @on-change="onChangeColor">
        <Option v-for="option in colorOptions" :value="option.value" :key="option.index" :label="option.label">
          <span :style="{ display: 'inline-block', background: option.value, width: '8px', height: '8px'}"></span>
          <span>{{ option.label }}</span>
        </Option>
      </Select>
    </div>

    <div class="config-item-container">
      <Tooltip placement="top" transfer>
        获取头像速率限制
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>限制获取头像频率, 单位毫秒。由于频繁调获取头像接口会触发速率限制, 建议 2000 以上为比较安全的值 </p>
            <p>生效需重新启动</p>
          </div>
        </div>
      </Tooltip>
      <InputNumber :value="userInfoFrequencyLimit" @on-change="onChangeUserInfoFrequencyLimit" :min="0" :step="100" :style="{ width: '100px' }" />
    </div>

    <div class="config-item-container">
      <Tooltip placement="top" transfer>
        弹幕窗置顶等级
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p> 从上到下优先级依次升高 </p>
            <p>
              <span :style="{color: 'pink'}">screen-saver</span>
              为最高置顶等级
            </p>
          </div>
        </div>
      </Tooltip>
      <Select class="on-top-level-selector" :value="onTopLevel" @on-change="onChangeOnTopLevel" :style="{ width: '200px' }">
        <Option v-for="(option, index) in opTopLevelOptions" :value="option" :key="index" :label="option">
          <span>{{ option }}</span>
        </Option>
      </Select>
      <Checkbox :value="isOnTopForce" @on-change="onChangeIsOnTopForce">
        <Tooltip placement="top" transfer>
          强制置顶
          <div slot="content" :style="{ 'white-space': 'normal' }">
            <div>
              <p>如遇到全屏场景下无法展示弹幕窗，可尝试勾选该项</p>
              <p>该选项将多次尝试置顶弹幕窗口。</p>
              <p> <span :style="{color: 'pink'}">仅在必要时使用</span> </p>
            </div>
          </div>
        </Tooltip>
      </Checkbox>
      <Tooltip placement="top" content="实验性功能，可能不稳定">
        <span :style="{'font-size': '12px', color: 'dodgerblue'}">
          <Icon type="ios-flask" />
        </span>
      </Tooltip>
    </div>

    <div class="config-item-container">
      <Input :value="signInMessage" @on-change="onChangeSignInMessage" placeholder="打卡" :style="{display: 'inline-block', width: '200px'}" />
      <Poptip confirm title="通过用户身份在有牌子的直播间发送一条弹幕每天可获得100亲密度，弹幕内容可自定义，确定？" placement="right" width="400" word-wrap @on-ok="signIn">
        <Button type="primary" :disabled="!userCookie">一键签到</Button>
      </Poptip>
      <Checkbox :value="onlyTodayZeroIntimacy" @on-change="changeOnlyTodayZeroIntimacy">
        仅今日0亲密度直播间
      </Checkbox>
      <span v-if="signInTotalCount" :style="{color: 'green'}">
        {{ signInCount }} / {{ signInTotalCount }}
      </span>
    </div>
  </div>
</template>

<script>
import { uniq } from 'lodash'
import { ipcRenderer } from 'electron'
import { getCurrentWindow } from '@electron/remote'
const window = getCurrentWindow();
import {
  DEFAULT_STYLE,
  COLORS,
  IPC_GET_USER_PATH
} from "../../service/const";

import { clearDB, backupDB, updateSetting, getVoices, speak as speakAPI } from '../../service/api'
import { getGiftConfig, wait } from '../../service/util'
import {
  sendMessage,
  getMedalList,
  getRoomInfoV2,
} from "../../service/bilibili-api";

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
    };
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
      });
    }

    this.advancedAutoReplyRules = this.autoReplyRules.slice(1)

    const { data: voices } = await getVoices()
    this.voices = voices.map(voice => {
      return {
        key: voice,
        value: voice,
        label: voice,
      }
    })

    this.userDataPath = await ipcRenderer.invoke(IPC_GET_USER_PATH)
  },
  computed: {
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
    isAutoRecord() {
      return this.$store.state.Config.isAutoRecord;
    },
    isWatchLottery() {
      return this.$store.state.Config.isWatchLottery;
    },
    autoReplyRules() {
      return this.$store.state.Config.autoReplyRules;
    },
    autoReplyText() {
      return this.$store.state.Config.autoReplyRules[0].text;
    },
    onlyGold() {
      return this.$store.state.Config.autoReplyRules[0].onlyGold;
    },
    onlyMyselfRoom() {
      return this.$store.state.Config.onlyMyselfRoom;
    },
    isAutoReply() {
      return this.$store.state.Config.isAutoReply;
    },
    isTextReply() {
      return this.$store.state.Config.autoReplyRules[0].isTextReply;
    },
    isSpeakReply() {
      return this.$store.state.Config.autoReplyRules[0].isSpeakReply;
    },
    colors() {
      return this.$store.state.Config.colors.length ? this.$store.state.Config.colors : COLORS;
    },
    colorOptions() {
      const color = uniq(COLORS, this.colors)
      return color.map((color, index) => {
        return {
          key: index,
          value: color,
          label: color
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
  methods: {
    async restoreDefaultStyleSetting() {
      await updateSetting(DEFAULT_STYLE)
      this.$store.dispatch("UPDATE_CONFIG", DEFAULT_STYLE);
      window.reload()
    },

    async backupAndClearDB() {
      // 从 ./data 里备份 comment gift interact, 并 removeall
      await backupDB({ names: ['comment', 'gift', 'interact', 'lottery'] })
      await clearDB({ names: ['comment', 'gift', 'interact', 'lottery'] })
      window.reload();
    },

    async clearUserDB() {
      // 清空用户数据缓存
      await clearDB({ names: ['user'] })
      window.reload();
    },

    async changeCookie(e) {
      const data = {
        userCookie: e.target.value,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeAutoRecord(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isAutoRecord: status,
      });
    },

    async changeWatchLottery(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isWatchLottery: status,
      });
    },

    async changeAutoReplyText(e) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.text = e.target.value
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data);
    },

    async changeOnlyGold(status) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.onlyGold = !status
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data);
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
      this.$store.dispatch("UPDATE_CONFIG", data)
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
        autoReplyRules: [this.autoReplyRules[0], ...this.advancedAutoReplyRules]
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
      this.$Message.success('保存成功！')
    },

    removeAutoReplyRule(index) {
      this.advancedAutoReplyRules.splice(index, 1)
    },

    async changeOnlyMyselfRoom(status) {
      const data = {
        onlyMyselfRoom: status
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeSpeakReply(status) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.isSpeakReply = status
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data);
    },

    async changeTextReply(status) {
      const [defaultRule, ...rest] = this.autoReplyRules
      const __copy = Object.assign({}, defaultRule)
      __copy.isTextReply = status
      const data = {
        autoReplyRules: [__copy, ...rest],
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data);
    },

    async onChangeVoice(voice) {
      // await updateSetting({
      //   voice: voice
      // })
      this.currentVoice = voice
      // this.$store.dispatch("UPDATE_CONFIG", data);
    },

    async onChangeVoiceSpeed(speed) {
      // await updateSetting({
      //   voiceSpeed: speed
      // })
      this.voiceSpeed = speed
    },

    async speak() {
      await speakAPI({
        text: this.text,
        voice: this.currentVoice,
        speed: this.voiceSpeed
      })
    },

    async onChangeColor(value) {
      if (!value.length) {
        this.$Message.warning('至少需要一个值')
      }
      const data = {
        colors: value
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async onChangeUserInfoFrequencyLimit(value) {
      const data = {
        userInfoFrequencyLimit: value
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    onChangeOnTopLevel(value) {
      const data = {
        onTopLevel: value
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    onChangeIsOnTopForce(value) {
      const data = {
        isOnTopForce: value
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    onChangeSignInMessage(e) {
      const data = {
        signInMessage: e.target.value
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    changeOnlyTodayZeroIntimacy(status) {
      const data = {
        onlyTodayZeroIntimacy: status
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async signIn() {
      const userCookie = this.userCookie
      if (!userCookie) return
      const signInMessage = this.signInMessage || '打卡'

      const pageSize = 10
      let total = 0
      let page = 1

      do {
        try {
          const { data } = await getMedalList({ page, pageSize }, userCookie)
          const { count, items } = data
          total = count
          this.signInTotalCount = total

          for (const medal of items) {
            const {
              roomid: roomId,
              medal_name: medalName,
              uname,
              level,
              today_feed: todayFeed,
            } = medal

            // 20级以上牌子不需要签到
            if (level > 20) {
              this.signInCount++
              continue
            }

            if (this.onlyTodayZeroIntimacy && Number(todayFeed)) {
              this.signInCount++
              continue
            }

            const { data } = await getRoomInfoV2(roomId);
            const {
              room_id: realRoomId,
            } = data.room_info;
            const result = await sendMessage(
              {
                message: signInMessage,
                roomId: realRoomId,
              },
              userCookie
            );
            if (result.data.message) {
              this.$Message.error({
                content: `签到未成功: ${result.data.message}, 用户名: ${uname}, 粉丝牌: ${medalName}`,
                duration: 10
              })

            } else {
              this.signInCount++
              this.$Message.success({
                content: `签到成功, 用户名: ${uname}, 粉丝牌: ${medalName}`,
                duration: 1
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
    }
  }
};
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
</style>
