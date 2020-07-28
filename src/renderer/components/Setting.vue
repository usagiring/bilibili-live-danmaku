<template>
  <Row>
    <i-col span="8">
      <Collapse simple :value="collapse">
        <Panel name="1">
          普通
          <div slot="content">
            <div>
              <span class="setting-key-text">名称大小</span>
              <InputNumber
                :value="normal_name_size"
                @on-change="change_normal_name_size"
                :min="0"
                :formatter="pxFormatter"
                :parser="pxParser"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">名称描边大小</span>
              <InputNumber
                :value="normal_name_board_size"
                @on-change="change_normal_name_board_size"
                :min="0"
                :formatter="pxFormatter"
                :parser="pxParser"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">名称描边颜色</span>
              <ColorPicker
                :value="normal_name_board_color"
                @on-change="change_normal_name_board_color"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">名称前景色</span>
              <ColorPicker
                :value="normal_name_color"
                @on-change="change_normal_name_color"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">评论大小</span>
              <InputNumber
                :value="normal_comment_size"
                @on-change="change_normal_comment_size"
                :min="0"
                :formatter="pxFormatter"
                :parser="pxParser"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">评论前景色</span>
              <ColorPicker
                :value="normal_comment_color"
                @on-change="change_normal_comment_color"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">消息背景色</span>
              <ColorPicker
                :value="normal_name_color"
                @on-change="change_normal_name_color"
                size="small"
              />
            </div>
          </div>
        </Panel>
        <Panel name="2">
          舰长
          <div slot="content">
            <div>
              <span class="setting-key-text">名称大小</span>
              <InputNumber
                :value="captain_name_size"
                @on-change="change_captain_name_size"
                :min="0"
                :formatter="pxFormatter"
                :parser="pxParser"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">名称描边大小</span>
              <InputNumber
                :value="captain_name_board_size"
                @on-change="change_captain_name_board_size"
                :min="0"
                :formatter="pxFormatter"
                :parser="pxParser"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">名称描边颜色</span>
              <ColorPicker
                :value="captain_name_board_color"
                @on-change="change_captain_name_board_color"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">名称前景色</span>
              <ColorPicker
                :value="captain_name_color"
                @on-change="change_captain_name_color"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">评论大小</span>
              <InputNumber
                :value="captain_comment_size"
                @on-change="change_captain_comment_size"
                :min="0"
                :formatter="pxFormatter"
                :parser="pxParser"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">评论前景色</span>
              <ColorPicker
                :value="captain_comment_color"
                @on-change="change_captain_comment_color"
                size="small"
              />
            </div>
            <div>
              <span class="setting-key-text">消息背景色</span>
              <ColorPicker
                :value="captain_name_color"
                @on-change="change_captain_name_color"
                size="small"
              />
            </div>
          </div>
        </Panel>
        <Panel name="3">
          其他
          <div slot="content">
            <div>
              <span class="setting-key-text">重复弹幕合并</span>
              <Poptip trigger="hover" content="多少毫秒内重复的弹幕只显示最早的一条，且后面显示堆叠数字，设置为0表示不堆叠">
                <Icon type="ios-help-circle-outline" />
              </Poptip>
              <Input v-model="repeatMS" size="small" style="width: 150px" />
            </div>
            <div>
              <span class="setting-key-text">是否显示SC区域</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <div>
              <span class="setting-key-text">是否显示头像</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <div>
              <span class="setting-key-text">是否显示舰队图标</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <div>
              <span class="setting-key-text">是否显示合并弹幕数量</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <div>
              <span class="setting-key-text">显示原弹幕颜色</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
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
        <div class="setting-right-content"></div>
      </div>
    </i-col>
  </Row>
</template>

<script>
import { remote } from "electron";
const { BrowserWindow, screen } = remote;
import DanmakuExample from "./DanmakuExample.vue";
import emitter, { init, close } from "../../service/bilibili-live-ws";
import Store from "electron-store";

// emitter.on("message", (data) => {
//   console.log(data);
// });

