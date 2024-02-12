<template>
  <div>
    <div class="tag-container">
      <Container :get-child-payload="getTagPayload" orientation="horizontal" behaviour="copy" @drop="onDrop">
        <Draggable v-for="tag in tags" :key="tag.id">
          <div :class="tag.class ? `draggable-tag ${tag.class}` : 'draggable-tag'">
            {{ tag.name }}
          </div>
        </Draggable>
      </Container>
    </div>
    <Row :style="{ padding: '6px' }">
      <i-col span="1">
        <div class="col-header">
          <Tooltip max-width="600" transfer placement="right">
            <Icon type="md-help" class="info-icon" />
            <template #content>
              <div :style="{ 'white-space': 'normal', 'line-height': '24px' }">
                <p>● 每一条回复规则由「触发类型」+「回复模版文本」+「规则」组成。</p>
                <p>
                  ● 每一条规则应该要有至少一条<span :style="{ color: 'aquamarine' }">执行规则</span>，可以有若干条<span :style="{ color: 'violet' }">限制规则</span>。
                  <span :style="{ color: 'pink' }">拖拽</span>上面「标签」到规则栏！
                </p>
                <p>● 目前可用<span :style="{ color: 'pink' }">模版占位符</span>有 {user} {gift} {comment} {superchat} {@user}。 模版占位符将被替换为实际内容！</p>
                <p>● 例如：触发类型：弹幕，回复文字模版：{user}说 {comment}，规则：佩戴粉丝牌，语音播放。 表示在收到佩戴当前直播间粉丝牌的弹幕时播放语音：(用户名)说 (弹幕内容)</p>
                <!-- <p>
                例如：感谢 {user.name} 赠送的 {gift.name}, 将替换为 感谢 (用户名) 赠送的 (礼物名)
              </p> -->
                <p>● 匹配<span :style="{ color: 'pink' }">优先级</span>从上到下逐渐增高，当高优先级规则匹配通过，低优先级不再触发。</p>
                <p>● 部分标签可<span :style="{ color: 'pink' }">点击</span>打开下拉窗口，进一步设置。</p>
                <p>● 部分不合逻辑，暂未支持的组合将无法拖拽。</p>
              </div>
            </template>
          </Tooltip>
        </div>
      </i-col>
      <i-col span="1">
        <div class="col-header">启用</div>
      </i-col>
      <i-col span="2">
        <div class="col-header">触发类型</div>
      </i-col>
      <i-col span="6">
        <div class="col-header">回复文字模版</div>
      </i-col>
      <i-col span="13">
        <div class="col-header">规则</div>
      </i-col>
      <i-col span="1" />
    </Row>
    <Container :get-child-payload="getRulePayload" drag-handle-selector=".column-drag-handle" @drop="onDropRule">
      <template v-for="(rule, index) in rules" :key="index">
        <Draggable>
          <Row :style="{ padding: '6px' }">
            <i-col span="1">
              <div>
                <span class="column-drag-handle" style="float: left; padding: 0 10px">&#x2630;</span>
              </div>
            </i-col>
            <i-col span="1" :style="{ 'text-align': 'center' }">
              <Checkbox :model-value="rule.enable" :style="{ 'vertical-align': 'middle', 'margin-left': '8px' }" @on-change="changeEnable(index, $event)" />
            </i-col>
            <i-col span="2">
              <Select :model-value="rule.type" :style="{ padding: '0 7px' }" transfer size="small" @on-change="onChangeRuleType(index, $event)">
                <Option v-for="(option, index1) in types" :key="index1" :value="option.key" :label="option.label">
                  <span>{{ option.value }}</span>
                </Option>
              </Select>
            </i-col>
            <i-col span="6">
              <Input :model-value="rule.text" placeholder="回复内容..." :style="{ padding: '0 7px' }" size="small" @on-change="debouncedChangeText(index, $event)" />
            </i-col>
            <i-col span="13">
              <Container
                :style="{ width: '100%' }"
                :drop-placeholder="dropPlaceholderOptions"
                :should-accept-drop="(src, payload) => shouldAcceptDrop(index, src, payload)"
                orientation="horizontal"
                @drop="onDrop(index, $event)"
              >
                <template v-for="(tag, tagIndex) in rule.tags" :key="tag.id">
                  <div :class="tag.class ? `rule-tag sub-${tag.class}` : 'rule-tag'">
                    <template v-if="tag.template">
                      <Poptip placement="bottom" transfer>
                        <span>{{ fillDisplay(tag) }} </span>
                        <template #content>
                          <div>
                            <TagContent :template="tag.template" :data="tag.data" @value-change="onDataChange(index, tagIndex, $event)" />
                          </div>
                        </template>
                      </Poptip>
                    </template>
                    <template v-else>
                      <span>{{ fillDisplay(tag) }} </span>
                    </template>
                    <Icon type="md-close" class="remove-rule" @click="removeTag(index, tagIndex)" />
                  </div>
                </template>
              </Container>
            </i-col>
            <i-col span="1">
              <Icon type="md-close" class="remove-rule" @click="removeRule(index)" />
            </i-col>
          </Row>
        </Draggable>
      </template>
    </Container>
    <div :style="{ padding: '5px 20px' }">
      <Button type="primary" long @click="addRule">
        <Icon :style="{ 'font-weight': 'bold' }" type="md-add" />
      </Button>
    </div>
  </div>
