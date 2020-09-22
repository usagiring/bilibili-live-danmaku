<template>
  <div>
    <Row>
      <i-col span="6">
        <Input v-model="keyWords" type="textarea" :rows="4" placeholder="Enter something..." />
      </i-col>
      <i-col span="3">
        <Button>
          开始统计
        </Button>
      </i-col>
      <i-col span="15">
        <ButtonGroup size="default">
          <Button>
            <Icon type="md-podium" />
          </Button>
          <Button>
            <Icon type="md-pie" />
          </Button>
        </ButtonGroup>
      </i-col>
    </Row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyWords: "",
    };
  },
};
</script>

<style scoped>
</style>
