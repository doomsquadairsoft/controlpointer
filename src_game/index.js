
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');
const validUrl = require('valid-url');




const webServerAddress = process.env.D3VICE_WEBSERVER_ADDRESS
console.log(webServerAddress)

if (typeof webServerAddress === 'undefined')
    throw new Error('D3VICE_WEBSERVER_ADDRESS is undefined in environment!');


if (validUrl.isUri(webServerAddress)){
    console.log('Looks like a URI');
} else {
    throw new Error('D3VICE_WEBSERVER_ADDRESS is not a valid URL. '+
    'Example: http://game.doomsquadairsoft.com or http://192.168.1.112')
}


const socket = io(webServerAddress); // @TODO dynamically set this
const app = feathers();

// Set up Socket.io client with the socket
app.configure(socketio(socket));

// Receive real-time events through Socket.io
app.service('events')
    .on('created', evt => console.log('New event created', evt));

// Call the `messages` service
app.service('events').create({
    type: 'join',
    origin: 'worker'
});
