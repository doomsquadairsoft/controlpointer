import Vue from 'vue'
import router from './router'
import Controlpointer from './Controlpointer.vue'
import Vuetify from 'vuetify'
import store from './store'
import './api/feathers-client'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'


Vue.use(Vuetify)
Vue.config.productionTip = true;


new Vue({
  el: '#controlpointer',
  router,
  render: h => h(Controlpointer),
  store
})
