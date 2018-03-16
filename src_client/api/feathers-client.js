import feathers from '@feathersjs/feathers'
import socketio from 'feathers-socketio'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import feathersVuex from 'feathers-vuex'
import store from '../store/'
import rx from 'feathers-reactive'

const socket = io('http://localhost:3030', {transports: ['websocket']})

const feathersClient = feathers()
  .configure(socketio(socket))
  .configure(auth({ storage: window.localStorage }))
  .configure(rx({idField: '_id'}))
  // .configure(feathersVuex(store, {
  //   idField: '_id',
  //   auth: {
  //     userService: '/users'
  //   }}))


feathersClient.service('/users')
feathersClient.service('/messages')
// feathersClient.service('/todos').vuex({idField: '_id'})
// feathersClient.service('/deeply/nested/names')
// feathersClient.service('/some/explicit/namespace').vuex({name: '/explicit/namespace'})

export default feathersClient
