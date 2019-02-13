// Initializes the `users` service on path `/users`
const MongoClient = require('mongodb').MongoClient;
const createService = require('feathers-mongodb');
const hooks = require('./users.hooks');

module.exports = function (app) {

  MongoClient.connect('mongodb://localhost:27017/feathers', { useNewUrlParser: true }).then(client => {
    // Initialize our service with any options it requires
    app.use('/users', createService({
      Model: client.db('feathers').collection('users')
    }));

    // Get our initialized service so that we can register hooks and filters
    const service = app.service('users');

    service.hooks(hooks);
  });
};
