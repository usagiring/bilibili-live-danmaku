import { set as _set } from 'lodash'
import { reactive } from 'vue'


const config = reactive({
  baseUrl: 'http://127.0.0.1:30031',

  set(path: string, value: any) {
    _set(this, path, value)
  }
})

export default config