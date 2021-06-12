<template>
  <div>
    <div class="config-item-container">
      <Poptip confirm title="确认还原弹幕样式？" placement="right" width="300" @on-ok="clearAllSetting">
        <Button class="config-item">还原默认弹幕样式</Button>
      </Poptip>
    </div>
    <div class="config-item-container">
      <Poptip confirm title="确认备份并清理数据库？" placement="right" width="400" word-wrap @on-ok="backupAndClearDB">
        <Button class="config-item">备份并清理数据库</Button>
      </Poptip>
      <Tooltip placement="top" max-width="300">
        <Icon type="md-help" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>弹幕数据留存过多可能会导致启动变慢。可以尝试清理并备份，备份数据自行选择留档或手动删除。数据文件夹: {{USER_DATA_PATH}}</p>
          </div>
        </div>
      </Tooltip>
    </div>
    <div class="config-item-container">
      <Poptip confirm title="确认清理用户头像缓存？" placement="right" width="400" @on-ok="clearUserDB">
        <Button class="config-item">清理用户头像缓存</Button>
      </Poptip>
      <Tooltip placement="top" max-width="300">
        <Icon type="md-help" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>为了防止触发B站限流，用户头像会缓存，可以清理并重新获取最新数据。</p>
          </div>
        </div>
      </Tooltip>
    </div>
    <div class="config-item-container">
      <Input class="config-item" :value="userCookie" @on-change="changeCookie" type="password" placeholder="Cookie..." clearable />
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
    <div class="config-item-container">
      <Checkbox :value="isAutoRecord" @on-change="changeAutoRecord" :style="{ height: '30px','line-height': '30px'}">自动录制</Checkbox>
      <Tooltip placement="top">
        <Icon type="md-help" />
        <div slot="content" :style="{ 'white-space': 'normal' }">
          <div>
            <p>当连接直播间时，如果开播会自动开始录制</p>
          </div>
        </div>
      </Tooltip>
    </div>
  </div>
</template>

<script>
import { remote } from "electron";
const window = remote.getCurrentWindow();
import Store from "electron-store";
import {
  USER_DATA_PATH,
  DEFAULT_STYLE
} from "../../service/const";

import { clearDB, backupDB, updateSetting, clearMessage, replaceSetting, sendExampleMessages, restoreExampleMessage } from '../../service/api'

export default {
  data() {
    return {
      USER_DATA_PATH: USER_DATA_PATH,
    };
  },
  computed: {
    userCookie() {
      return this.$store.state.Config.userCookie;
    },
    isAutoRecord() {
      return this.$store.state.Config.isAutoRecord;
    },
  },
  methods: {
    async clearAllSetting() {
      await replaceSetting(DEFAULT_STYLE)

      // const store = new Store({ name: "vuex" })
      // store.clear()
      this.$store.dispatch("UPDATE_CONFIG", DEFAULT_STYLE);
      window.reload()
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

    async changeCookie(e) {
      this.$store.dispatch("UPDATE_CONFIG", {
        userCookie: e.target.value,
      });
    },

    async changeAutoRecord(status) {
      this.$store.dispatch("UPDATE_CONFIG", {
        isAutoRecord: status,
      });
    },
  }
};
</script>

<style scoped>
.config-item-container {
  padding: 10px 5px 0px 10px;
}
.config-item {
  width: 150px;
}
</style>
