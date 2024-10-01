<template>
  <div class="disable-user-select">
    <div :style="{ padding: '10px 20px 0 20px' }">
      <Alert type="info">
        <Icon type="md-information-circle" :style="{ 'font-size': '16px' }" />
        <span> 未设置Cookie时，弹幕回复不生效 </span>
      </Alert>
    </div>

    <div :style="{ padding: '0 20px 0 20px' }">
      <div class="tag-container">
        <Container :get-child-payload="getTagPayload" group-name="tag-container" orientation="horizontal" behaviour="copy">
          <Draggable v-for="tag in tags" :key="tag.id">
            <div :class="tag.class ? `draggable-tag ${tag.class}` : 'draggable-tag'">
              {{ tag.name }}
            </div>
          </Draggable>
        </Container>
      </div>
    </div>

    <Row :style="{ padding: '10px 10px 5px 10px' }">
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
                <p>● 匹配<span :style="{ color: 'pink' }">优先级</span>从上到下逐渐降低，当高优先级规则匹配通过，低优先级不再触发。</p>
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
    <Container
      :get-child-payload="getRulePayload"
      :should-accept-drop="(src, payload) => shouldRuleAcceptDrop({ src, payload, groupName: 'rule' })"
      group-name="rule-container"
      drag-handle-selector=".column-drag-handler"
      @drop="onDropRule"
    >
      <Draggable v-for="(rule, index) in rules" :key="index">
        <!-- <Draggable> -->
        <Row class="line-container">
          <i-col span="1">
            <!-- <span class="column-drag-handler">&#x2630;</span> -->
            <!-- <Icon class="flex-center column-drag-handler" type="ios-move" /> -->
            <span class="flex-center column-drag-handler">&#x2630;</span>
          </i-col>
          <i-col span="1" :style="{ 'text-align': 'center' }">
            <Checkbox :model-value="rule.enable" class="flex-center" :style="{ 'margin-left': '8px' }" @on-change="changeEnable(index, $event)" />
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
              :style="{ display: 'flex', 'align-items': 'center' }"
              :drop-placeholder="dropPlaceholderOptions"
              :should-accept-drop="(src, payload) => shouldTagAcceptDrop({ src, payload, index, groupName: 'tag' })"
              group-name="tag-container"
              orientation="horizontal"
              @drop="onDropTag(index, $event)"
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
                  <Icon type="md-remove" class="remove-button" @click="removeTag(index, tagIndex)" />
                </div>
              </template>
            </Container>
          </i-col>
          <i-col span="1" class="remove-button-container">
            <Icon type="md-remove" class="remove-button flex-center" @click="removeRule(index)" />
          </i-col>
        </Row>
      </Draggable>
      <!-- </template> -->
    </Container>
    <div :style="{ padding: '5px 20px' }">
      <Button type="primary" long @click="addRule">
        <Icon :style="{ 'font-weight': 'bold' }" type="md-add" />
      </Button>
    </div>
  </div>
</template>

<script setup>
import { cloneDeep, debounce } from 'lodash'
import { toRaw, toRefs, computed, reactive, inject } from 'vue'
import { useStore } from 'vuex'
const globalValue = inject('globalValue')

import { Container, Draggable } from 'vue3-smooth-dnd'
import TagContent from './TagContent.vue'
import { updateSetting, getGiftConfig } from '../../service/api'

const synth = window.speechSynthesis

const store = useStore()

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

const dropPlaceholderOptions = reactive({
  className: 'drop-preview',
  animationDuration: '150',
})
const giftOptions = reactive([])
const types = reactive([
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
])
const tags = reactive([
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
    content: '文本匹配: {filter}',
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
    content: '指定礼物: {transfer:giftName}',
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
          options: giftOptions,
        },
      ],
    },
  },
  {
    id: 5,
    key: 'MEDAL',
    name: '佩戴粉丝牌',
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
          value: '默认要求Cookie用户是当前直播间主播，如果需要使用其他Cookie用户回复，请打开下面开关',
        },
        {
          type: 'Checkbox',
          display: '允许任意用户回复',
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
])

const realRoomId = computed(() => {
  return store.state.Config.realRoomId
})

const rules = computed(() => {
  return store.state.Config.autoReplyRules
})

const debouncedChangeText = debounce(changeText, 500)

// function onMounted() {
//   debouncedChangeText = debounce(changeText, 500)
// }

