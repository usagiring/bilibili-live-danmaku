<template>
  <Row>
    <i-col span="8">
      <Collapse simple :value="collapse">
        <Panel name="1">
          main
          <div slot="content">
            <div class="setting-key-text">
              <span>背景色</span>
              <ColorPicker
                :value="background"
                @on-active-change="updateBackground"
                size="small"
                alpha
              />
            </div>
            <div class="setting-key-text">
              <Checkbox
                class="setting-checkbox"
                :value="isShowInteractInfo"
                @on-change="showInteractInfo"
              >显示交互消息</Checkbox>
            </div>
            <div class="setting-key-text">
              <span class="avatar-controller">头像大小</span>
              <Slider
                class="avatar-controller-slider"
                :value="avatarSize"
                @on-change="changeAvatarSize"
              ></Slider>
            </div>
            <div>
              <span>重复弹幕合并</span>
              <!-- <Poptip trigger="hover" content="多少毫秒内重复的弹幕只显示最早的一条，且后面显示堆叠数字，设置为0表示不堆叠">
                <Icon type="ios-help-circle-outline" />
              </Poptip>-->
              <InputNumber
                :value="combineSimilarTime"
                @on-change="changeCombineSimilarTime"
                :min="0"
                size="small"
                style="width: 100px"
              />
            </div>
            <div>
              <span>礼物栏展示大于</span>
              <InputNumber
                :value="showGiftThreshold"
                @on-change="changeShowGiftThreshold"
                :min="0"
                size="small"
                style="width: 100px"
              />
            </div>
            <div>
              <span>弹幕礼物展示大于</span>
              <InputNumber
                :value="showGiftCardThreshold"
                @on-change="changeShowGiftCardThreshold"
                :min="0"
                size="small"
                style="width: 100px"
              />
            </div>
            <Checkbox
              class="setting-checkbox"
              :value="showSilverGift"
              @on-change="changeShowSilverGift"
            >展示银瓜子礼物</Checkbox>
          </div>
        </Panel>
        <Panel name="2">
          普通
          <div slot="content">
            <template v-for="item in editors.filter(editor=> editor.role === 'normal')">
              <SettingEditor :key="item.id" v-bind="item" />
            </template>
          </div>
        </Panel>
        <Panel name="3">
          舰长
          <div slot="content">
            <template v-for="item in editors.filter(editor=> editor.role === 'captain')">
              <SettingEditor :key="item.id" v-bind="item" />
            </template>
          </div>
        </Panel>
        <Panel name="4">
          其他
          <div slot="content">
            <!-- <div>
              <span class="setting-key-text">显示SC区域</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>-->

            <div>
              <span class="setting-key-text">显示舰队图标</span>
              <i-switch :value="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <!-- <div>
              <span class="setting-key-text">显示合并弹幕数量</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <div>
              <span class="setting-key-text">显示原弹幕颜色</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>-->
          </div>
        </Panel>
      </Collapse>
    </i-col>
    <i-col span="16">
      <div class="setting-right">
        <div class="setting-right-header">
          <Button @click="sendTestMessage">发送测试弹幕</Button>
          <Button @click="clearExampleDanmaku">还原默认弹幕</Button>
          <Button @click="clear">还原默认</Button>
        </div>
        <div class="setting-right-content" :style="{ background: background }">
          <Danmaku :isPreview="true" />
        </div>
      </div>
    </i-col>
  </Row>
</template>

<script>
import { remote } from "electron";
const { BrowserWindow, screen } = remote;
import SettingEditor from "./SettingEditor";
import Danmaku from "./Danmaku";
import emitter, { init, close } from "../../service/bilibili-live-ws";
import Store from "electron-store";
import { DEFAULT_AVATAR } from "../../service/const";

