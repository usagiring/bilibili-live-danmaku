<template>
  <div>
    <div class="tag-container">
      <Container :getChildPayload="getTagPayload" @drop="onDrop" orientation="horizontal" behaviour="copy">
        <Draggable v-for="tag in tags" :key="tag.id">
          <div class="draggable-tag">
            {{tag.name}}
          </div>
        </Draggable>
      </Container>
    </div>
    <Row :style="{padding: '6px'}">
      <i-col span="1">
        <div class="col-header">启用</div>
      </i-col>
      <i-col span="2">
        <div class="col-header">类别</div>
      </i-col>
      <i-col span="7">
        <div class="col-header">文字模版</div>
      </i-col>
      <i-col span="13">
        <div class="col-header">规则</div>
      </i-col>
      <i-col span="1">
      </i-col>
    </Row>
    <template v-for="(rule, index) in rules">
      <Row :key="index" :style="{padding: '6px'}">
        <i-col span="1" :style="{'text-align':'center'}">
          <Checkbox :value="rule.enable" :style="{'vertical-align': 'middle', 'margin-left': '8px'}" @on-change="changeEnable(index, $event)"></Checkbox>
        </i-col>
        <i-col span="2">
          <Select :value="rule.type" :style="{padding: '0 7px'}" size="small" @on-change="onChangeRuleType(index, $event)">
            <Option v-for="(option, index) in types" :value="option.key" :key="index" :label="option.label">
              <span>{{ option.value }}</span>
            </Option>
          </Select>
        </i-col>
        <i-col span="7">
          <Input :value="rule.text" @on-change="changeText(index, $event)" placeholder="回复内容..." :style="{padding: '0 7px'}" size="small" />
        </i-col>
        <i-col span="13">
          <Container :style="{width: '100%'}" @drop="onDrop(index, $event)" :should-accept-drop="(src, payload) => shouldAcceptDrop(rule, src, payload)" orientation="horizontal">
            <template v-for="(tag, tagIndex) in rule.tags">
              <div class="rule-tag" :key="tag.id">
                <template v-if="tag.template">
                  <Poptip placement="bottom">
                    <span>{{ fillDisplay(tag) }} </span>
                    <div class="" slot="content">
                      <TagContent :template="tag.template" :data="tag.data" v-on:value-change="onDataChange(index,tagIndex, $event)" />
                    </div>
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
    </template>
    <div :style="{ padding: '5px 20px'}">
      <Button @click="addRule" type="primary" long>
        <Icon :style="{'font-weight': 'bold'}" type="md-add" />
      </Button>
    </div>
  </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import TagContent from './TagContent.vue'
import { getVoices, speak as speakAPI, getGiftConfig, updateSetting } from '../../service/api'
import { cloneDeep } from 'lodash'

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
  }
]

let giftOptions = [

]

const dropAcceptRules = {
  comment: ['ROLE', 'FILTER', 'MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY'],
  gift: ['ROLE', 'GIFT', 'GOLD', 'SILVER', 'TEXT_REPLY', 'SPEAK_REPLY'],
  superchat: ['FILTER', 'TEXT_REPLY', 'SPEAK_REPLY'],
  interact: ['MEDAL', 'TEXT_REPLY', 'SPEAK_REPLY']
}