async function onDropTag(index, dropResult) {
  let { addedIndex, payload } = dropResult
  const tag = toRaw(payload.tag)
  if (!Number.isFinite(addedIndex)) return
  const _rules = cloneDeep(rules.value)
  if (tag.key === 'SPEAK_REPLY') {
    const options =
      globalValue?.voices?.map((voice) => {
        return {
          key: voice.name,
          value: voice.name,
          label: voice.name,
        }
      }) || []
      tag.template.rows[0].options = options
  }

  if (tag.key === 'GIFT') {
    const { data: giftConfig } = await getGiftConfig(realRoomId.value)
    const giftOptions = []
    for (const [key, { name, webp }] of Object.entries(giftConfig)) {
      giftOptions.push({
        key: key,
        value: name,
        label: name,
        webp: webp,
      })
    }
    tag.template.rows[0].options = giftOptions
  }
  _rules[index].tags = _rules[index].tags || []
  _rules[index].tags.splice(addedIndex, 0, tag)

  const data = {
    autoReplyRules: _rules,
  }
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function onDropRule(dropResult) {
  const { removedIndex, addedIndex, payload } = dropResult
  const _rules = cloneDeep(rules.value)
  let itemToAdd = payload.rule
  if (Number.isFinite(removedIndex)) {
    itemToAdd = _rules.splice(removedIndex, 1)[0]
  }

  if (Number.isFinite(addedIndex)) {
    _rules.splice(addedIndex, 0, itemToAdd)
  }
  // rules.forEach((rule, index) => {
  //   rule.priority = index
  // })

  const data = {
    autoReplyRules: _rules,
  }
  console.log(data)
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function getTagPayload(index) {
  return {
    groupName: 'tag',
    tag: tags[index],
  }
}
function getRulePayload(index) {
  return {
    groupName: 'rule',
    rule: rules.value[index],
  }
}
function fillDisplay(tag) {
  let display = tag.content
  const match = tag.content.matchAll(/{.*}/g)
  const map = Array.from(match).reduce((map, next) => {
    const substr = next[0].substring(1, next[0].length - 1)
    let value = tag.data[substr]
    if (~substr.indexOf('transfer')) {
      const [, func] = substr.split(':')
      console.log(func, tag)
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
}

function roleNames(tag) {
  const roleKeys = tag.data.roles
  return roleKeys.map((key) => roleOptions.find((o) => o.key === key).value).join(',')
}

function giftName(tag) {
  const giftIds = tag.data.giftIds
  return giftIds.map((key) => (tag?.template?.rows?.[0]?.options?.find((o) => o.key === key) || {}).value).join(',')
}

function removeTag(ruleIndex, tagIndex) {
  const _rules = cloneDeep(rules.value)
  _rules[ruleIndex].tags.splice(tagIndex, 1)
  const data = {
    autoReplyRules: _rules,
  }
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function removeRule(ruleIndex) {
  const _rules = cloneDeep(rules.value)
  _rules.splice(ruleIndex, 1)
  const data = {
    autoReplyRules: _rules,
  }
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function addRule() {
  const _rules = cloneDeep(rules.value)
  // const lastRule = rules.slice(-1)[0]
  _rules.push({
    type: '',
    text: '',
    enable: true,
    // priority: lastRule ? lastRule.priority + 1 : 0,
    tags: [],
  })
  const data = {
    autoReplyRules: _rules,
  }
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function changeEnable(index, status) {
  const _rules = cloneDeep(rules.value)
  _rules[index].enable = status
  const data = {
    autoReplyRules: _rules,
  }
  console.log(data)
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function onChangeRuleType(index, type) {
  const _rules = cloneDeep(rules.value)
  _rules[index].type = type
  const data = {
    autoReplyRules: _rules,
  }
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

// tag 里发出的数据变更事件
function onDataChange(ruleIndex, tagIndex, payload) {
  const _rules = cloneDeep(rules.value)
  _rules[ruleIndex].tags[tagIndex].data = _rules[ruleIndex].tags[tagIndex].data || {}
  _rules[ruleIndex].tags[tagIndex].data = Object.assign(_rules[ruleIndex].tags[tagIndex].data, payload)

  const data = {
    autoReplyRules: _rules,
  }
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function changeText(ruleIndex, e) {
  const _rules = cloneDeep(rules.value)
  _rules[ruleIndex].text = e.target.value
  const data = {
    autoReplyRules: _rules,
  }
  updateSetting(data)
  store.dispatch('UPDATE_CONFIG', data)
}

function shouldTagAcceptDrop({ src, payload, index, groupName }) {
  if (groupName !== payload.groupName) return false
  const tag = payload.tag
  const dropRule = rules.value[index]

  if (!dropRule?.type) {
    // $Message.warning('请先设置类型')
    return false
  }
  if (!dropAcceptRules[dropRule.type].includes(tag.key)) {
    // $Message.warning('该规则不适用于该类型')
    return false
  }
  if (dropRule.tags.find((__tag) => __tag.key === tag.key)) {
    // $Message.warning('已存在相同规则')
    return false
  }
  return true
}

function shouldRuleAcceptDrop({ src, payload, groupName }) {
  if (groupName !== payload.groupName) return false
  return true
}
</script>

<style scoped>
.tag-container {
  padding: 5px 10px 5px 10px;
  border: 1px dashed silver;
  border-radius: 10px;
}
.draggable-tag {
  border: 1px solid violet;
  border-radius: 10px;
  padding: 3px 10px;
  margin: 6px;
  display: inline-block;
  -webkit-user-select: none;
  user-select: none;
  cursor: move;
}
.process-tag {
  border: 1px solid green !important;
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
.remove-button {
  font-size: 16px;
  color: crimson;
  cursor: pointer;
  height: 100%;
}
.col-header {
  text-align: center;
}
.column-drag-handler {
  cursor: move;
}
.info-icon {
  font-size: 16px;
}
.remove-button-container {
  cursor: pointer;
  height: 100%;
}
.remove-button-container:hover {
  border: 1px dashed crimson;
  border-radius: 20px;
}
.line-container {
  padding: 5px 10px 5px 10px;
  height: 40px;
  align-items: center;
  justify-content: center;
  display: flex;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
