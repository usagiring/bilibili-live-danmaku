import bridge from '@tokine/bilibili-bridge'
import { DEFAULT_STYLE } from './const'

export default function init(options) {
  bridge(Object.assign({}, DEFAULT_STYLE, options))
}