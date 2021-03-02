<template>
  <Row>
    <i-col span="8">
      <Collapse simple :value="collapse">
        <Panel name="1">
          设置
          <div slot="content">
            <div>
              <span class="setting-key-text">窗口背景色</span>
              <ColorPicker
                :value="background"
                @on-active-change="updateBackground"
                size="small"
                alpha
              />
            </div>
            <div>
              <span class="setting-key-text">透明度</span>
              <div class="avatar-controller-slider">
                <Slider
                  :value="windowOpacity"
                  @on-change="changeOpacity"
                ></Slider>
              </div>
            </div>
            <div>
              <span class="setting-key-text">头像大小</span>
              <div class="avatar-controller-slider">
                <Slider
                  :value="avatarSize"
                  @on-change="changeAvatarSize"
                ></Slider>
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
              <InputNumber
                :value="combineSimilarTime"
                @on-change="changeCombineSimilarTime"
                :min="0"
                size="small"
              />
            </div>
            <div class="setting-key">
              <span class="setting-key-text">礼物栏展示大于</span>
              <InputNumber
                :value="showGiftThreshold"
                @on-change="changeShowGiftThreshold"
                :min="0"
                size="small"
              />
            </div>
            <div class="setting-key">
              <span class="setting-key-text">弹幕礼物展示大于</span>
              <InputNumber
                :value="showGiftCardThreshold"
                @on-change="changeShowGiftCardThreshold"
                :min="0"
                size="small"
              />
            </div>
            <div>
              <Checkbox
                :value="isShowInteractInfo"
                @on-change="showInteractInfo"
                >显示交互消息</Checkbox
              >
            </div>
            <div>
              <Checkbox :value="isShowSilverGift" @on-change="showSilverGift"
                >展示银瓜子礼物</Checkbox
              >
            </div>
            <div>
              <Checkbox
                :value="isShowMemberShipIcon"
                @on-change="showMemberShipIcon"
                >显示舰队图标</Checkbox
              >
            </div>
            <div>
              <Checkbox :value="isShowFanMedal" @on-change="showFanMedal"
                >显示粉丝牌</Checkbox
              >
            </div>
          </div>
        </Panel>
        <Panel name="2">
          普通
          <div slot="content">
            <template
              v-for="item in editors.filter((editor) => editor.role === 0)"
            >
              <div :key="item.id" class="setting-key">
                <SettingEditor v-bind="item" />
              </div>
            </template>
          </div>
        </Panel>
        <Panel name="3">
          舰长
          <div slot="content">
            <template
              v-for="item in editors.filter((editor) => editor.role === 3)"
            >
              <div :key="item.id" class="setting-key">
                <SettingEditor v-bind="item" />
              </div>
            </template>
          </div>
        </Panel>
        <Panel name="4">
          高级
          <div slot="content">
            <div class="setting-key">
              <Button @click="refreshInfo">刷新直播间信息</Button>
            </div>
            <div class="setting-key">
              <Poptip
                confirm
                title="确认还原默认设置？"
                placement="right"
                @on-ok="clearAllSetting"
              >
                <Button>还原默认设置</Button>
              </Poptip>
            </div>
            <div class="setting-key">
              <Poptip
                confirm
                :title="`确认备份并清理数据库？建议仅在启动明显变慢时操作。备份文件夹: ${USER_DATA_PATH}`"
                placement="right"
                @on-ok="backupAndClearDB"
              >
                <Button>备份并清理数据库</Button>
              </Poptip>
            </div>
            <div class="setting-key">
              <Poptip
                confirm
                title="确认清理用户缓存？用于刷新用户头像，不建议经常清理"
                placement="right"
                @on-ok="clearUserDB"
              >
                <Button>清理用户缓存</Button>
              </Poptip>
            </div>
          </div>
        </Panel>
      </Collapse>
    </i-col>
    <i-col span="16">
      <div class="setting-right">
        <div class="setting-right-header">
          <Button @click="sendTestMessage">发送测试弹幕</Button>
          <Button @click="clearExampleDanmaku">还原默认预览弹幕</Button>
          <Button @click="clearDanmaku">清空弹幕池</Button>
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
const window = remote.getCurrentWindow();
import Store from "electron-store";
import SettingEditor from "./SettingEditor";
import Danmaku from "./Danmaku";
import { DEFAULT_AVATAR, USER_DATA_PATH } from "../../service/const";
import { getGuardInfo } from "../../service/bilibili-api";
import {
  commentDB,
  interactDB,
  userDB,
  otherDB,
  giftDB,
  backup,
  deleteData,
} from "../../service/nedb";