// TODO 配置读写文件
export default {
  components: {
    DanmakuExample,
  },
  data() {
    return {
      roomId: null,
      isConnected: false,
      repeatMS: 5000,
      collapse: ["1", "2", "3"],
      isShowMemberShipIcon: true,
      isShowPreview: false,
      isAlwaysOnTop: false,
      win: null,
      normalFrontColor: "#FFFFFF",

      messageStyleNormal: {
        background: "#FFFFFF",
      },
      messageStyleJianzhang: {
        background: "#FFFFFF",
      },
      commentStyleNormal: {
        color: "#FFFFFF",
      },
      nameStyleJianzhang: {
        color: "green",
      },
    };
  },
  computed: {
    message_size() {
      return this.pxParser(this.$store.state.Config.message["font-size"]);
    },
    normal_name_color() {
      return this.$store.state.Config.normal_name.color;
    },
    normal_name_size() {
      return this.pxParser(this.$store.state.Config.normal_name["font-size"]);
    },
    normal_name_board_color() {
      return this.$store.state.Config.normal_name["-webkit-text-stroke-color"];
    },
    normal_name_board_size() {
      return this.pxParser(
        this.$store.state.Config.normal_name["-webkit-text-stroke-width"]
      );
    },
    normal_comment_size() {
      return this.pxParser(
        this.$store.state.Config.normal_comment["font-size"]
      );
    },
    normal_comment_color() {
      return this.$store.state.Config.normal_comment.color;
    },

    captain_name_color() {
      return this.$store.state.Config.captain_name.color;
    },
    captain_name_size() {
      return this.pxParser(this.$store.state.Config.captain_name["font-size"]);
    },
    captain_name_board_color() {
      return this.$store.state.Config.captain_name["-webkit-text-stroke-color"];
    },
    captain_name_board_size() {
      return this.pxParser(
        this.$store.state.Config.captain_name["-webkit-text-stroke-width"]
      );
    },
    captain_comment_size() {
      return this.pxParser(
        this.$store.state.Config.captain_comment["font-size"]
      );
    },
    captain_comment_color() {
      return this.$store.state.Config.captain_comment.color;
    },

    admiral_name_color() {
      return this.$store.state.Config.admiral_name.color;
    },
    admiral_name_size() {
      return this.pxParser(this.$store.state.Config.admiral_name["font-size"]);
    },
    admiral_name_board_color() {
      return this.$store.state.Config.admiral_name["-webkit-text-stroke-color"];
    },
    admiral_name_board_size() {
      return this.pxParser(
        this.$store.state.Config.admiral_name["-webkit-text-stroke-width"]
      );
    },
    admiral_comment_size() {
      return this.pxParser(
        this.$store.state.Config.admiral_comment["font-size"]
      );
    },
    admiral_comment_color() {
      return this.$store.state.Config.admiral_comment.color;
    },

    governor_name_color() {
      return this.$store.state.Config.governor_name.color;
    },
    governor_name_size() {
      return this.pxParser(this.$store.state.Config.governor_name["font-size"]);
    },
    governor_name_board_color() {
      return this.$store.state.Config.governor_name[
        "-webkit-text-stroke-color"
      ];
    },
    governor_name_board_size() {
      return this.pxParser(
        this.$store.state.Config.governor_name["-webkit-text-stroke-width"]
      );
    },
    governor_comment_size() {
      return this.pxParser(
        this.$store.state.Config.governor_comment["font-size"]
      );
    },
    governor_comment_color() {
      return this.$store.state.Config.governor_comment.color;
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
    showMemberShipIcon(status) {
      this.isShowMemberShipIcon = status;
    },
    getMessageStyleByRole(message) {
      if (message.role === "normal") {
        return this.messageStyleNormal;
      }
    },
    getNameStyleByRole(message) {
      if (message.role === "normal") {
        return this.nameStyleNormal;
      } else if (message.role === "jianzhang") {
        return this.nameStyleJianzhang;
      }
    },
    showPreview(status) {
      const { x, y } = screen.getCursorScreenPoint();

      if (status) {
        if (!this.win) {
          this.win = new BrowserWindow({
            width: 320,
            height: 320,
            x,
            y,
            frame: false,
            transparent: true,
            webPreferences: {
              nodeIntegration: true,
            },
          });

          const winURL =
            process.env.NODE_ENV === "development"
              ? `http://localhost:9080/#/danmaku-example`
              : `file://${__dirname}/index.html/#/danmaku-example`;
          this.win.loadURL(winURL);
        } else {
          this.win.showInactive();
        }
      } else {
        this.win.hide();
      }
    },
    alwaysOnTop(status) {
      this.win.setFocusable(!status);
      this.win.setAlwaysOnTop(status);
      this.win.setIgnoreMouseEvents(status);
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

    pxFormatter: (value) => `${value}px`,
    pxParser: (value) => Number(value.replace("px", "")),
    change_message_size(number) {
      this.$store.dispatch("UPDATE_MESSAGE_STYLE", {
        "font-size": this.pxFormatter(number),
      });
    },
    change_normal_name_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "normal",
        type: "name",
        style: {
          color,
        },
      });
    },
    change_normal_name_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "normal",
        type: "name",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_normal_name_board_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "normal",
        type: "name",
        style: {
          "-webkit-text-stroke-width": this.pxFormatter(number),
        },
      });
    },
    change_normal_name_board_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "normal",
        type: "name",
        style: {
          "-webkit-text-stroke-color": color,
        },
      });
    },
    change_normal_comment_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "normal",
        type: "comment",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_normal_comment_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "normal",
        type: "comment",
        style: {
          color,
        },
      });
    },

    change_captain_name_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "captain",
        type: "name",
        style: {
          color,
        },
      });
    },
    change_captain_name_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "captain",
        type: "name",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_captain_name_board_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "captain",
        type: "name",
        style: {
          "-webkit-text-stroke-width": this.pxFormatter(number),
        },
      });
    },
    change_captain_name_board_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "captain",
        type: "name",
        style: {
          "-webkit-text-stroke-color": color,
        },
      });
    },
    change_captain_comment_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "captain",
        type: "comment",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_captain_comment_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "captain",
        type: "comment",
        style: {
          color,
        },
      });
    },

    change_admiral_name_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "admiral",
        type: "name",
        style: {
          color,
        },
      });
    },
    change_admiral_name_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "admiral",
        type: "name",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_admiral_name_board_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "admiral",
        type: "name",
        style: {
          "-webkit-text-stroke-width": this.pxFormatter(number),
        },
      });
    },
    change_admiral_name_board_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "admiral",
        type: "name",
        style: {
          "-webkit-text-stroke-color": color,
        },
      });
    },
    change_admiral_comment_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "admiral",
        type: "comment",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_admiral_comment_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "admiral",
        type: "comment",
        style: {
          color,
        },
      });
    },

    change_governor_name_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "governor",
        type: "name",
        style: {
          color,
        },
      });
    },
    change_governor_name_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "governor",
        type: "name",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_governor_name_board_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "governor",
        type: "name",
        style: {
          "-webkit-text-stroke-width": this.pxFormatter(number),
        },
      });
    },
    change_governor_name_board_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "governor",
        type: "name",
        style: {
          "-webkit-text-stroke-color": color,
        },
      });
    },
    change_governor_comment_size(number) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "governor",
        type: "comment",
        style: {
          "font-size": this.pxFormatter(number),
        },
      });
    },
    change_governor_comment_color(color) {
      this.$store.dispatch("UPDATE_STYLE", {
        role: "governor",
        type: "comment",
        style: {
          color,
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
  top: 50px;
  width: 90%;
  margin: 20px;
  height: 300px;
  bottom: 0;
  left: 0;
  position: absolute;

  border-radius: 24px;
  border: solid 3px gray;
  background: rgba(0, 0, 0, 0.3);
}
.danmmaku-example-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  border: 1px;
  background: rgba(0, 0, 0, 0.3);
}
</style>
