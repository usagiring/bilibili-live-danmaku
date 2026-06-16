import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'

const app = createApp(App)
  .use(router)
  .use(pinia)
  .use(ViewUIPlus)

app.mount('#app')