export default {
  components: {
    SettingEditor,
    Danmaku,
  },
  data() {
    return {
      collapse: ["1", "2", "3", "4"],
      USER_DATA_PATH: USER_DATA_PATH,

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
          type: "ColorPicker",
          name: "名称前景色",
          role: 0,
          prop: "name",
          styleName: "color",
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
          name: "评论前景色",
          role: 0,
          prop: "comment",
          styleName: "color",
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
          type: "ColorPicker",
          name: "名称前景色",
          role: 3,
          prop: "name",
          styleName: "color",
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
          name: "评论前景色",
          role: 3,
          prop: "comment",
          styleName: "color",
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
  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
    ruid() {
      return this.$store.state.Config.ruid;
    },
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
    isShowFanMedal() {
      return this.$store.state.Config.isShowFanMedal;
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
    isShowSilverGift() {
      return this.$store.state.Config.isShowSilverGift;
    },
    windowOpacity() {
      return this.$store.state.Config.windowOpacity * 100;
    },
  },
  methods: {
    showMemberShipIcon(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isShowMemberShipIcon: status,
      });
    },
    showFanMedal(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isShowFanMedal: status,
      });
    },
    showAvatar(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
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

    clearAllSetting() {
      const store = new Store({ name: "vuex" });
      store.clear();
      window.reload();
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
    changeOpacity(number) {
      this.$store.dispatch("UPDATE_CONFIG", {
        windowOpacity: Number((number / 100).toFixed(2)),
      });
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

    showSilverGift(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isShowSilverGift: status,
      });
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
      // const randomType = types[Math.floor(Math.random() * types.length)];
      const totalProbability = 100;
      let randomNumber2 = Math.floor(Math.random() * totalProbability);
      let randomType = "";
      for (let i = 0; i < types.length; i++) {
        if (randomNumber2 - types[i].probability < 0) {
          randomType = types[i].name;
          break;
        }
        randomNumber2 = randomNumber2 - types[i].probability;
      }
      if (randomType === "gift") {
        const gift = {
          id: randomNumber,
          uid: randomNumber,
          name: `bli_${randomNumber}`,
          type: "gift",
          price: Math.floor(Math.random() * 10),
          giftNumber: 1,
          giftName: "随机礼物",
          avatar: DEFAULT_AVATAR,
          role: 3,
          sendAt: new Date() - 0,
          batchComboId: randomNumber,
          // batchComboId: 1,
        };
        gift.role = randomRole;
        if (Math.random() * 2 < 1) {
          gift.giftName = "舰长";
          gift.isGuardGift = true;
          gift.price = 198;
        }
        return gift;
      }
      if (randomType === "superChat") {
        const superChat = {
          id: randomNumber,
          // id: 3333333,
          uid: randomNumber,
          superChatId: Math.floor(Math.random() * 100000000),
          // superChatId: 3333333,
          name: `bli_${randomNumber}`,
          type: "superChat",
          avatar: DEFAULT_AVATAR,
          comment: `这是一条测试SuperChat | ${new Date().toLocaleString()}`,
          price: Math.floor(Math.random() * 10),
          role: 3,
          sendAt: new Date() - 0,
        };
        if (Math.random() * 2 < 1) {
          superChat.commentJPN = `これはテスト用のスパチャだよ〜 | ${new Date().toLocaleString()}`;
        }
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
          role: 3,
          sendAt: new Date() - 0,
        };
        comment.role = randomRole;
        return comment;
      }
    },

    clearExampleDanmaku() {
      this.$store.dispatch("RESTORE_EXAMPLE_MESSAGE");
    },

    clearDanmaku() {
      this.$store.dispatch("CLEAR_MESSAGE");
    },

    async refreshInfo() {
      // 暂时只刷新舰长数
      const guardInfo = await getGuardInfo(this.realRoomId, this.ruid);
      this.$store.dispatch("UPDATE_CONFIG", {
        guardNumber: guardInfo.data.info.num,
      });
    },

    async backupAndClearDB() {
      // 从 ./data 里备份 comment gift interact, 并 removeall, other 直接清空
      backup();
      deleteData();
      // await commentDB.remove({}, { multi: true });
      // await giftDB.remove({}, { multi: true });
      // await interactDB.remove({}, { multi: true });
      // await otherDB.remove({}, { multi: true });
      window.reload();
    },

    async clearUserDB() {
      // 清空用户数据缓存
      await userDB.remove({}, { multi: true });
      window.reload();
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
