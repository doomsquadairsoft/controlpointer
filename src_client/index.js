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


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});



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
