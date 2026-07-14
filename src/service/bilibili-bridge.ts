import bridge from '@tokine/bilibili-bridge'
import globalVar from './global'

/**
 * 启动 bilibili-bridge 服务
 * - 如果 config.yaml 定义了 port，优先使用配置的端口
 * - 否则在 30000～50000 中随机选择
 * - 端口被占用时自动重试，每次随机选新端口
 */
export async function start(maxRetries = 3): Promise<{ port: number }> {
  let currentPort: number = getRandomPort()

  for (let i = 0; i < maxRetries; i++) {
    try {
      await bridge({ port: currentPort })
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
 * 生成 30000～50000 之间的随机端口号
 */
function getRandomPort(): number {
  return Math.floor(Math.random() * 20001) + 30000
}
