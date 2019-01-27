import Vue from 'vue';
import Vuex from 'vuex';
import feathersVuex from 'feathers-vuex';
import feathersClient from '../api/feathers-client';
import counter from './modules/counter';
import map from './modules/map';
import settings from './modules/settings';
import gameLog from './modules/gameLog';
import game from './modules/game';
//import device from './modules/device'
//import logger from './plugins/logger'

//const { service, auth } = feathersVuex(feathersClient, { idField: '_id' })
const { service, FeathersVuex } = feathersVuex(feathersClient, { idField: '_id' });

Vue.use(Vuex);
Vue.use(FeathersVuex);

const debug = process.env.NODE_ENV !== 'production';



export default new Vuex.Store({
    plugins: [
        service('devices', {
            idField: '_id',
            replaceItems: true, 
        }),
        service('messages'),
        service('pdevices'),
        service('game', {
            idField: '_id'
        }),
        service('timeline', {
            idField: '_id'
        }),
        service('metadata', {
            idField: '_id'
        }),
        //auth()
        //logger()
    ],
    modules: {
        counter,
        map,
        settings,
        gameLog,
        game,
    },
    strict: true
})
