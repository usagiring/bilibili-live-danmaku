<template>
  <div>
    <div class="setting-key">
      <Poptip confirm title="确认还原默认设置？" placement="right" width="300" @on-ok="clearAllSetting">
        <Button>还原默认设置</Button>
      </Poptip>
    </div>
    <div class="setting-key">
      <Poptip confirm :title="`确认备份并清理数据库？建议仅在启动明显变慢时操作。备份文件夹: ${USER_DATA_PATH}`" placement="right" width="400" word-wrap @on-ok="backupAndClearDB">
        <Button>备份并清理数据库</Button>
      </Poptip>
    </div>
    <div class="setting-key">
      <Poptip confirm title="确认清理用户缓存？用于刷新用户头像，不建议经常清理" placement="right" width="400" @on-ok="clearUserDB">
        <Button>清理用户缓存</Button>
      </Poptip>
    </div>
    <div class="setting-key">
      <Input :value="userCookie" @on-change="changeCookie" type="password" placeholder="Cookie..." clearable style="width: 150px" />
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
    <div class="setting-key">
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
</template>

<script>

export default {
  data() {
    return {
    };
  }
};
</script>

<style scoped>
</style>
