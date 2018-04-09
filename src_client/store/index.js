import Vue from 'vue'
import Vuex from 'vuex'
import feathersVuex from 'feathers-vuex'
import feathersClient from '../api/feathers-client'
import counter from './modules/counter'
import map from './modules/map'
//import logger from './plugins/logger'

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
        map
    },

    strict: debug
})
