// Initializes the `messages` service on path `/messages`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./game.hooks');

module.exports = function(app) {
  MongoClient.connect(app.get('mongoUrl'), { useNewUrlParser: true }).then(client => {

    // Initialize our service with any options it requires
    app.use('/game', createService({
      Model: client.db('hqdb').collection('game')
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('game');

    service.hooks(hooks);
  });
};
