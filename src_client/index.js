import Vue from 'vue'
import router from './router'
import Controlpointer from './Controlpointer.vue'
import Vuetify from 'vuetify'
import store from './store'
import Vue2Leaflet from 'vue2-leaflet';
import './filters/formatDate'
import './api/feathers-client'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'



Vue.use(Vuetify)
Vue.config.productionTip = true;

Vue.component('v-map', Vue2Leaflet.Map);
Vue.component('v-tilelayer', Vue2Leaflet.TileLayer);
Vue.component('v-marker', Vue2Leaflet.Marker);


new Vue({
  el: '#controlpointer',
  router,
  render: h => h(Controlpointer),
  store
})
