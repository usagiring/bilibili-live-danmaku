<template>
  <div>
    <div>{{template.title}}</div>
    <template v-for="(row, index) in template.rows">
      <div :key="index">
        <div v-if="row.type==='InputNumber'">
          <span>{{row.key}}</span>
          <InputNumber :min="row.min || 0" :step="row.step || 1" :max="row.max || 100" :style="{ width: '55px' }" />
        </div>
        <div v-if="row.type==='Select'">
          <span>{{row.key}}</span>
          <Select :style="{ width: '100px', display: 'inline-block' }">
            <Option v-for="(option, index) in row.options" :value="option.key" :key="index" :label="option.label">
              <span>{{ option.value }}</span>
            </Option>
          </Select>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: [
    "template",
  ],
};
</script>

<style scoped>
.message-super-chat {
  border-radius: 10px;
  border: solid 0.5px rgba(66, 125, 158, 1);
  margin: 5px;
  overflow: hidden;
}
</style>
