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
              <span>显示入场消息</span>
              <i-switch :value="isShowEnterInfo" @on-change="showEnterInfo" />
            </div>
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
            <div>
              <span class="setting-key-text">重复弹幕合并</span>
              <Poptip trigger="hover" content="多少毫秒内重复的弹幕只显示最早的一条，且后面显示堆叠数字，设置为0表示不堆叠">
                <Icon type="ios-help-circle-outline" />
              </Poptip>
              <Input v-model="repeatMS" size="small" style="width: 150px" />
            </div>
            <!-- <div>
              <span class="setting-key-text">显示SC区域</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>-->
            <div>
              <span class="setting-key-text">显示头像</span>
              <i-switch :value="isShowAvatar" @on-change="showAvatar" />
            </div>
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
          <div @click="sendTestComment">发送测试弹幕</div>
          <div @click="clear">清空Storage</div>
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
      repeatMS: 3000,
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
    isShowEnterInfo() {
      return this.$store.state.Config.isShowEnterInfo;
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
    showEnterInfo(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isShowEnterInfo: status,
      });
    },
    async sendTestComment() {
      const lastest = this.$store.state.Message.exampleComments;
      await this.$store.dispatch("ADD_EXAMPLE_MESSAGE", {
        id: Math.floor(Math.random() * 100),
        uid: "12345",
        name: "其妙",
        comment: `草${new Date()}`,
        role: "captain",
      });
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
  },
};
</script>

<style scoped>
.setting-key-text {
  display: inline-block;
  width: 140px;
  text-align: right;
}
/* .setting-right {
  position: relative;
  height: 100%;
  width: 100%;
} */
.setting-right-header {
  height: 50px;
}
.setting-right-content {
  margin: 10px;
  padding: 5px;
  height: 360px;

  border-radius: 12px;
  border: solid 1px gray;
}
</style>
