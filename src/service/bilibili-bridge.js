import bridge from '@tokine/bilibili-bridge'
import store from '../renderer/store'
import { DEFAULT_SERVER_CONFIG } from './const'

const options = {
  ...DEFAULT_SERVER_CONFIG,
  ...store.state.Config,
}

// delete options.userCookie
bridge(options)

export default bridge