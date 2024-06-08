import bridge from '@tokine/bilibili-bridge'
import store from '../renderer/store'
import { DEFAULT_STYLE } from './const'

const defaultOptions = {
  ...DEFAULT_STYLE,
  // @ts-ignore
  ...store.state.Config,
}

export default function init(options) {
  bridge(Object.assign({}, defaultOptions, options))
}