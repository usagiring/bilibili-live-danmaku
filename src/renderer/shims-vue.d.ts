import type globalVar from '../service/global'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $global: typeof globalVar
  }
}
