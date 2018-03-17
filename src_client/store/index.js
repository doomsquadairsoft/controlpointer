import Vue from 'vue'
import Vuex from 'vuex'
import feathersVuex from 'feathers-vuex'
import feathersClient from '../api/feathers-client'
import counter from './modules/counter'
import di from '../assets/futuristic_ammo_box_01.png'

//const { service, auth } = feathersVuex(feathersClient, { idField: '_id' })
const { service } = feathersVuex(feathersClient, { idField: '_id' })

Vue.use(Vuex)


const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    plugins: [
        service('devices'),
        service('things', {
            state: {
                count: 0,
                deviceList: [
                    { did: 'impactful-badger', controllingTeam: true, image: di }
                ]
            }
        }),
        service('messages'),
        //auth()
    ],
    modules: {
        counter
    },

    strict: debug
})
