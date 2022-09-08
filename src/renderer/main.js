// import Vue from 'vue'
import { createApp } from 'vue'
// import axios from 'axios'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
// import global from './global'

// Vue.prototype.$global = global

// import animate from 'animate.css'

// Vue.use(animate)


createApp(App)
  // .use(require('vue-electron'))
  .use(router)
  .use(store)
  .use(ViewUIPlus)
  .mount('#app')

// Vue.use(ViewUI);

// if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// Vue.http = Vue.prototype.$http = axios
// Vue.config.productionTip = false

/* eslint-disable no-new */
// new Vue({
//   components: { App },
//   router,
//   store,
//   template: '<App/>'
// }).$mount('#app')
