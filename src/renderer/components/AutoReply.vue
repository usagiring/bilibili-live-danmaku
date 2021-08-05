<template>
  <div>
    <div class="tag-container">
      <Container group-name="1" @drop="onDrop" orientation="horizontal" behaviour="contain">
        <Draggable v-for="tag in tags" :key="tag.id">
          <div class="draggable-tag">
            {{tag.name}}
          </div>
        </Draggable>
      </Container>
    </div>
    <template v-for="(rule, index) in rules">
      <Row :key="index">
        <i-col span="1">
          <Checkbox v-model="rule.enable"></Checkbox>
        </i-col>
        <i-col span="2">
          <Select :style="{display: 'inline-block' }">
            <Option v-for="(option, index) in types" :value="option.key" :key="index" :label="option.label">
              <span>{{ option.value }}</span>
            </Option>
          </Select>
        </i-col>
        <i-col span="7">
          <Input v-model="rule.text" placeholder="回复内容..." :style="{display: 'inline-block'}" />
        </i-col>
        <i-col span="12">
          <Container group-name="1" @drop="onDrop" orientation="horizontal" behaviour="contain">
            <template v-for="tag in rule.tags">
              <Draggable class="draggable-tag" :key="tag.id">
                <Poptip placement="bottom">
                  <span>{{tag.name}}</span>
                  <div class="" slot="content">
                    <TagContent :template="tag.template" />
                  </div>
                </Poptip>
                <Icon type="md-close" class="remove-rule" />
              </Draggable>
            </template>
          </Container>
        </i-col>
        <i-col span="1">
          <span>{{rule.priority}}</span>
        </i-col>
        <i-col span="1">
          <Icon type="md-close" class="remove-rule" />
        </i-col>
      </Row>
    </template>
  </div>
</template>

<script>
import { Container, Draggable } from "vue-smooth-dnd";
import TagContent from './TagContent.vue'
import { getVoices, speak as speakAPI } from '../../service/api'

export default {
  name: "Simple",
  components: { Container, Draggable, TagContent },
  data() {
    return {
      types: [
        {
          key: 'COMMENT',
          label: 'COMMENT',
          value: '弹幕',
        }
      ],
      tags: [
        {
          id: '1',
          name: '等级',
          content: '等级 > {level}',
          template: {
            title: '等级限制',
            rows: [
              {
                key: '等级',
                value: 1,
                type: 'InputNumber',
                step: 1,
                min: 1,
                max: 40
              }
            ]
          }
        },
        {
          id: 2,
          name: '舰长'
        },
        {
          id: 3,
          name: '关键字过滤'
        },
        {
          id: 4,
          name: '指定礼物'
        },
        {
          id: 5,
          name: '粉丝牌'
        },
        {
          id: 6,
          name: '仅金瓜子'
        },
        {
          id: 7,
          name: '仅银瓜子'
        },
        {
          id: 8,
          name: '弹幕回复'
        },
        {
          id: 9,
          name: '语音播放',
          content: '',
          template: {
            title: '语音播放',
            rows: [
              {
                key: '声音',
                value: '',
                type: 'Select',
                options: []
              },
              {
                key: '语速',
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
      rules: [
        {
          type: 'COMMENT',
          text: '',
          enable: true,
          priority: 1,
          tags: [
            {
              id: '1',
              name: '等级',
              content: '等级 > {level}',
              template: {
                title: '等级限制',
                rows: [
                  {
                    key: '等级',
                    value: 1,
                    type: 'InputNumber',
                    step: 1,
                    min: 1,
                    max: 40
                  }
                ]
              }
            },
            {
              id: 9,
              name: '语音播放',
              content: '',
              template: {
                title: '语音播放',
                rows: [
                  {
                    key: '声音',
                    value: '',
                    type: 'Select',
                    options: []
                  },
                  {
                    key: '语速',
                    value: 0,
                    type: 'InputNumber',
                    step: 0.1,
                    min: 0.1,
                    max: 2.0
                  }
                ]
              }
            },
          ]
        },


        {
          type: 'COMMENT',
          text: '',
          enable: true,
          priority: 1,
          tags: [
            {
              id: '1',
              name: '等级',
              content: '等级 > {level}',
              template: {
                title: '等级限制',
                rows: [
                  {
                    key: '等级',
                    value: 1,
                    type: 'InputNumber',
                    step: 1,
                    min: 1,
                    max: 40
                  }
                ]
              }
            },
            {
              id: 9,
              name: '语音播放',
              content: '',
              template: {
                title: '语音播放',
                rows: [
                  {
                    key: '声音',
                    value: '',
                    type: 'Select',
                    options: []
                  },
                  {
                    key: '语速',
                    value: 0,
                    type: 'InputNumber',
                    step: 0.1,
                    min: 0.1,
                    max: 2.0
                  }
                ]
              }
            },
          ]
        }
      ]
    };
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
    const tag = this.tags.find(tag => tag.id === 9)
    // TODO
    tag.template.rows[0].options = options
    console.log(options)
  },
  methods: {
    onDrop(dropResult) {
      console.log(dropResult)
    }
  }
};
</script>

<style scoped>
.tag-container {
  border: 1px solid gray;
}
.draggable-tag {
  border: 1px solid silver;
  padding: 3px 6px;
  margin: 3px;
  display: inline-block;
}
.remove-rule {
  font-size: 16px;
  color: crimson;
}
</style>
