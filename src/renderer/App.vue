<template>
  <div id="app">
    <Spin
      fix
      v-if="isLoading">
      <Icon
        type="ios-loading"
        size="18"
        class="demo-spin-icon-load"></Icon>
      <div>Loading</div>
    </Spin>
    <div id="main-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import {
  touch,
  registryClient,
  getClientConfig,
  getRoomStatus,
  getRoomInfoByIds,
} from './service/api'
import { sse } from './service/sse-client'
import { useConfigStore } from './store'
import config from './service/config'
import { wait } from '@tokine/shared'

const store = useConfigStore()
const isLoading = ref(true)
const clientId = ref('')

onBeforeMount(async () => {
  let touching = true
  while (touching) {
    try {
      await touch()
      touching = false
    } catch (e) {
      /* retry */
      await wait(500)
    }
  }

  // 从主进程 electron-store 读取持久化的 clientId
  const storedClientId = await window.getClientId()

  // 向 bridge 后端注册，获取最终 clientId
  const { data: regData } = await registryClient({ clientId: storedClientId })
  clientId.value = regData?.id || storedClientId

  // 如果 clientId 有更新，回写到主进程 electron-store
  if (clientId.value && clientId.value !== storedClientId) {
    await window.setClientId(clientId.value)
  }
  console.log('clientId: ' + clientId.value)

  config.id = clientId.value
  store.id = clientId.value

  // 从 bridge 后端拉取完整配置
  const { data: remoteConfig } = await getClientConfig(clientId.value)

  // 写入全局 config
  // Object.assign(config, pick(remoteConfig, Object.keys(config)))
  Object.assign(config, remoteConfig)

  if (remoteConfig.rooms?.length) {
    // 需要 Pinia 持久化的字段同步到 store
    store.rooms = remoteConfig.rooms

    try {
      await setRoomIsConnected()
      await setRoomLiveStatus()
    } catch (e) {
      console.error(e)
    }
  }

  isLoading.value = false

  const baseUrl = await window.getBaseUrl()
  // bridge 就绪后建立全局 SSE 连接
  sse.connect(baseUrl, clientId.value)
})

async function setRoomIsConnected() {
  const roomIds = store.rooms.map(room => room.id)
  const { data } = await getRoomStatus({ roomIds, clientId: store.id })
  data.forEach(
    ({
      roomId,
      isConnected,
      isRecording,
    }: {
      roomId: string
      isConnected: boolean
      isRecording: boolean
    }) => {
      const room = store.rooms.find(room => room.id === roomId)
      if (!room) return
      room.isConnected = isConnected
      room.isRecording = isRecording
    },
  )
}

async function setRoomLiveStatus() {
  const roomIds = store.rooms.map(room => room.id)
  const { data } = await getRoomInfoByIds({ roomIds })
  const infos: any[] = Object.values(data)
  infos.forEach(({ roomid, live_status }: { roomid: string; live_status: number }) => {
    const room = store.rooms.find(room => room.id === roomid)
    if (!room) return
    room.liveStatus = live_status
  })
}

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
