import bridge from 'bilibili-bridge'
import store from '../renderer/store'
import { USER_DATA_PATH, PORT } from './const'

const options = {
  ...store.state.Config,
  USER_DATA_PATH,
  PORT: PORT,
}
console.log(options)
bridge(options)

export default bridge