const messages = require('./messages/messages.service.js');
const users = require('./users/users.service.js');
const devices = require('./devices/devices.service.js');
const events = require('./events/events.service.js');

module.exports = function (app) {
    app.configure(messages);
    app.configure(users);
    app.configure(devices);
    app.configure(events);
};
