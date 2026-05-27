import bridge from '@tokine/bilibili-bridge'
import { useConfigStore } from '../renderer/store'
import { DEFAULT_STYLE } from './const'

export default function init(options) {
  const configStore = useConfigStore()
  const defaultOptions = {
    ...DEFAULT_STYLE,
    ...configStore.$state,
  }
  bridge(Object.assign({}, defaultOptions, options))
}