import fs from 'fs'
import YAML from 'yaml'

const configRaw = fs.readFileSync(`config.yaml`, 'utf8')
const config = YAML.parse(configRaw)
export default config

export const port = config.port
export const saveAllBiliMessage = config.save_all_bili_message || false