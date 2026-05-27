import { createApp } from 'vue'
import App from './App.vue'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'

// Vue.use(ViewUI);
// Vue.config.productionTip = false

createApp(App)
  .use(ViewUIPlus)
  .mount('#app')
