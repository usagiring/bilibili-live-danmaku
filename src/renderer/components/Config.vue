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
            <p>弹幕数据留存过多可能会导致启动变慢。可以尝试清理并备份，备份数据自行选择留档或手动删除。数据文件夹: {{USER_DATA_PATH}}</p>
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
    <div class="config-item-container">
      <span>礼物自动回复</span>
      <Input class="config-item" :value="autoReplyText" @on-change="changeAutoReplyText" placeholder="回复内容..." />
      <Checkbox :value="textReply" @on-change="">文本</Checkbox>
      <Checkbox :value="speechReply" @on-change="">语音</Checkbox>
      <Checkbox :value="!onlyGold" @on-change="changeOnlyGold" :style="{ height: '30px','line-height': '30px'}">银瓜子</Checkbox>
      <Checkbox :value="onlyMyselfRoom" @on-change="changeOnlyMyselfRoom" :style="{ height: '30px','line-height': '30px'}">仅自己直播间</Checkbox>
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
    </div>

    <Modal v-model="advancedAutoReplyRuleModal" title="高级规则" width="650" scrollable lock-scroll transfer :styles="{ overflow: 'auto' }">
      <template v-for="(rule, index) in advancedAutoReplyRules">
        <div :key="index" :style="{'margin-bottom': '10px'}">
          <Select :style="{ width: '100px', display: 'inline-block' }" v-model="rule.giftId" filterable transfer>
            <Option v-for="gift in giftSelectors" :value="gift.key" :key="gift.key" :label="gift.label">
              <img :style="{ 'vertical-align': 'middle', width: '30px' }" :src="gift.webp" />
              <span>{{ gift.value }}</span>
              <span :style="{color: 'silver'}">{{ `id: ${gift.key}` }}</span>
            </Option>
          </Select>
          <!-- <span> >= </span> -->
          <InputNumber v-model="rule.giftNumber" :min="0" :style="{ width: '50px' }" />
          <Input v-model="rule.text" placeholder="回复内容..." :style="{display: 'inline-block', width: '300px'}" />
          <Checkbox :value="textReply" @on-change="">文本</Checkbox>
          <Checkbox :value="speechReply" @on-change="">语音</Checkbox>
          <Icon type="md-close" class="close-icon" @click="removeAutoReplyRule(index)" />
        </div>
      </template>
      <Button @click="addAutoReplyRule" type="primary" long>
        <Icon :style="{'font-weight': 'bold'}" type="md-add" />
      </Button>
      <div slot="footer">
        <Button type="primary" @click="submitAutoReplyRules">确定</Button>
        <Button type="error" @click="restoreDefaultAutoReplyRule">清空</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { remote } from "electron";
const window = remote.getCurrentWindow();
import {
  USER_DATA_PATH,
  DEFAULT_STYLE,
} from "../../service/const";

import { clearDB, backupDB, updateSetting, getGiftConfig } from '../../service/api'

export default {
  data() {
    return {
      USER_DATA_PATH: USER_DATA_PATH,
      advancedAutoReplyRuleModal: false,
      giftSelectors: [],
      selectedGiftIds: [],
      advancedAutoReplyRules: []
    };
  },
  async mounted() {
    const { data: giftConfig } = await getGiftConfig()
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
    }
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

    addAutoReplyRule() {
      const autoReplyRules = [...this.autoReplyRules]
      const initRule = {
        priority: Math.max(...autoReplyRules.map(r => r.priority)) + 1,
        giftNumber: 0,
        giftId: null,
        text: ''
      }
      this.advancedAutoReplyRules.push(initRule)
    },

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

    async changeAutoReply(status) {
      const data = {
        isAutoReply: status
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeOnlyMyselfRoom(status) {
      const data = {
        onlyMyselfRoom: status
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
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
</style>
