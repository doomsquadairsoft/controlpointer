import Vue from 'vue'
import Vuex from 'vuex'
import feathersVuex from 'feathers-vuex'
import feathersClient from '../api/feathers-client'
import counter from './modules/counter'
import mapCenter from './modules/mapCenter'
import di from '../assets/futuristic_ammo_box_01.png'
//import logger from './plugins/logger'
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

//const { service, auth } = feathersVuex(feathersClient, { idField: '_id' })
const { service } = feathersVuex(feathersClient, { idField: '_id' })

Vue.use(Vuex)


const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    plugins: [
        service('devices', {
            idField: '_id'
        }),
        service('messages'),
        //auth()
        //logger()
    ],
    modules: {
        counter,
        mapCenter
    },

    strict: debug
})
