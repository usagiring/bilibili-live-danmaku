<template>
  <div id="live-wrapper">
    <div id="live-config-wrapper">
      <div :style="{ display: 'inline-block' }">
        <template v-if="!this.isRecording">
          <Button @click="startRecord" shape="circle">
            <Icon type="md-radio-button-on" color="red" />
            录制
          </Button>
        </template>
        <template v-else>
          <Button @click="cancelRecord" shape="circle">
            <Icon type="md-square" color="red" />
            停止
          </Button>
        </template>
        {{ recordDuringFormat }}
        <div :style="{ display: 'inline-block', width: '70px' }">
          {{ downloadRate }}
        </div>
        <Select
          :value="recordQuality"
          style="width: 70px"
          @on-change="changeRecordQuality"
        >
          <Option
            v-for="quality in qualities"
            :value="quality.value"
            :key="quality.key"
            >{{ quality.value }}</Option
          >
        </Select>
        <Button @click="openRecordSaveFolderSelector" shape="circle">
          选择文件夹
        </Button>
        {{ recordDir }}
      </div>
      <div :style="{ 'padding-top': '3px' }">
        <Button @click="play" shape="circle">
          <Icon type="md-play" color="green" />
          播放
        </Button>
        <Select
          :value="playQuality"
          style="width: 70px"
          @on-change="changePlayQuality"
        >
          <Option
            v-for="quality in qualities"
            :value="quality.value"
            :key="quality.key"
            >{{ quality.value }}</Option
          >
        </Select>
        <Select
          :value="resolution"
          style="width: 70px"
          @on-change="changeResolutions"
        >
          <Option
            v-for="resolution in resolutions"
            :value="resolution.value"
            :key="resolution.key"
            >{{ resolution.value }}</Option
          >
        </Select>
        <Input
          :value="userCookie"
          @on-change="changeCookie"
          type="password"
          placeholder="Cookie..."
          clearable
          style="width: 150px"
        />
        <Tooltip placement="top">
          <Icon type="md-alert" :style="{ 'font-size': '20px' }" />
          <div slot="content" :style="{ 'white-space': 'normal' }">
            <div>
              <p>输入Cookie可以使用发送弹幕等功能。</p>
              <p :style="{ color: 'red' }">
                Cookie即为你在Bilibili上的身份信息，请勿泄露你的身份凭证！
              </p>
            </div>
          </div>
        </Tooltip>
        <Checkbox
          class="setting-checkbox"
          :value="isWithCookie"
          @on-change="withCookie"
          >带上Cookie录制/播放</Checkbox
        >
      </div>
    </div>

    <video
      id="livePlayer"
      controls
      :style="{ height: `${this.resolution}px` }"
    ></video>
    <div :style="{ padding: '0 20px 5px 10px' }">
      <FanMedal v-if="medalData" v-bind="medalData"></FanMedal>
      <Input
        v-model="message"
        placeholder="弹幕..."
        @on-keyup.ctrl.enter="sendMessage"
        clearable
        :style="{ width: '360px' }"
      />

      <Tooltip placement="top">
        <Button
          @click="sendMessage"
          :disabled="!this.message || !this.userCookie || !this.realRoomId"
          :loading="isSending"
          >发送</Button
        >
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div :style="{ color: 'red' }">
            <p>本应用通过模拟客户端请求带上身份信息发送弹幕。</p>
            <p>请谨慎使用此功能！</p>
          </div>
        </div>
      </Tooltip>
      <Button
        @click="wearCurrentMedal"
        :disabled="!this.userCookie || !this.medalId"
        :loading="isWearing"
        >佩戴当前直播间牌子</Button
      >
    </div>
  </div>
</template>

<script>
import * as flvjs from "flv.js";
import { remote } from "electron";
const dialog = remote.dialog;
import {
  record,
  getRandomPlayUrl,
  cancelRecord,
} from "../../service/bilibili-recorder";
import emitter from "../../service/event";
import { DEFAULT_RECORD_DIR } from "../../service/const";
import { parseDownloadRate, parseHexColor } from "../../service/util";
import {
  sendMessage,
  getInfoByUser,
  wearMedal,
} from "../../service/bilibili-api";
import FanMedal from "./FanMedal";

