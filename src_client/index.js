import Vue from 'vue'
import Vuetify from 'vuetify'
import router from './router'
import Controlpointer from './Controlpointer.vue'
import store from './store'
import { L, LMap, LTileLayer, LMarker, LControl, LTooltip, LPopup } from 'vue2-leaflet';
import 'leaflet/dist/leaflet.css';
import './filters/formatDate'
import './api/feathers-client'
//import 'vuetify/src/stylus/app.styl'
import 'material-design-icons-iconfont/dist/material-design-icons.css' // this needs to be imported BEFORE vuetify css
import 'vuetify/dist/vuetify.min.css' // this needs to be imported AFTER material design icons
import gameStats from '@/../src_shared/gameStats'
// import Vs from 'd3-vs';
import Vuelidate from 'vuelidate'
import VueQrcode from '@chenfengyuan/vue-qrcode';

Vue.use(gameStats);
Vue.use(Vuetify);
// Vue.use(Vs);
Vue.use(Vuelidate);

Vue.config.productionTip = true;

Vue.component('l-map', LMap);
Vue.component('l-tilelayer', LTileLayer);
Vue.component('l-marker', LMarker);
Vue.component('l-control', LControl);
Vue.component('l-tooltip', LTooltip);
Vue.component('l-popup', LPopup);
Vue.component(VueQrcode.name, VueQrcode);


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

new Vue({
  el: '#controlpointer',
  router,
  render: h => h(Controlpointer),
  store
})
