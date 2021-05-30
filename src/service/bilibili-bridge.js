import bridge from '@tokine/bilibili-bridge'
import store from '../renderer/store'
import { USER_DATA_PATH, PORT, EXAMPLE_MESSAGES, DEFAULT_SERVER_CONFIG } from './const'

const options = {
  ...DEFAULT_SERVER_CONFIG,
  ...store.state.Config,
}
bridge(options)

export default bridge