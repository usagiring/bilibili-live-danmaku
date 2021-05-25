import path from 'path'
import bridge from 'bilibili-bridge'
import store from '../renderer/store'
import { USER_DATA_PATH, PORT } from './const'

const options = {
  ...store.state.Config,
  USER_DATA_PATH,
  PORT: PORT,
  HTML_PATH: path.join(__dirname, '../../../bilibili-danmaku-page/dist')
}
console.log(options)
bridge(options)

export default bridge