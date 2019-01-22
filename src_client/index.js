import Vue from 'vue'
import Vuetify from 'vuetify'
import router from './router'
import Controlpointer from './Controlpointer.vue'
import store from './store'
import Vue2Leaflet from 'vue2-leaflet';
import './filters/formatDate'
import './api/feathers-client'
//import 'vuetify/src/stylus/app.styl'
import 'material-design-icons-iconfont/dist/material-design-icons.css' // this needs to be imported BEFORE vuetify css
import 'vuetify/dist/vuetify.min.css' // this needs to be imported AFTER material design icons
import gameStats from '@/../src_shared/gameStats'
import Vs from 'd3-vs';
import Vuelidate from 'vuelidate'


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: require('@/assets/marker_UNK_s.png'),
  shadowUrl: require('@/assets/marker_shadow.png'),
});

Vue.use(gameStats);
Vue.use(Vuetify);
Vue.use(Vs);
Vue.use(Vuelidate);

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
