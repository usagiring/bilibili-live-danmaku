import bridge from '@tokine/bilibili-bridge'
import store from '../renderer/store'
import { DEFAULT_SERVER_CONFIG } from './const'

const defaultOptions = {
  ...DEFAULT_SERVER_CONFIG,
  ...store.state.Config,
}

export function init (options) {
  bridge(Object.assign({}, defaultOptions, options))
}