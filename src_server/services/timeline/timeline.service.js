// Initializes the `messages` service on path `/messages`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./timeline.hooks');

module.exports = function (app) {

  MongoClient.connect(app.get('mongoUrl'), { useNewUrlParser: true }).then(client => {

    // Initialize our service with any options it requires
    app.use('/timeline', createService({
      Model: client.db('hqdb').collection('timeline')
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('timeline');

    service.hooks(hooks);
  });

};
