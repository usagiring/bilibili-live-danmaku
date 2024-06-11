<template>
  <div>
    <div class="item-container">弹幕指令：允许通过发送特殊规则弹幕触发相应操作。</div>
    <div class="item-container">
      <Checkbox :model-value="muteCommandSetting.enable" @on-change="changeMuteSettingEnable">禁言</Checkbox>
      <Tooltip placement="top" transfer>
        <Icon type="md-help" class="info-icon" />
        <template #content>
          <div :style="{ 'white-space': 'normal', 'line-height': '24px', width: '230px' }">
            <p>● 禁言咒</p>
            <p>● 需要设置<span :style="{ color: 'pink' }">当前房间的管理员Cookie</span></p>
            <p>● 指令由「自定义指令」+「{user}占位符」组成，例如默认为「#禁言:{user}」，发送#禁言:XXX，XXX将被禁言</p>
            <p>● 可设置使用者权限</p>
            <p>● 所需人数为多人投票机制，例如设置为2时，需要两个不同且符合角色的用户发送#禁言:XXX，才会触发禁言，时效一分钟。</p>
          </div>
        </template>
      </Tooltip>
      <!-- 指令: #禁言:名称或者UID -->
      <Divider type="vertical" />
      <span>指令</span>
      <Input class="keyword-input" size="small" :model-value="muteCommandSetting.keyword" :border="false" placeholder="#禁言:" @on-change="onChangeMuteSettingKeyWord" />
      <span :style="{ color: 'silver' }">{user}</span>
      <Divider type="vertical" />
      <span>可使用角色</span>
      <Select :model-value="muteCommandSetting.roles" class="role-selector" multiple transfer size="small" placeholder="任何人" @on-change="onChangeMuteSettingRoles">
        <Option v-for="(option, index) in roles" :key="index" :value="option.value" :label="option.label">
          <span>{{ option.label }}</span>
        </Option>
      </Select>
      <Divider type="vertical" />
      <span>所需人数</span>
      <InputNumber :model-value="muteCommandSetting.count" size="small" :min="1" :step="1" :style="{ width: '50px' }" @on-change="onChangeMuteSettingCount" />
      <!-- <Divider type="vertical" /> -->
      <!-- <Checkbox class="" :model-value="muteCommandSetting.useHintText" @on-change="changeMuteSettingUseHint">发送提示</Checkbox> -->
    </div>
  </div>
</template>

<script>
import { updateSetting } from '../../service/api'

export default {
  data() {
    return {
      roles: [
        {
          value: 'owner',
          label: '主播',
        },
        {
          value: 'admin',
          label: '房管',
        },
        {
          value: '1',
          label: '总督',
        },
        {
          value: '2',
          label: '提督',
        },
        {
          value: '3',
          label: '舰长',
        },
      ],
    }
  },
  computed: {
    muteCommandSetting() {
      return this.$store.state.Config.muteCommandSetting || {}
    },
  },
  methods: {
    async changeMuteSettingEnable(status) {
      const data = {
        muteCommandSetting: {
          ...this.muteCommandSetting,
          enable: status,
        },
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async onChangeMuteSettingRoles(values) {
      const data = {
        muteCommandSetting: {
          ...this.muteCommandSetting,
          roles: values,
        },
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async onChangeMuteSettingKeyWord(e) {
      const data = {
        muteCommandSetting: {
          ...this.muteCommandSetting,
          keyword: e.target.value,
        },
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async onChangeMuteSettingCount(number) {
      const data = {
        muteCommandSetting: {
          ...this.muteCommandSetting,
          count: number,
        },
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    async changeMuteSettingUseHint(status) {
      const data = {
        muteCommandSetting: {
          ...this.muteCommandSetting,
          hintText: '正在禁言：{user}，需{count}票通过，时效一分钟',
          useHintText: status,
        },
      }
      await updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },
  },
}
</script>

<style scoped>
.item-container {
  padding: 30px 30px 0px 30px;
}
.role-selector {
  width: 150px;
}
.keyword-input {
  width: 60px;
}
</style>
