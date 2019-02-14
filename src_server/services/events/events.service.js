// Initializes the `messages` service on path `/messages`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./events.hooks');

module.exports = function (app) {
  MongoClient.connect(app.get('mongoUrl'), { useNewUrlParser: true }).then(client => {
    // Initialize our service with any options it requires
    app.use('/events', createService({
      Model: client.db('hqdb').collection('events')
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('events');

    service.hooks(hooks);
  })
};
