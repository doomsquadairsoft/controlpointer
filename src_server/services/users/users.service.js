// Initializes the `users` service on path `/users`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./users.hooks');

module.exports = function (app) {

  MongoClient.connect(app.get('mongoUrl'), { useNewUrlParser: true }).then(client => {
    // Initialize our service with any options it requires
    app.use('/users', createService({
      Model: client.db('hqdb').collection('users')
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('users');

    service.hooks(hooks);
  });
};