export default {
  name: "Simple",
  components: { Container, Draggable, TagContent },
  data() {
    return {
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
        }
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
            roles: []
          },
          template: {
            title: '舰队',
            rows: [
              {
                key: 'roles',
                display: '舰队',
                value: [],
                type: 'MultiSelect',
                options: roleOptions
              }
            ]
          }
        },
        {
          id: 3,
          key: 'FILTER',
          name: '关键字过滤',
          content: '过滤规则: {filter}',
          data: {
            filter: ''
          },
          template: {
            title: '关键字过滤',
            rows: [
              {
                key: 'filter',
                display: '过滤规则',
                value: '',
                type: 'Input',
              }
            ]
          }
        },
        {
          id: 4,
          key: 'GIFT',
          name: '指定礼物',
          content: '礼物: {transfer:giftName}',
          data: {
            giftIds: []
          },
          template: {
            title: '礼物',
            rows: [
              {
                key: 'giftIds',
                display: '礼物',
                value: '',
                type: 'MultiSelect',
                options: giftOptions
              }
            ]
          }
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
          content: '仅银瓜子'
        },
        {
          id: 8,
          key: 'TEXT_REPLY',
          name: '弹幕回复',
          content: '弹幕回复'
        },
        {
          id: 9,
          key: 'SPEAK_REPLY',
          name: '语音播放',
          content: '语音播放',
          data: {
            voice: '',
            speed: 1.0
          },
          template: {
            title: '语音播放',
            rows: [
              {
                key: 'voice',
                display: '声音',
                value: '',
                type: 'Select',
                options: []
              },
              {
                key: 'speed',
                display: '语速',
                value: 0,
                type: 'InputNumber',
                step: 0.1,
                min: 0.1,
                max: 2.0
              }
            ]
          }
        },
      ],
    };
  },
  computed: {
    rules() {
      return this.$store.state.Config.autoReplyRules;
    }
  },
  async mounted() {
    const { data: voices } = await getVoices()
    const options = voices.map(voice => {
      return {
        key: voice,
        value: voice,
        label: voice,
      }
    })
    const voiceTag = this.tags.find(tag => tag.id === 9)
    // TODO
    voiceTag.template.rows[0].options = options

    const { data: giftConfig } = await getGiftConfig()
    // TODO
    const __giftOptions = []
    for (const key in giftConfig) {
      const { name, webp } = giftConfig[key]
      __giftOptions.push({
        key: key,
        value: name,
        label: name,
        webp: webp,
      })
    }
    const giftTag = this.tags.find(tag => tag.id === 4)
    // TODO
    giftTag.template.rows[0].options = __giftOptions
    giftOptions = __giftOptions
  },
  methods: {
    async onDrop(index, dropResult) {
      const { addedIndex, payload } = dropResult

      if (!Number.isFinite(addedIndex)) return
      const rules = cloneDeep(this.rules)
      rules[index].tags = rules[index].tags || []
      rules[index].tags.splice(addedIndex, 0, payload)
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    getTagPayload(index) {
      return this.tags[index]
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
          [next[0]]: value
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
      return roleKeys.map(key => roleOptions.find(o => o.key === key).value).join(',')
    },

    giftName(tag) {
      const giftIds = tag.data.giftIds
      // TODO giftOptions 加载顺序
      return giftIds.map(key => (giftOptions.find(o => o.key === key) || {}).value).join(',')
    },

    async removeTag(ruleIndex, tagIndex) {
      const rules = cloneDeep(this.rules)
      rules[ruleIndex].tags.splice(tagIndex, 1)
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async removeRule(ruleIndex) {
      const rules = cloneDeep(this.rules)
      rules.splice(ruleIndex, 1)
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async addRule() {
      const rules = cloneDeep(this.rules)
      const lastRule = rules.slice(-1)[0]
      rules.push({
        type: '',
        text: '',
        enable: true,
        priority: lastRule ? lastRule.priority + 1 : 0,
        tags: []
      })
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeEnable(index, status) {
      const rules = cloneDeep(this.rules)
      rules[index].enable = status
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)

    },

    async onChangeRuleType(index, type) {
      const rules = cloneDeep(this.rules)
      rules[index].type = type
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async onDataChange(ruleIndex, tagIndex, payload) {
      const rules = cloneDeep(this.rules)
      rules[ruleIndex].tags[tagIndex].data = rules[ruleIndex].tags[tagIndex].data || {}
      rules[ruleIndex].tags[tagIndex].data = Object.assign(rules[ruleIndex].tags[tagIndex].data, payload)
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    async changeText(ruleIndex, e) {
      const rules = cloneDeep(this.rules)
      rules[ruleIndex].text = e.target.value
      const data = {
        autoReplyRules: rules
      }
      await updateSetting(data)
      this.$store.dispatch("UPDATE_CONFIG", data)
    },

    shouldAcceptDrop(rule, sourceContainerOptions, payload) {
      if (!rule.type) {
        // this.$Message.warning('请先设置类型')
        return false
      }
      if (!dropAcceptRules[rule.type].includes(payload.key)) {
        // this.$Message.warning('该规则不适用于该类型')
        return false
      }
      if (rule.tags.find(tag => tag.key === payload.key)) {
        // this.$Message.warning('已存在相同规则')
        return false
      }
      return true
    },
  }
};
</script>

<style scoped>
.tag-container {
  /* border: 1px solid gray; */
  margin: 5px 0 3px 10px;
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
.rule-tag {
  border: 1px dashed cornflowerblue;
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

.drop-preview {
  border: 1px solid gray;
  width: 80px;
  height: 40px;
}
</style>
