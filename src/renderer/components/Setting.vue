<template>
  <Row>
    <i-col span="8">
      <Collapse simple :value="collapse">
        <Panel name="1">
          设置
          <div slot="content">
            <div>
              <span class="setting-key-text">窗口背景色</span>
              <ColorPicker :value="background" @on-active-change="updateBackground" size="small" alpha />
            </div>
            <div>
              <span class="setting-key-text">透明度</span>
              <div class="avatar-controller-slider">
                <Slider :value="opacity" @on-change="changeOpacity"></Slider>
              </div>
            </div>
            <div>
              <span class="setting-key-text">头像大小</span>
              <div class="avatar-controller-slider">
                <Slider :value="avatarSize" @on-change="changeAvatarSize"></Slider>
              </div>
            </div>
            <div class="setting-key">
              <span class="setting-key-text">
                重复弹幕合并
                <Tooltip placement="top">
                  <Icon type="md-alert" class="info-icon" />
                  <div slot="content">
                    <div class="description-text">
                      <p>多少毫秒内重复的弹幕将被合并</p>
                    </div>
                  </div>
                </Tooltip>
              </span>
              <InputNumber :value="combineSimilarTime" @on-change="changeCombineSimilarTime" :min="0" size="small" />
              {{ " ms" }}
            </div>
            <div class="setting-key">
              <span class="setting-key-text">礼物栏展示大于</span>
              <InputNumber :value="showHeadlineThreshold" @on-change="changeShowHeadlineThreshold" :min="0" size="small" />
              {{ " 元" }}
            </div>
            <div class="setting-key">
              <span class="setting-key-text">弹幕礼物展示大于</span>
              <InputNumber :value="showGiftCardThreshold" @on-change="changeShowGiftCardThreshold" :min="0" size="small" />
              {{ " 元" }}
            </div>
            <div class="setting-key">
              <span class="setting-key-text">字体</span>
              <Select :style="{ width: '100px', display: 'inline-block' }" :value="danmakuFont" @on-change="changeDanmakuFont" @on-open-change="onOpenFontSelectChange" size="small">
                <OptionGroup label="全局值">
                  <Option v-for="item in fonts.filter(
                      (font) => font.type === 'default'
                    )" :value="item.value" :key="item.key">{{ item.value }}</Option>
                </OptionGroup>
                <OptionGroup label="通用字体族">
                  <Option v-for="item in fonts.filter(
                      (font) => font.type === 'common'
                    )" :value="item.value" :key="item.key">{{ item.value }}</Option>
                </OptionGroup>
                <OptionGroup label="系统">
                  <Option v-for="item in fonts.filter(
                      (font) => font.type === 'custom'
                    )" :value="item.value" :key="item.key">{{ item.value }}</Option>
                </OptionGroup>
              </Select>
            </div>
            <div>
              <Checkbox :value="isShowInteractInfo" @on-change="showInteractInfo">显示交互消息</Checkbox>
            </div>
            <div>
              <Checkbox :value="isShowSilverGift" @on-change="showSilverGift">展示银瓜子礼物</Checkbox>
            </div>
            <div>
              <Checkbox :value="isShowMemberShipIcon" @on-change="showMemberShipIcon">显示舰队图标</Checkbox>
            </div>
            <div>
              <Checkbox :value="isShowFanMedal" @on-change="showFanMedal">显示粉丝牌</Checkbox>
            </div>
            <div>
              <Checkbox :value="isUseMiniGiftCard" @on-change="useMiniGiftCard">使用礼物小卡片</Checkbox>
            </div>
          </div>
        </Panel>
        <Panel name="2">
          普通
          <div slot="content">
            <template v-for="item in editors.filter((editor) => editor.role === 0)">
              <div :key="item.id" class="setting-key">
                <SettingEditor v-bind="item" />
              </div>
            </template>
          </div>
        </Panel>
        <Panel name="3">
          舰长
          <div slot="content">
            <template v-for="item in editors.filter((editor) => editor.role === 3)">
              <div :key="item.id" class="setting-key">
                <SettingEditor v-bind="item" />
              </div>
            </template>
          </div>
        </Panel>
        <Panel name="4">
          高级
          <div slot="content">
            <!-- <div class="setting-key">
              <Button @click="refreshInfo">刷新直播间信息</Button>
            </div> -->
            <!-- <div class="setting-key">
              <Button @click="setGiftConfig">刷新礼物信息</Button>
            </div> -->
            <div class="setting-key">
              <Poptip confirm title="确认还原默认设置？" placement="right" width="300" @on-ok="clearAllSetting">
                <Button>还原默认设置</Button>
              </Poptip>
            </div>
            <div class="setting-key">
              <Poptip confirm :title="`确认备份并清理数据库？建议仅在启动明显变慢时操作。备份文件夹: ${USER_DATA_PATH}`" placement="right" width="400" word-wrap @on-ok="backupAndClearDB">
                <Button>备份并清理数据库</Button>
              </Poptip>
            </div>
            <div class="setting-key">
              <Poptip confirm title="确认清理用户缓存？用于刷新用户头像，不建议经常清理" placement="right" width="400" @on-ok="clearUserDB">
                <Button>清理用户缓存</Button>
              </Poptip>
            </div>
            <div class="setting-key">
              <Input :value="userCookie" @on-change="changeCookie" type="password" placeholder="Cookie..." clearable style="width: 150px" />
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
            <div class="setting-key">
              <Checkbox :value="isShowSilverGift" @on-change="showSilverGift">自动录制</Checkbox>
              <Tooltip placement="top">
                <Icon type="md-help" :style="{ 'font-size': '20px', 'vertical-align': 'middle' }" />
                <div slot="content" :style="{ 'white-space': 'normal' }">
                  <div>
                    <p>当连接直播间时，如果开播会自动开始录制</p>
                  </div>
                </div>
              </Tooltip>
            </div>
          </div>
        </Panel>
      </Collapse>
    </i-col>
    <i-col span="16">
      <div class="setting-right">
        <div class="setting-right-header">
          <Button @click="sendTestMessage">发送测试弹幕</Button>
          <Button @click="clearExampleDanmaku">恢复默认测试弹幕</Button>
          <Button @click="clearDanmaku">清空弹幕池</Button>
        </div>
        <!-- <div class="setting-right-content" :style="{ background: background }"> -->
        <iframe class="setting-right-content" id="preview-container" src="http://localhost:8081?example=true&port=8081" />
        <!-- </div> -->
      </div>
    </i-col>
  </Row>
