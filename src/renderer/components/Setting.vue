<template>
  <Row>
    <i-col span="12">
      <div>
        <span>连接直播间</span>
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
              <span>文字大小</span>
            </div>
            <div>
              <span>描边大小</span>
            </div>
            <div>
              <span>描边颜色</span>
              <ColorPicker v-model="normalFrontColor" size="small" />
            </div>

            <Collapse simple v-model="value4">
              <Panel name="1-1">
                名称前景色
                <div slot="content">
                  <div>
                    <span>普通</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>舰长</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>提督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>总督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>管理员</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>主播</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                </div>
              </Panel>
              <Panel name="1-2">
                评论前景色
                <div slot="content">
                  <div>
                    <span>普通</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>舰长</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>提督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>总督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>管理员</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>主播</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                </div>
              </Panel>
              <Panel name="1-3">
                消息背景色
                <div slot="content">
                  <div>
                    <span>普通</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>舰长</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>提督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>总督</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>管理员</span>
                    <ColorPicker v-model="normalFrontColor" size="small" />
                  </div>
                  <div>
                    <span>主播</span>
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
              <span>是否显示头像</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <div>
              <span>是否显示舰队图标</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
            <div>
              <span>是否显示合并弹幕数量</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
          </div>
        </Panel>
        <Panel name="3">
          其他
          <div slot="content">
            <div>
              <span>重复弹幕合并</span>
              <Poptip trigger="hover" content="多少毫秒内重复的弹幕只显示最早的一条，且后面显示堆叠数字，设置为0表示不堆叠">
                <Icon type="ios-help-circle-outline" />
              </Poptip>
              <Input v-model="repeatMS" size="small" style="width: 150px" />
            </div>
            <div>
              <span>是否显示SC区域</span>
              <i-switch v-model="isShowMemberShipIcon" @on-change="showMemberShipIcon" />
            </div>
          </div>
        </Panel>
      </Collapse>
    </i-col>
    <i-col span="12">
      <p>预览</p>
      <div>
        <span class="super-chat-in-top" style="background: Gold">
          <Avatar
            class="super-chat-avatar"
            src="https://i.loli.net/2017/08/21/599a521472424.jpg"
            size="small"
          />
          <span class="super-chat-text">$100</span>
        </span>
      </div>
      <!-- <Divider size="small" /> -->
      <p class="msg-normal">
        <span class="name-normal">其妙</span>:
        <span class="comment-normal">常无欲以观其妙</span>
      </p>
      <p class="msg-sponsor1">
        <span class="name-sponsor1">马自立</span>:
        <span class="comment-sponsor1">我就是Hololive！！！</span>
      </p>
    </i-col>
  </Row>
</template>

<script>
console.log("Setting");

import emitter, { init } from "../../service/bilibili-live-ws";

emitter.on("message", data => {
  console.log(data);
});

// TODO 配置读写文件
export default {
  data() {
    return {
      roomId: null,
      isConnected: false,
      repeatMS: 5000,
      collapse: ["1", "2", "3"],
      isShowMemberShipIcon: true,
      normalFrontColor: "#FFFFFF"
    };
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
</style>
