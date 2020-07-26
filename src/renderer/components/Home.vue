<template>
  <div class="layout">
    <Layout :style="{minHeight: '100vh'}">
      <Sider collapsible :collapsed-width="78" v-model="isCollapsed">
        <Menu theme="dark" width="auto" :class="menuitemClasses">
          <MenuItem name="1-1" to="/setting">
            <Icon type="md-build" />
            <span v-if="!isCollapsed">设置</span>
          </MenuItem>
          <MenuItem name="1-2" to="/danmaku">
            <Icon type="md-chatboxes" />
            <span v-if="!isCollapsed">弹幕</span>
          </MenuItem>
        </Menu>
      </Sider>
      <Layout>
        <Header :style="{background: '#fff'}">
          <div>
            <span class="setting-key-text">连接直播间</span>
            <InputNumber
              v-model="roomId"
              placeholder="请输入房间号"
              size="small"
              :disabled="isConnected"
              style="width: 150px"
            />
            <i-switch v-model="isConnected" @on-change="connect" :disabled="!roomId" />
          </div>
        </Header>

        <Content>
          <!-- <Breadcrumb :style="{margin: '16px 0'}">
            <BreadcrumbItem>Home</BreadcrumbItem>
            <BreadcrumbItem>Components</BreadcrumbItem>
            <BreadcrumbItem>Layout</BreadcrumbItem>
          </Breadcrumb>-->
          <Card>
            <div style="height: 600px">
              <router-view></router-view>
            </div>
          </Card>
        </Content>
      </Layout>
    </Layout>
  </div>
</template>

<script>
import emitter, { init, close } from "../../service/bilibili-live-ws";
import Store from "electron-store";

// emitter.on("message", data => {
//   console.log(data);
// });

export default {
  data() {
    return {
      isCollapsed: false,
      roomId: null,
      isConnected: false,
    };
  },
  computed: {
    menuitemClasses: function () {
      return ["menu-item", this.isCollapsed ? "collapsed-menu" : ""];
    },
  },
  methods: {
    async connect(status) {
      if (status && this.roomId) {
        await init({ roomId: Number(this.roomId) });
        this.isConnected = status;
      } else {
        close();
      }
    },
  },
};
</script>

<style scoped>
.layout-con {
  height: 100%;
  width: 100%;
}
.menu-item span {
  display: inline-block;
  overflow: hidden;
  width: 69px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  transition: width 0.2s ease 0.2s;
}
.menu-item i {
  transform: translateX(0px);
  transition: font-size 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
  font-size: 16px;
}
.collapsed-menu span {
  width: 0px;
  transition: width 0.2s ease;
}
.collapsed-menu i {
  transform: translateX(5px);
  transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
  vertical-align: middle;
  font-size: 22px;
}
</style>
