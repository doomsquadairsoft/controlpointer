const messages = require('./messages/messages.service.js');
const users = require('./users/users.service.js');
const devices = require('./devices/devices.service.js');
const events = require('./events/events.service.js');
const pendingDevices = require('./pendingDevices/pendingDevices.service.js');
const game = require('./game/game.service.js');

module.exports = function (app) {
    app.configure(messages);
    app.configure(users);
    app.configure(devices);
    app.configure(pendingDevices);
    app.configure(events);
    app.configure(game);
};