export default {
  components: {
    SettingEditor,
    Danmaku,
  },
  data() {
    return {
      editors: [
        // ***** normal *****
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称大小",
          role: "normal",
          prop: "name",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称描边大小",
          role: "normal",
          prop: "name",
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称描边颜色",
          role: "normal",
          prop: "name",
          styleName: "-webkit-text-stroke-color",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称前景色",
          role: "normal",
          prop: "name",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论大小",
          role: "normal",
          prop: "comment",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论描边大小",
          role: "normal",
          prop: "comment",
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论描边颜色",
          role: "normal",
          prop: "comment",
          styleName: "-webkit-text-stroke-color",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论前景色",
          role: "normal",
          prop: "comment",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "消息背景色",
          role: "normal",
          prop: "message",
          styleName: "background",
        },
        // ***** captain *****
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称大小",
          role: "captain",
          prop: "name",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "名称描边大小",
          role: "captain",
          prop: "name",
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称描边颜色",
          role: "captain",
          prop: "name",
          styleName: "-webkit-text-stroke-color",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "名称前景色",
          role: "captain",
          prop: "name",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论大小",
          role: "captain",
          prop: "comment",
          styleName: "font-size",
        },
        {
          id: Math.random(),
          type: "InputNumber",
          name: "评论描边大小",
          role: "captain",
          prop: "comment",
          styleName: "-webkit-text-stroke-width",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论描边颜色",
          role: "captain",
          prop: "comment",
          styleName: "-webkit-text-stroke-color",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "评论前景色",
          role: "captain",
          prop: "comment",
          styleName: "color",
        },
        {
          id: Math.random(),
          type: "ColorPicker",
          name: "消息背景色",
          role: "captain",
          prop: "message",
          styleName: "background",
        },
      ],
      roomId: null,
      isConnected: false,
      collapse: ["1", "2", "3"],
    };
  },
  computed: {
    background() {
      return this.$store.state.Config["container_style"]["background"];
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
    avatarSize() {
      return this.$store.state.Config.avatarSize;
    },
    combineSimilarTime() {
      return this.$store.state.Config.combineSimilarTime;
    },
    showGiftThreshold() {
      return this.$store.state.Config.showGiftThreshold;
    },
    showGiftCardThreshold() {
      return this.$store.state.Config.showGiftCardThreshold;
    },
    messages() {
      return this.$store.state.Message.exampleMessages;
    },
    showSilverGift() {
      return this.$store.state.Config.showSilverGift;
    },
  },
  methods: {
    async connect(status) {
      if (status && this.roomId) {
        await init({ roomId: Number(this.roomId) });
        this.isConnected = status;
      } else {
        close();
      }
    },
    async showMemberShipIcon(status) {
      await this.$store.dispatch("UPDATE_CONFIG", {
        isShowMemberShipIcon: status,
      });
    },
    async showAvatar(status) {
      await this.$store.dispatch("UPDATE_CONFIG", {
        isShowAvatar: status,
      });
    },
    showInteractInfo(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isShowInteractInfo: status,
      });
    },
    sendTestMessage() {
      this.$store.dispatch(
        "ADD_EXAMPLE_MESSAGE",
        this.randomMessageGenerator()
      );
    },

    clear() {
      const store = new Store({ name: "vuex" });
      store.clear();
    },

    updateBackground(color) {
      this.$store.dispatch("UPDATE_CONTAINER_STYLE", {
        style: {
          background: color,
        },
      });
    },
    changeAvatarSize(size) {
      this.$store.dispatch("UPDATE_CONFIG", {
        avatarSize: size,
      });
      if (size === 0) {
        this.showAvatar(false);
      } else {
        this.showAvatar(true);
      }
    },

    changeCombineSimilarTime(number) {
      this.$store.dispatch("UPDATE_CONFIG", {
        combineSimilarTime: number,
      });
    },

    changeShowGiftThreshold(number) {
      this.$store.dispatch("UPDATE_CONFIG", {
        showGiftThreshold: number,
      });
    },
    changeShowGiftCardThreshold(number) {
      this.$store.dispatch("UPDATE_CONFIG", {
        showGiftCardThreshold: number,
      });
    },
    changeShowSilverGift(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        showSilverGift: status,
      });
    },

    randomMessageGenerator() {
      const randomNumber = Math.floor(Math.random() * 100000000);
      const roles = ["normal", "governor", "admiral", "captain"];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];
      const types = ["gift", "comment", "superChat"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      if (randomType === "gift") {
        const gift = {
          id: randomNumber,
          uid: randomNumber,
          name: `bli_${randomNumber}`,
          type: "gift",
          price: Math.floor(Math.random() * 100),
          giftNumber: 1,
          giftName: "随机礼物",
          avatar: DEFAULT_AVATAR,
          role: "captain",
          sendAt: new Date() - 0,
          batchComboId: randomNumber,
          // batchComboId: 1,
        };
        gift.role = randomRole;
        return gift;
      }
      if (randomType === "superChat") {
        const superChat = {
          id: randomNumber,
          uid: randomNumber,
          name: `bli_${randomNumber}`,
          type: "superChat",
          avatar: DEFAULT_AVATAR,
          comment: `这是一条测试SuperChat | ${new Date().toLocaleString()}`,
          price: Math.floor(Math.random() * 100),
          role: "captain",
          sendAt: new Date() - 0,
        };
        superChat.role = randomRole;
        return superChat;
      }

      if (randomType === "comment") {
        const comment = {
          id: randomNumber,
          uid: randomNumber,
          name: `bli_${randomNumber}`,
          type: "comment",
          avatar: DEFAULT_AVATAR,
          comment: `一条弹幕哟～`,
          role: "captain",
          sendAt: new Date() - 0,
        };
        comment.role = randomRole;
        return comment;
      }
    },

    clearExampleDanmaku() {
      this.$store.dispatch("RESTORE_EXAMPLE_MESSAGE");
      this.$store.dispatch("CLEAR_MESSAGE");
    },
  },
};
</script>

<style scoped>
.setting-key-text {
  display: inline-block;
  width: 100%;
}
.avatar-controller {
  height: 36px;
  line-height: 36px;
  display: inline-block;
  vertical-align: top;
}
.avatar-controller-slider {
  height: 36px;
  display: inline-block;
  width: 100px;
  padding-left: 10px;
}

.setting-right-content {
  margin: 10px;
  padding: 5px;
  height: 360px;

  border-radius: 12px;
  border: solid 1px gray;
  position: relative;
}
.setting-checkbox {
  vertical-align: top;
}
</style>
