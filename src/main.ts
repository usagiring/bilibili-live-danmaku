import { createApp } from 'vue'
import App from './renderer/App.vue'
import router from './renderer/router'
import store from './renderer/store'
import ViewUIPlus from 'view-ui-plus'
// import './styles/index.less'
import 'view-ui-plus/dist/styles/viewuiplus.css'
// import './samples/node-api'

createApp(App)
  .use(router)
  .use(store)
  .use(ViewUIPlus)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
