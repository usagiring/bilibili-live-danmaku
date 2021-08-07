<template>
  <div>
    <div class="title">{{template.title}}</div>
    <template v-for="(row, index) in template.rows">
      <div :key="index" class="col-container">
        <div v-if="row.type==='InputNumber'">
          <span>{{row.display}}</span>
          <InputNumber :value="data[row.key]" :min="row.min || 0" :step="row.step || 1" :max="row.max || 100" :style="{ width: '55px' }" @on-change="onChangeValue(row.key, $event)" />
        </div>
        <div v-if="row.type==='Select'">
          <span>{{row.display}}</span>
          <Select :value="data[row.key]" :style="{ display: 'inline-block' }" @on-change="onChangeValue(row.key, $event)">
            <Option v-for="(option, index) in row.options" :value="option.key" :key="index" :label="option.label">
              <span>{{ option.value }}</span>
            </Option>
          </Select>
        </div>
        <div v-if="row.type === 'MultiSelect'">
          <Select multiple :value="data[row.key]" :style="{ display: 'inline-block' }" @on-change="onChangeValue(row.key, $event)">
            <Option v-for="(option, index) in row.options" :value="option.key" :key="index" :label="option.label">
              <span>{{ option.value }}</span>
            </Option>
          </Select>
        </div>
        <div v-if="row.type === 'Input'">
          <span>{{row.display}}</span>
          <Input :value="data[row.key]" @on-change="onChangeInputValue(row.key, $event)" :style="{width: '200px'}"/>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: [
    'template',
    'data'
  ],
  methods: {
    onChangeValue(key, value) {
      this.$emit('value-change', {
        [key]: value
      })
    },

    onChangeInputValue(key, e) {
      this.$emit('value-change', {
        [key]: e.target.value
      })
    }
  }
};
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  border: solid 0.5px rgba(66, 125, 158, 1);
  margin: 5px;
  overflow: hidden;
}
.title {
  text-align: center;
  padding: 5px;
}
.col-container {
  margin-bottom: 10px;
}
</style>
