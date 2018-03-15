import Vue from 'vue'
import Vuex from 'vuex'
import feathersVuex from 'feathers-vuex'
import feathersClient from '../api/feathers-client'
import counter from './modules/counter'
import di from '../assets/futuristic_ammo_box_01.png'

const { service, auth } = feathersVuex(feathersClient, { idField: '_id' })

Vue.use(Vuex)


const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    plugins: [
        service('devices'),
        service('/v1/deviceList', {
            idField: '_id',
            nameStyle: 'path',
            namespace: 'custom-namespace',
            autoRemove: true,
            enableEvents: false
        }),
        service('things', {
            state: {
                count: 0,
                deviceList: [
                    { did: 'impactful-badger', controllingTeam: true, image: di },
                    { did: 'shameful-tortoise', controllingTeam: false, image: di },
                    { did: 'vertical-ramrod', controllingTeam: true, image: di },
                    { did: 'nonchalant-goose', controllingTeam: true, image: di },
                    { did: 'mutinous-mouse', controllingTeam: true },
                    { did: 'frightened-moat', controllingTeam: true }
                ]
            }
        }),
        auth()
    ],
    modules: {
        counter
    },

    strict: debug
})
