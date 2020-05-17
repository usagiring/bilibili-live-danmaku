<template>
  <Row>
    <i-col span="12">
      <div>
        <span class="setting-key-text">连接直播间</span>
        <Input
          v-model="roomId"
          placeholder="请输入房间号"
          size="small"
          :disabled="isConnected"
          style="width: 150px"
        />
        <i-switch v-model="isConnected" @on-change="connect" :disabled="!roomId" />
      </div>
      <Collapse simple :value="collapse">
        <Panel name="1">
          文本
          <div slot="content">
            <div>
              <span class="setting-key-text">文字大小</span>
            </div>
            <div>
              <span class="setting-key-text">描边大小</span>
            </div>
            <div>
              <span class="setting-key-text">描边颜色</span>
              <ColorPicker v-model="normalFrontColor" size="small" />
            </div>

            <Collapse simple>
              <Panel name="1-1">
                名称前景色
                <div slot="content">
                  <div>
                    <span class="setting-key-text">普通</span>
                    <ColorPicker v-model="nameStyleNormal.color" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">舰长</span>
                    <ColorPicker v-model="nameStyleJianzhang.color" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">提督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">总督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">管理员</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">主播</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                </div>
              </Panel>
              <Panel name="1-2">
                评论前景色
                <div slot="content">
                  <div>
                    <span class="setting-key-text">普通</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">舰长</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">提督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">总督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">管理员</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">主播</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                </div>
              </Panel>
              <Panel name="1-3">
                消息背景色
                <div slot="content">
                  <div>
                    <span class="setting-key-text">普通</span>
                    <ColorPicker v-model="messageStyleNormal.background" alpha size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">舰长</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">提督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">总督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">管理员</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span class="setting-key-text">主播</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                </div>
              </Panel>
            </Collapse>
          </div>
        </Panel>
        <Panel name="2">
          图标
          <div slot="content">
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
          </div>
        </Panel>
      </Collapse>
    </i-col>
    <i-col span="12">
      <p>预览</p>
      <span @click="openNewWindow">独立窗口</span>
      <DanmakuExample />
    </i-col>
  </Row>
</template>

<script>
import { remote } from "electron";
const { BrowserWindow } = remote;
import DanmakuExample from "./DanmakuExample.vue";
import emitter, { init } from "../../service/bilibili-live-ws";

emitter.on("message", data => {
  console.log(data);
});

// TODO 配置读写文件
export default {
  components: {
    DanmakuExample
  },
  data() {
    return {
      roomId: null,
      isConnected: false,
      repeatMS: 5000,
      collapse: ["1", "2", "3"],
      isShowMemberShipIcon: true,
      normalFrontColor: "#FFFFFF",
      messageStyleNormal: {
        background: "#FFFFFF"
      },
      messageStyleJianzhang: {
        background: "#FFFFFF"
      },
      nameStyleNormal: {
        color: "black"
      },
      commentStyleNormal: {
        color: "#FFFFFF"
      },
      nameStyleJianzhang: {
        color: "green"
      },

      messages: [
        {
          id: 1,
          uid: "12345",
          name: "其妙",
          comment: "草",
          role: "jianzhang"
        },
        {
          id: 2,
          uid: "12346",
          name: "马自立",
          type: "comment",
          comment: "我就是Hololive！！！",
          role: "tidu"
        },
        {
          id: 3,
          uid: "12346",
          name: "马自立",
          type: "gift",
          comment: "我就是Hololive！！！",
          role: "normal"
        },
        {
          id: 4,
          uid: "12346",
          name: "马自立",
          type: "super-chat",
          comment: "我就是Hololive！！！",
          role: "normal"
        },
        {
          id: 5,
          uid: "12345",
          name: "Res",
          comment: "草",
          role: "normal"
        }
      ],
      superChats: [
        {
          uid: "12346",
          name: "马自立",
          type: "super-chat",
          number: 100,
          unit: "RMB",
          comment: "我就是Hololive！！！",
          role: "normal"
        }
      ]
    };
  },
  computed: {
    // getMessageStyleByRole() {
    //   // if (message.role === "normal") {
    //     return this.messageNormalStyle
    //   // }
    // }
  },
  methods: {
    async connect(status) {
      if (status && !this.roomId) {
        return;
      }

      this.roomId = 11588230;
      await init({ roomId: this.roomId });
      this.isConnected = status;
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
    openNewWindow() {
      console.log("123");
      const win = new BrowserWindow({
        width: 320,
        height: 320,
        frame: false,
        transparent: true,
        titleBarStyle: "hidden"
        // backgroundColor: '#FFFFFFFF',
        // opacity: 0.1,
      });
      win.on("closed", () => {});
      setTimeout(() => {
        const winURL =
          process.env.NODE_ENV === "development"
            ? `http://localhost:9080/#/danmaku-example`
            : `file://${__dirname}/index.html/#/danmaku-example`;
        win.loadURL(winURL);
        // win.show()
      }, 2000);
    }
  }
};
</script>

<style scoped>
.super-chat-avatar {
  transform: translate(0%, -5%);
}
.super-chat-in-top {
  display: inline-block;
  height: 32px;
  border-radius: 20px;
  padding: 0px 10px;
  font-size: 18px;
  line-height: 32px;
}
.super-chat-text {
}

.message-normal {
  background: silver;
}
.setting-key-text {
  display: inline-block;
  width: 140px;
  text-align: right;
}
</style>
