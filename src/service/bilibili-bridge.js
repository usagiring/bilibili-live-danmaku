import bridge from '@tokine/bilibili-bridge'
import store from '../renderer/store'
import { DEFAULT_STYLE } from './const'

const defaultOptions = {
  ...DEFAULT_STYLE,
  ...store.state.Config,
}

export function init(options) {
  bridge(Object.assign({}, defaultOptions, options))
}