export default {
  components: {
    FanMedal,
  },
  data() {
    return {
      flvPlayer: null,
      message: "",
      isSending: false,
      isWearing: false,
      recordDuring: 0,
      recordTimer: null,
      medalData: null,
      downloadRate: "0 KB/s",
      recordQuality: "原画",
      playQuality: "超清",
      resolution: "480",
      qualities: [
        {
          key: 1,
          value: "原画",
        },
        {
          key: 2,
          value: "蓝光",
        },
        {
          key: 3,
          value: "超清",
        },
        {
          key: 4,
          value: "高清",
        },
        {
          key: 5,
          value: "流畅",
        },
      ],
      resolutions: [
        {
          key: 1,
          value: "240",
        },
        {
          key: 2,
          value: "320",
        },
        {
          key: 3,
          value: "480",
        },
        {
          key: 4,
          value: "720",
        },
        {
          key: 5,
          value: "960",
        },
      ],
    };
  },
  computed: {
    realRoomId() {
      return this.$store.state.Config.realRoomId;
    },
    medalId() {
      return this.$store.state.Config.medalId;
    },
    recordDir() {
      return this.$store.state.Config.recordDir || DEFAULT_RECORD_DIR;
    },
    recordDuringFormat() {
      return new Date(this.recordDuring).toISOString().substr(11, 8);
    },
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
    isRecording() {
      return this.$store.state.Config.isRecording;
    },
    isWithCookie() {
      return this.$store.state.Config.isWithCookie;
    },
    recordStartTime() {
      return this.$store.state.Config.recordStartTime;
    },
    recordId() {
      return this.$store.state.Config.recordId;
    },
  },
  mounted() {
    this.getMedalData();

    if (this.isRecording) {
      this.recordDuring = Date.now() - this.recordStartTime;
      this.recordTimer = setInterval(() => {
        this.recordDuring = Date.now() - this.recordStartTime;
      }, 1000);

      emitter.on(`${this.recordId}-download-rate`, ({ bps, totalSize }) => {
        this.downloadRate = parseDownloadRate(bps);
      });
    }
  },
  beforeDestroy() {
    emitter.removeAllListeners(`${this.recordId}-download-rate`);
  },
  methods: {
    async startRecord() {
      try {
        const { id } = await record({
          roomId: this.realRoomId,
          recordDir: this.recordDir,
          quality: this.recordQuality,
          cookie: this.isWithCookie ? this.userCookie : undefined,
        });

        emitter.on(`${id}-download-rate`, ({ bps, totalSize }) => {
          this.downloadRate = parseDownloadRate(bps);
        });

        this.$store.dispatch("UPDATE_CONFIG_TEMP", {
          recordId: id,
          recordStartTime: Date.now(),
          isRecording: true,
        });

        this.recordTimer = setInterval(() => {
          this.recordDuring = Date.now() - this.recordStartTime;
        }, 1000);
      } catch (e) {
        this.$Message.error(`录制失败: ${e.message}`);
      }
    },
    async cancelRecord() {
      try {
        await cancelRecord(this.recordId);
      } catch (e) {
        console.warn(e);
      }
      this.$store.dispatch("UPDATE_CONFIG_TEMP", {
        recordStartTime: 0,
        isRecording: false,
        recordId: "",
      });

      emitter.removeAllListeners(`${this.recordId}-download-rate`);
      clearInterval(this.recordTimer);
    },
    async play() {
      const playUrl = await getRandomPlayUrl({
        roomId: this.realRoomId,
        quality: this.playQuality,
        cookie: this.isWithCookie ? this.userCookie : undefined,
      });
      console.log(playUrl);

      if (flvjs.isSupported()) {
        const livePlayer = document.getElementById("livePlayer");

        if (this.flvPlayer) {
          this.flvPlayer.destroy();
          this.flvPlayer = null;
        }
        this.flvPlayer = flvjs.createPlayer({
          type: "flv",
          url: playUrl,
        });
        // {
        //   headers
        // }

        this.flvPlayer.on("error", (e) => {
          this.$Message.error(`播放失败: ${e}`);
        });

        this.flvPlayer.attachMediaElement(livePlayer);
        this.flvPlayer.load();
        await this.flvPlayer.play();
      } else {
        console.error("flvjs not support");
      }
    },

    changeRecordQuality(value) {
      this.recordQuality = value;
    },

    changePlayQuality(value) {
      this.playQuality = value;
    },

    async openRecordSaveFolderSelector() {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });
      if (!result.canceled) {
        const recordDir = result.filePaths[0];
        this.$store.dispatch("UPDATE_CONFIG", {
          recordDir,
        });
        await this.$nextTick();
      }
    },

    async sendMessage() {
      if (!this.userCookie || !this.realRoomId || !this.message) return;
      this.isSending = true;
      try {
        const result = await sendMessage(
          {
            message: this.message,
            roomId: this.realRoomId,
            color: 16777215,
            fontsize: 25,
            mode: 1,
            bubble: 0,
          },
          this.userCookie
        );
        if (result.data.message) {
          this.$Message.warning(`发送未成功: ${result.data.message}`);
        }
      } catch (e) {
        this.$Message.error(`发送失败: ${e.message}`);
      } finally {
        this.isSending = false;
      }
    },

    changeCookie(e) {
      this.$store.dispatch("UPDATE_CONFIG", {
        userCookie: e.target.value,
      });
    },

    changeResolutions(value) {
      this.resolution = value;
    },

    async getMedalData() {
      if (!this.userCookie) return;
      const { data } = await getInfoByUser(this.realRoomId, this.userCookie);
      const { medal } = data || {};
      const { curr_weared, is_weared } = medal || {};
      if (!is_weared) return;
      const {
        medal_color_start,
        medal_color_end,
        medal_color_border,
        medal_name,
        level,
      } = curr_weared;
      this.medalData = {
        medalColorStart: parseHexColor(medal_color_start),
        medalColorEnd: parseHexColor(medal_color_end),
        medalColorBorder: parseHexColor(medal_color_border),
        medalName: medal_name,
        medalLevel: level,
      };
    },

    async wearCurrentMedal() {
      if (!this.userCookie || !this.medalId) return;
      this.isWearing = true;
      try {
        const result = await wearMedal(this.medalId, this.userCookie);
        this.medalData = null;
        setTimeout(async () => {
          await this.getMedalData();
        }, 3000);
        if (result.data.code === 0) {
          this.$Message.success("佩戴成功");
        }
        if (result.data.code === -1) {
          this.$Message.error("佩戴失败");
        }
      } catch (e) {
        this.$Message.error(`${e.message}`);
      } finally {
        this.isWearing = false;
      }
    },

    async withCookie(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isWithCookie: status,
      });
    },

    // onResize: function () {
    //   const liveWrapper = document.getElementById("live-wrapper");
    //   console.log( liveWrapper.clientHeight)
    //   this.videoHeight = liveWrapper.clientHeight - 70
    // },
  },
};
</script>

<style scoped>
#live-config-wrapper {
  height: 70px;
}
</style>