</template>

<script>
import { remote } from "electron";
const window = remote.getCurrentWindow();
import Store from "electron-store";
import FontList from "font-list";
import SettingEditor from "./SettingEditor";
import {
  USER_DATA_PATH,
  DEFAULT_FONTS,
  DEFAULT_COMMON_FONT_FAMILIES,
  DEFAULT_SERVER_CONFIG
} from "../../service/const";
import { getRandomItem } from "../../service/util";
import { clearDB, backupDB, updateSetting, clearMessage, replaceSetting, sendExampleMessages, clearExampleMessage } from '../../service/api'
const defaultFonts = [
  ...DEFAULT_FONTS.map((font) => ({
    key: font,
    value: font,
    type: "default",
  })),
  ...DEFAULT_COMMON_FONT_FAMILIES.map((font) => ({
    key: font,
    value: font,
    type: "common",
  })),
];

export default {
  components: {
    SettingEditor,
  },
  data() {
    return {
      collapse: ["1", "2", "3", "4"],
      USER_DATA_PATH: USER_DATA_PATH,
      fonts: defaultFonts,

      editors: [
        // ***** normal *****
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称大小",
          role: 0,
          prop: "name",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称前景色",
          role: 0,
          prop: "name",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称描边大小",
          role: 0,
          prop: "name",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称描边颜色",
          role: 0,
          prop: "name",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论大小",
          role: 0,
          prop: "comment",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论前景色",
          role: 0,
          prop: "comment",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论描边大小",
          role: 0,
          prop: "comment",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论描边颜色",
          role: 0,
          prop: "comment",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "ColorPicker",
          name: "消息背景色",
          role: 0,
          prop: "message",
          styleName: "background",
        },
        // ***** captain *****
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称大小",
          role: 3,
          prop: "name",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称前景色",
          role: 3,
          prop: "name",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称描边大小",
          role: 3,
          prop: "name",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称描边颜色",
          role: 3,
          prop: "name",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论大小",
          role: 3,
          prop: "comment",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论前景色",
          role: 3,
          prop: "comment",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论描边大小",
          role: 3,
          prop: "comment",
          numberStep: 0.1,
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论描边颜色",
          role: 3,
          prop: "comment",
          styleName: "-webkit-text-stroke-color",
        },

        {
          id: Math.random(),
          type: "ColorPicker",
          name: "消息背景色",
          role: 3,
          prop: "message",
          styleName: "background",
        },
      ],
    };
  },
  mounted() {
    // this.initExamleMessages()

    if (defaultFonts.find((font) => font.key === this.danmakuFont)) return;
    this.fonts.push({
      key: this.danmakuFont,
      value: this.danmakuFont,
      type: "custom",
    });
  },
  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
    background() {
      return this.$store.state.Config.background;
    },
    danmakuFont() {
      return this.$store.state.Config.danmakuFont;
    },
    isShowAvatar() {
      return this.$store.state.Config.isShowAvatar;
    },
    isShowMemberShipIcon() {
      return this.$store.state.Config.isShowMemberShipIcon;
    },
    isShowInteractInfo() {
      return this.$store.state.Config.isShowInteractInfo;
    },
    isShowFanMedal() {
      return this.$store.state.Config.isShowFanMedal;
    },
    avatarSize() {
      return this.$store.state.Config.avatarSize;
    },
    combineSimilarTime() {
      return this.$store.state.Config.combineSimilarTime;
    },
    showHeadlineThreshold() {
      return this.$store.state.Config.showHeadlineThreshold;
    },
    showGiftCardThreshold() {
      return this.$store.state.Config.showGiftCardThreshold;
    },
    messages() {
      return this.$store.state.Message.exampleMessages;
    },
    isShowSilverGift() {
      return this.$store.state.Config.isShowSilverGift;
    },
    isUseMiniGiftCard() {
      return this.$store.state.Config.isUseMiniGiftCard;
    },
    opacity() {
      return this.$store.state.Config.opacity * 100;
    },
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
  },
  methods: {
    async showMemberShipIcon(status) {
      const data = { isShowMemberShipIcon: status, }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async showFanMedal(status) {
      const data = { isShowFanMedal: status }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async showInteractInfo(status) {
      const data = { isShowInteractInfo: status }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async sendTestMessage() {
      // this.$store.dispatch(
      //   "ADD_EXAMPLE_MESSAGE",
      //   this.randomMessageGenerator()
      // )

      const randomMessage = this.randomMessageGenerator()
      await sendExampleMessages({
        type: randomMessage.type,
        data: randomMessage
      })
    },

    // initExamleMessages() {
    //   EXAMPLE_MESSAGES.forEach(message => {
    //     sendExampleMessages({
    //       type: message.type,
    //       data: message
    //     })
    //   })
    // },

    async clearAllSetting() {
      await replaceSetting(DEFAULT_SERVER_CONFIG)

      const store = new Store({ name: "vuex" })
      store.clear()
      window.reload()
    },

    async updateBackground(color) {
      const data = {
        background: color,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async changeAvatarSize(size) {
      const data = {
        avatarSize: size,
      }
      if (size === 0) {
        data.isShowAvatar = false
      } else {
        data.isShowAvatar = true
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async changeOpacity(number) {
      const data = {
        opacity: Number((number / 100).toFixed(2)),
      }
      this.$store.dispatch("UPDATE_CONFIG", data)
      await updateSetting(data)
    },

    async changeCombineSimilarTime(number) {
      const data = {
        combineSimilarTime: number,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeShowHeadlineThreshold(number) {
      const data = {
        showHeadlineThreshold: number,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },
    async changeShowGiftCardThreshold(number) {
      const data = {
        showGiftCardThreshold: number,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async showSilverGift(status) {
      const data = {
        isShowSilverGift: status,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    randomMessageGenerator() {
      const randomNumber = Math.floor(Math.random() * 100000000);
      const randomRole = Math.floor(Math.random() * 4);
      const types = [
        {
          name: "gift",
          probability: 10,
        },
        {
          name: "comment",
          probability: 80,
        },
        {
          name: "superChat",
          probability: 10,
        },
      ];

      const randomType = getRandomItem(types).name

      if (randomType === "gift") {
        const gift = {
          _id: randomNumber,
          id: randomNumber,
          uid: randomNumber,
          name: `bli_${randomNumber}`,
          type: "gift",
          price: Math.floor(Math.random() * 100),
          giftNumber: 1,
          giftName: "随机礼物",
          guard: 3,
          role: 3,
          sendAt: Date.now(),
          batchComboId: randomNumber,
          // batchComboId: 1,
        };
        gift.role = randomRole;
        gift.guard = randomRole;
        if (Math.random() * 2 < 1) {
          gift.giftName = "舰长";
          gift.isGuardGift = true;
          gift.price = 198;
        }
        return gift;
      }
      if (randomType === "superChat") {
        const superChat = {
          _id: randomNumber,
          id: randomNumber,
          // id: 3333333,
          uid: randomNumber,
          superChatId: Math.floor(Math.random() * 100000000),
          // superChatId: 3333333,
          name: `bli_${randomNumber}`,
          type: "superChat",
          comment: `这是一条测试SuperChat | ${new Date().toLocaleString()}`,
          price: Math.floor(Math.random() * 100),
          role: 3,
          guard: 3,
          sendAt: Date.now(),
        };
        if (Math.random() * 2 < 1) {
          superChat.commentJPN = `これはテスト用のスパチャだよ〜 | ${new Date().toLocaleString()}`;
        }
        superChat.role = randomRole;
        superChat.guard = randomRole;
        return superChat;
      }

      if (randomType === "comment") {
        const comment = {
          _id: randomNumber,
          id: randomNumber,
          uid: randomNumber,
          name: `bli_${randomNumber}`,
          type: "comment",
          comment: `一条弹幕哟～`,
          role: 3,
          guard: 3,
          sendAt: Date.now(),
        };
        comment.role = randomRole;
        comment.guard = randomRole;
        return comment;
      }
    },

    async clearExampleDanmaku() {
      await clearExampleMessage()
      // this.$store.dispatch("RESTORE_EXAMPLE_MESSAGE");
    },

    async clearDanmaku() {
      await clearMessage()
      // this.$store.dispatch("CLEAR_MESSAGE");
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

    async getFonts() {
      const fonts = await FontList.getFonts({ disableQuoting: true });
      this.fonts = [
        ...defaultFonts,
        ...fonts.map((font) => ({ key: font, value: font, type: "custom" })),
      ];
    },

    async onOpenFontSelectChange(value) {
      if (value) {
        await this.getFonts();
      }
    },

    async changeDanmakuFont(value) {
      const data = {
        danmakuFont: value,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async useMiniGiftCard(value) {
      const data = {
        isUseMiniGiftCard: value,
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeCookie(e) {
      this.$store.dispatch("UPDATE_CONFIG", {
        userCookie: e.target.value,
      });
    },
  },
};
</script>

<style scoped>
.setting-key {
  padding-top: 5px;
}
.setting-key-text {
  display: inline-block;
  width: 120px;
}
.avatar-controller-slider {
  height: 30px;
  display: inline-block;
  vertical-align: bottom;
  width: 100px;
}

.setting-right-header {
  margin: 10px;
}

.setting-right-content {
  width: 95%;
  margin: 10px;
  height: 500px;

  border-radius: 12px;
  border: solid 1px gray;
  position: relative;
}
.setting-checkbox {
  vertical-align: top;
}
</style>
