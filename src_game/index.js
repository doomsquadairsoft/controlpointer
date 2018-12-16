
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');
const validUrl = require('valid-url');
const _ = require('lodash');
const config = require('config');


const workerName = 'game_worker'; // name that this worker client reports as.

const apiServerSchema = `${process.env.NODE_ENV === 'production' ? 'https://' : 'http://'}`;
const apiServerHost = config.get('host');
const apiServerPort = config.get('port');
const apiServerUri = `${apiServerSchema}${apiServerHost}:${apiServerPort}`;
const marshal = require('./marshal');

if (validUrl.isUri(apiServerUri)){
    console.log(`API server address ${apiServerUri} looks valid.`);
} else {
    throw new Error('API server is not a valid URL. '+
    'Example: http://game.doomsquadairsoft.com or http://192.168.1.112:3030')
}


const socket = io(apiServerUri);
const app = feathers();

// Set up Socket.io client with the socket
app.configure(socketio(socket));

const evts = app.service('events');
const devices = app.service('devices');
const pendingDevices = app.service('pdevices');




// Submit a join event when we start up
evts.create({
  type: 'join',
  device: workerName
});


// Every 1 second, calculate controlpoints
setInterval(marshal.tick, 1000);


// When there is a join event, do something about it
evts.on('created', (evt) => {
  const d = evt.device || '';

  if (d.substr(d.length - 7) !== '_worker') {

    if (evt.type === 'join') {

      devices.find().then((m) => {


        // If device is already activated, send them their orders
        const match = _.find(m, (o) => {
          return (o.did === d)
        });
        if (typeof match !== 'undefined') {
          // the joining device is already in the list.
          // the joining device may have rebooted or lost it's memory.
          // send this device it's orders.
          console.log('  >> Joined d3vice is already active\n  >> sending orders to d3vice');
          evts.create({
            type: 'order',
            device: d,
            order: 'DCXGA0' // start game 0
          })
        }


        // device is not activated by admin yet.
        // make it pending
        else {
          console.log('  >> Joined device is not activated yet. Marking as pending.');
          evts.create({
            type: 'order',
            device: d,
            order: 'DCXSBY' // Device Controlpoint Xbee Standby
          })

          createPendingDevice(d).catch((e) => {
            console.log('err occured while adding pendingDevice');
            console.log(e);
          })
        }
      })
    }
  }
});


/**
 * createPendingDevice
 *
 * Create a pending device, only if it doesn't already exist.
 *
 * @param {string} d - Device ID
 */
function createPendingDevice(d) {
  console.log(`  >> creating pending device ${d}`);
  return pendingDevices.find().then((pdvs) => {
    const match = _.find(pdvs, (o) => {
      return (o.did === d)
    });
    if (typeof match === 'undefined') {
      pendingDevices.create({
        did: d
      })
    }
  })
}

// Detect Ctrl+C, and create event when that happens
process.on('SIGINT', function() {
    console.log("Caught interrupt signal. Exiting...");

    evts.create({
        type: 'part',
        device: workerName
    }).then(function() {
        process.exit();
    })
});
