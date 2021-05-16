import bridge from 'bilibili-bridge'
import store from '../renderer/store'
import { USER_DATA_PATH } from './const'

const options = {
  ...store.state.Config,
  USER_DATA_PATH,
  PORT: 3000,
}
console.log(options)
bridge(options)

export default bridge