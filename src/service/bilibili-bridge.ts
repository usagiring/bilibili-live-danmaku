import bridge from '@tokine/bilibili-bridge'
import globalVar from './global'
import { port } from './config-loader'
import axios from 'axios'

/**
 * 启动 bilibili-bridge 服务
 * - 如果 config.yaml 定义了 port，优先使用配置的端口
 * - 否则在 30000～50000 中随机选择
 * - 端口被占用时自动重试，每次随机选新端口
 */
export async function start(maxRetries = 3): Promise<{ port: number }> {
  let currentPort: number = port || getRandomPort()

  for (let i = 0; i < maxRetries; i++) {
    try {
      await bridge(currentPort)
      console.log(`[Bridge] 服务已启动，端口: ${currentPort}`)

      globalVar.port = currentPort
      globalVar.baseUrl = `http://127.0.0.1:${currentPort}`

      return {
        port: currentPort,
      }
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Bridge] 端口 ${currentPort} 被占用，随机重试...`)
        // 清除 app 模块缓存，否则 retry 时不会重新执行 app.listen()
        const appCacheKey = require.resolve('@tokine/bilibili-bridge/dist/app')
        delete require.cache[appCacheKey]
        currentPort = getRandomPort()
      } else {
        throw err
      }
    }
  }

  throw new Error(`[Bridge] 重试 ${maxRetries} 次后仍无法启动服务`)
}


/**
 * 向 bridge 注册/获取 clientId
 * - 优先从本地持久化存储中读取已有 clientId
 * - 若没有则 bridge 会创建新的，并持久化到本地
 */
export async function registerClient(clientId?: string) {
  try {
    const { data } = await registryClient({ clientId })

    if (data?.id) {
      globalVar.clientId = data.id

      console.log(`[Bridge] clientId: ${globalVar.clientId} (已持久化)`)
    }
  } catch (err) {
    console.warn('[Bridge] client 注册失败:', err)
  }

  return {
    clientId: globalVar.clientId
  }
}



/**
 * 生成 30000～50000 之间的随机端口号
 */
function getRandomPort(): number {
  return Math.floor(Math.random() * 20001) + 30000
}

async function registryClient({ clientId }) {
  const res = await axios.post(`${globalVar.baseUrl}/api/client/register`, {
    clientId
  })
  return res.data
}
