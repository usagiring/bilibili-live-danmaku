import fs from 'fs'
import YAML from 'yaml'

const configRaw = fs.readFileSync(`config.yaml`, 'utf8')
const config = YAML.parse(configRaw)
export default config

export const port = config.port || 8081
export const baseUrl = `http://127.0.0.1:${port}`
// export const baseWsUrl = `ws://127.0.0.1:${port}` 
export const saveAllBiliMessage = config.save_all_bili_message || false