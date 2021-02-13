<template>
  <div id="live-wrapper">
    <div id="live-config-wrapper">
      <div :style="{ display: 'inline-block' }">
        <template v-if="!onRecord">
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
      </div>
    </div>

    <video
      id="livePlayer"
      controls
      :style="{ height: `${this.resolution}px` }"
    ></video>
    <div :style="{ padding: '0 20px 5px 20px' }">
      <Input
        v-model="message"
        placeholder="弹幕..."
        @on-enter="sendMessage"
        clearable
        :style="{ width: '360px' }"
      />
      <Button
        @click="sendMessage"
        :disabled="!this.message || !this.userCookie"
        :loading="isSending"
        >发送</Button
      >
      <Tooltip placement="top">
        <Icon type="md-alert" :style="{ 'font-size': '20px' }" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div :style="{ color: 'red' }">
            <p>本应用通过模拟客户端请求带上身份信息发送弹幕。</p>
            <p>请谨慎使用此功能！</p>
          </div>
        </div>
      </Tooltip>
    </div>
  </div>
</template>

<script>
import * as flvjs from "flv.js";
import cookie from "cookie";
import querystring from "querystring";
import { remote } from "electron";
const dialog = remote.dialog;
import recorder from "../../service/bilibili-recorder";
import { DEFAULT_RECORD_DIR } from "../../service/const";
import { parseDownloadRate } from "../../service/util";
import { sendMessage } from "../../service/bilibili-api";
export default {
  data() {
    return {
      flvPlayer: null,
      message: "",
      onRecord: false,
      isSending: false,
      recordId: "",
      recordStartTime: 0,
      recordDuring: 0,
      recordTimer: null,
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
    recordDir() {
      return this.$store.state.Config.recordDir || DEFAULT_RECORD_DIR;
    },
    recordDuringFormat() {
      return new Date(this.recordDuring).toISOString().substr(11, 8);
    },
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
  },
  mounted() {
    // this.onResize()
    // window.on("resize", this.onResize);
  },
  // beforeDestroy() {
  // window.removeListener("resize", this.onResize);
  // },
  methods: {
    async startRecord() {
      try {
        const { id } = await recorder.record(
          this.realRoomId,
          this.recordDir,
          this.recordQuality
        );

        this.recordId = id;
        recorder.recorder.emitter.on(
          `${id}-download-rate`,
          ({ bps, totalSize }) => {
            this.downloadRate = parseDownloadRate(bps);
          }
        );

        this.onRecord = true;
        this.recordStartTime = Date.now();
        this.recordTimer = setInterval(() => {
          this.recordDuring = Date.now() - this.recordStartTime;
        }, 1000);
      } catch (e) {
        this.$Message.error(`录制失败: ${e.message}`);
      }
    },
    async cancelRecord() {
      recorder.cancelRecord(this.recordId);
      this.onRecord = false;
      this.recordId = "";
      this.recordStartTime = 0;
      recorder.recorder.emitter.removeAllListeners(
        `${this.recordId}-download-rate`
      );
      clearInterval(this.recordTimer);
    },
    async play() {
      const playUrl = await recorder.getRandomPlayUrl(
        this.realRoomId,
        this.playQuality
      );
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
      this.isSending = true;
      const cookies = cookie.parse(this.userCookie);
      const csrf = cookies.bili_jct;
      const rnd = Math.floor(Date.now() / 1000 - 10000);
      const params = querystring.stringify({
        color: 16777215,
        fontsize: 25,
        mode: 1,
        msg: this.message,
        rnd,
        roomid: this.realRoomId,
        bubble: 0,
        csrf_token: csrf,
        csrf: csrf,
      });

      try {
        const result = await sendMessage(params, this.userCookie);
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