</template>

<script>
import { toRaw } from 'vue'
import { Container, Draggable } from 'vue3-smooth-dnd'
import TagContent from './TagContent.vue'
import { getVoices, updateSetting } from '../../service/api'
import { getGiftConfig } from '../../service/util'
import { cloneDeep, debounce } from 'lodash'

const synth = window.speechSynthesis

const roleOptions = [
  {
    key: 1,
    label: '总督',
    value: '总督',
  },
  {
    key: 2,
    label: '提督',
    value: '提督',
  },
  {
    key: 3,
    label: '舰长',
    value: '舰长',
  },
]

const dropAcceptRules = {
  comment: ['ROLE', 'FILTER', 'MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY'],
  gift: ['ROLE', 'GIFT', 'GOLD', 'SILVER', 'TEXT_REPLY', 'SPEAK_REPLY'],
  superchat: ['FILTER', 'TEXT_REPLY', 'SPEAK_REPLY'],
  interact: ['MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY'],
}

export default {
  name: 'Simple',
  components: { Container, Draggable, TagContent },
  data() {
    return {
      dropPlaceholderOptions: {
        className: 'drop-preview',
        animationDuration: '150',
      },
      giftOptions: [],
      types: [
        {
          key: 'comment',
          label: '弹幕',
          value: '弹幕',
        },
        {
          key: 'gift',
          label: '礼物',
          value: '礼物',
        },
        {
          key: 'superchat',
          label: '醒目留言',
          value: '醒目留言',
        },
        {
          key: 'interact',
          label: '交互',
          value: '交互',
        },
      ],
      tags: [
        // {
        //   id: '1',
        //   key: 'LEVEL', // TODO ?
        //   name: '等级',
        //   content: '等级 > {level}',
        //   data: {
        //     level: 1
        //   },
        //   template: {
        //     title: '等级限制',
        //     rows: [
        //       {
        //         key: 'level',
        //         display: '等级',
        //         value: 1,
        //         type: 'InputNumber',
        //         step: 1,
        //         min: 1,
        //         max: 40
        //       }
        //     ]
        //   }
        // },
        {
          id: 2,
          key: 'ROLE',
          name: '舰队',
          content: '舰队: {transfer:roleNames}',
          data: {
            roles: [],
          },
          template: {
            title: '舰队',
            rows: [
              {
                key: 'roles',
                display: '舰队',
                value: [],
                type: 'MultiSelect',
                options: roleOptions,
              },
            ],
          },
        },
        {
          id: 3,
          key: 'FILTER',
          name: '文本匹配',
          content: '匹配规则: {filter}',
          data: {
            filter: '',
          },
          template: {
            title: '文本匹配',
            rows: [
              {
                key: 'filter',
                display: '过滤规则',
                placeholder: '支持正则表达式...',
                value: '',
                type: 'Input',
              },
            ],
          },
        },
        {
          id: 4,
          key: 'GIFT',
          name: '指定礼物',
          content: '礼物: {transfer:giftName}',
          data: {
            giftIds: [],
          },
          template: {
            title: '礼物',
            rows: [
              {
                key: 'giftIds',
                display: '礼物',
                value: '',
                type: 'MultiSelect',
                options: this.giftOptions,
              },
            ],
          },
        },
        {
          id: 5,
          key: 'MEDAL',
          name: '粉丝牌',
          content: '佩戴粉丝牌',
        },
        {
          id: 6,
          key: 'GOLD',
          name: '仅金瓜子',
          content: '仅金瓜子',
        },
        {
          id: 7,
          key: 'SILVER',
          name: '仅银瓜子',
          content: '仅银瓜子',
        },
        {
          id: 8,
          key: 'TEXT_REPLY',
          name: '弹幕回复',
          content: '弹幕回复',
          class: 'process-tag',
          data: {
            allowAllUserDanmakuReply: false,
          },
          template: {
            title: '弹幕回复说明',
            rows: [
              {
                type: 'Text',
                value: '需要在设置里输入用户Cookie',
              },
              {
                type: 'Text',
                value: '默认仅当前主播可用，需要使用其他用户回复，请打开下面开关',
              },
              {
                type: 'Checkbox',
                display: '允许使用任意身份的用户回复',
                key: 'allowAllUserDanmakuReply',
                value: false,
              },
            ],
          },
        },
        {
          id: 9,
          key: 'SPEAK_REPLY',
          name: '语音播放',
          content: '语音播放',
          data: {
            voice: '',
            speed: 1.0,
          },
          class: 'process-tag',
          template: {
            title: '语音播放',
            rows: [
              {
                key: 'voice',
                display: '声音',
                value: '',
                type: 'Select',
                options: [],
              },
              {
                key: 'speed',
                display: '语速',
                value: 0,
                type: 'InputNumber',
                step: 0.1,
                min: 0.1,
                max: 2.0,
              },
            ],
          },
        },
      ],
    }
  },
  computed: {
    rules() {
      return this.$store.state.Config.autoReplyRules
    },
  },
  async created() {
    this.debouncedChangeText = debounce(this.changeText, 500)

    // const giftOptions = []
    // const giftConfig = await getGiftConfig()
    // for (const key in giftConfig) {
    //   const { name, webp } = giftConfig[key]
    //   giftOptions.push({
    //     key: key,
    //     value: name,
    //     label: name,
    //     webp: webp,
    //   })
    // }
    // this.giftOptions = giftOptions
  },
  mounted() {
    // setTimeout(() => {
    //   const options =
    //     this.$global?.voices?.map((voice) => {
    //       return {
    //         key: voice.name,
    //         value: voice.name,
    //         label: voice.name,
    //       }
    //     }) || []
    //   const voiceTag = this.tags.find((tag) => tag.id === 9)
    //   voiceTag.template.rows[0].options = options
    //   const giftTag = this.tags.find((tag) => tag.id === 4)
    //   giftTag.template.rows[0].options = this.giftOptions
    // }, 500)
  },
  methods: {
    async onDrop(index, dropResult) {
      let { addedIndex, payload } = dropResult
      payload = toRaw(payload)
      if (!Number.isFinite(addedIndex)) return
      const rules = cloneDeep(this.rules)
      if (payload.key === 'SPEAK_REPLY') {
        const options =
          this.$global?.voices?.map((voice) => {
            return {
              key: voice.name,
              value: voice.name,
              label: voice.name,
            }
          }) ||
          synth.getVoices() ||
          []
        payload.template.rows[0].options = options
      }

      if (payload.key === 'GIFT') {
        const giftConfig = await getGiftConfig()
        const giftOptions = []
        for (const [key, { name, webp }] of Object.entries(giftConfig)) {
          giftOptions.push({
            key: key,
            value: name,
            label: name,
            webp: webp,
          })
        }
        payload.template.rows[0].options = giftOptions
      }
      rules[index].tags = rules[index].tags || []
      rules[index].tags.splice(addedIndex, 0, payload)
      
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    onDropRule(dropResult) {
      const { removedIndex, addedIndex, payload } = dropResult
      const rules = cloneDeep(this.rules)
      let itemToAdd = payload
      if (Number.isFinite(removedIndex)) {
        itemToAdd = rules.splice(removedIndex, 1)[0]
      }

      if (Number.isFinite(addedIndex)) {
        rules.splice(addedIndex, 0, itemToAdd)
      }
      rules.forEach((rule, index) => {
        rule.priority = index
      })

      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    getTagPayload(index) {
      return this.tags[index]
    },
    getRulePayload(index) {
      return this.rules[index]
    },
    fillDisplay(tag) {
      let display = tag.content
      const match = tag.content.matchAll(/{.*}/g)
      const map = Array.from(match).reduce((map, next) => {
        const substr = next[0].substring(1, next[0].length - 1)
        let value = tag.data[substr]
        if (~substr.indexOf('transfer')) {
          const [, func] = substr.split(':')
          value = this[func](tag)
        }
        return Object.assign(map, {
          [next[0]]: value,
        })
      }, {})

      for (const key in map) {
        const value = map[key]
        display = display.replace(key, value)
      }
      return display
    },

    roleNames(tag) {
      const roleKeys = tag.data.roles
      return roleKeys.map((key) => roleOptions.find((o) => o.key === key).value).join(',')
    },

    giftName(tag) {
      const giftIds = tag.data.giftIds
      return giftIds.map((key) => (this.giftOptions.find((o) => o.key === key) || {}).value).join(',')
    },

    removeTag(ruleIndex, tagIndex) {
      const rules = cloneDeep(this.rules)
      rules[ruleIndex].tags.splice(tagIndex, 1)
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    removeRule(ruleIndex) {
      const rules = cloneDeep(this.rules)
      rules.splice(ruleIndex, 1)
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    addRule() {
      const rules = cloneDeep(this.rules)
      const lastRule = rules.slice(-1)[0]
      rules.push({
        type: '',
        text: '',
        enable: true,
        priority: lastRule ? lastRule.priority + 1 : 0,
        tags: [],
      })
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    changeEnable(index, status) {
      const rules = cloneDeep(this.rules)
      rules[index].enable = status
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    onChangeRuleType(index, type) {
      const rules = cloneDeep(this.rules)
      rules[index].type = type
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    onDataChange(ruleIndex, tagIndex, payload) {
      const rules = cloneDeep(this.rules)
      rules[ruleIndex].tags[tagIndex].data = rules[ruleIndex].tags[tagIndex].data || {}
      rules[ruleIndex].tags[tagIndex].data = Object.assign(rules[ruleIndex].tags[tagIndex].data, payload)

      console.log(ruleIndex, tagIndex, payload, rules)
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    changeText(ruleIndex, e) {
      const rules = cloneDeep(this.rules)
      rules[ruleIndex].text = e.target.value
      const data = {
        autoReplyRules: rules,
      }
      updateSetting(data)
      this.$store.dispatch('UPDATE_CONFIG', data)
    },

    shouldAcceptDrop(index, sourceContainerOptions, payload) {
      const rule = this.rules[index]
      if (!rule.type) {
        // this.$Message.warning('请先设置类型')
        return false
      }
      if (!dropAcceptRules[rule.type].includes(payload.key)) {
        // this.$Message.warning('该规则不适用于该类型')
        return false
      }
      if (rule.tags.find((tag) => tag.key === payload.key)) {
        // this.$Message.warning('已存在相同规则')
        return false
      }
      return true
    },
  },
}
</script>

<style scoped>
.tag-container {
  padding: 5px 0 3px 10px;
}
.draggable-tag {
  border: 1.2px dashed violet;
  border-radius: 10px;
  padding: 3px 10px;
  margin: 6px;
  display: inline-block;
  -webkit-user-select: none;
  user-select: none;
  cursor: move;
}
.process-tag {
  border: 1.2px dashed green !important;
}
.sub-process-tag {
  border: 1px solid green !important;
}
.rule-tag {
  border: 1px solid violet;
  border-radius: 10px;
  padding: 1px 6px;
  margin: 0 3px;
  display: inline-block;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
}
.remove-rule {
  font-size: 16px;
  color: crimson;
}
.col-header {
  text-align: center;
}
.column-drag-handle {
  cursor: move;
}
.info-icon {
  font-size: 16px;
}
</style>
