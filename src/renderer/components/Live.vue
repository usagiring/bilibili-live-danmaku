<template>
  <div>
    <div class="searcher-wrapper">
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
      </div>
    </div>

    <!-- <script src="flv.min.js"></script> -->
    <video id="livePlayer" controls></video>
  </div>
</template>

<script>
import * as flvjs from "flv.js";
import { remote } from "electron";
const dialog = remote.dialog;
import recorder from "../../service/bilibili-recorder";
import { DEFAULT_RECORD_DIR } from "../../service/const";
import { parseDownloadRate } from "../../service/util";
export default {
  data() {
    return {
      flvPlayer: null,
      onRecord: false,
      recordId: "",
      recordStartTime: 0,
      recordDuring: 0,
      recordTimer: null,
      downloadRate: "0 KB/s",
      recordQuality: "原画",
      playQuality: "超清",
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
  },
  mounted() {},
  methods: {
    async startRecord() {
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
    },
    async cancelRecord() {
      recorder.cancelRecord();
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
      console.log(result);
      if (!result.canceled) {
        const recordDir = result.filePaths[0];
        this.$store.dispatch("UPDATE_CONFIG", {
          recordDir,
        });
        await this.$nextTick();
      }
    },
  },
};
</script>

<style scoped>
</style>
