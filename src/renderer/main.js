import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import global from './global'

const app = createApp(App)
  // .use(require('vue-electron'))
  .use(router)
  .use(store)
  .use(ViewUIPlus)

app.config.globalProperties.$global = global

app.mount('#app')
