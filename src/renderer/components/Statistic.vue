<template>
  <div :style="{ height: '100%' }">
    <div class="searcher-wrapper">
      <Input
        v-model="roomId"
        placeholder="房间号"
        clearable
        style="width: 150px"
        size="small"
      />
      <DatePicker
        type="datetimerange"
        format="yyyy-MM-dd HH:mm"
        placeholder="选择时间范围"
        style="width: 300px"
        size="small"
        :value="dateRange"
        @on-change="changeDateRange"
        @on-clear="clearDateRange"
      ></DatePicker>
      <Button
        type="primary"
        shape="circle"
        icon="ios-search"
        @click="searchAll"
      ></Button>
    </div>
    <div>
      获得收益
      互动人数
      弹幕总数
      发送弹幕最多的人
      赠送礼物最多的人
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>

<style scoped>
.searcher-wrapper {
  height: 35px;
  position: relative;
  padding: 1px 30px;
  border-bottom: 1px solid silver;
}
</style>
