import fs from 'fs'
import YAML from 'yaml'

const config = fs.readFileSync(`config.yaml`, 'utf8')
const OPTION_CONFIG = YAML.parse(config)

export const PORT = OPTION_CONFIG.PORT || 8081
export const BASE_URL = `http://127.0.0.1:${PORT}`
export const BASE_WS_URL = `ws://127.0.0.1:${PORT}`
export const SAVE_ALL_BILI_MESSAGE = OPTION_CONFIG.SAVE_ALL_BILI_MESSAGE || false
export const DANMAKU_RENDER_PATH = OPTION_CONFIG.DANMAKU_RENDER_PATH