<template>
  <div id="app">
    <Spin fix v-if="isLoading">
      <Icon type="ios-loading" size="18" class="demo-spin-icon-load"></Icon>
      <div>Loading</div>
    </Spin>
    <div id="main-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { pick } from 'lodash'
import { touch, registryClient, getClientConfig } from './service/api'
import { sse } from './service/sse-client'
import { wait } from './service/util'
import { useConfigStore } from './store'
import config from './service/config'

const store = useConfigStore()
const isLoading = ref(true)

onMounted(async () => {
  while (isLoading.value) {
    try {
      await touch()
      isLoading.value = false
    } catch (e) {
      /* retry */
    }
    await wait(500)
  }

  // 从主进程 electron-store 读取持久化的 clientId
  const storedClientId = await window.getClientId()

  // 向 bridge 后端注册，获取最终 clientId
  const { data: regData } = await registryClient({ clientId: storedClientId })
  const clientId = regData?.id || storedClientId

  // 如果 clientId 有更新，回写到主进程 electron-store
  if (clientId && clientId !== storedClientId) {
    await window.setClientId(clientId)
  }

  console.log('clientId: ' + clientId)

  config.id = clientId
  store.updateConfig({ id: clientId })

  // 从 bridge 后端拉取完整配置
  const { data: remoteConfig } = await getClientConfig(clientId)
  if (remoteConfig) {
    // 写入全局 config
    // Object.assign(config, pick(remoteConfig, Object.keys(config)))
    Object.assign(config, remoteConfig)

    // 需要 Pinia 持久化的字段同步到 store
    store.updateConfig(pick(remoteConfig, ['rooms']))
  }

  // bridge 就绪后建立全局 SSE 连接
  await sse.connect()
})

onBeforeUnmount(() => {
  sse.disconnect()
})
</script>

<style>
/** global */
body {
  margin: 0;
  overflow: hidden;
}

.drop-preview {
  border: 1px dashed gray;
  border-radius: 10px;
  margin: 0 3px 0px 8px;
  height: 25px;
  display: inline-block;
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;
}

.disable-user-select {
  -webkit-user-select: none;
  user-select: none;
}

.me-ml-2px {
  margin-left: 2px;
}

.me-mr-2px {
  margin-right: 2px;
}

.padding-left-2px {
  padding-left: 2px;
}

.margin-left-2px {
  margin-left: 2px;
}

.margin-left-5px {
  margin-left: 5px;
}

.margin-left-10px {
  margin-left: 10px;
}
</style>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

#main-container {
  flex: 1 1 auto;
  overflow: auto;
}
</style>
