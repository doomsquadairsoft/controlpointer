// Initializes the `messages` service on path `/messages`
const createService = require('feathers-nedb');
const createModel = require('../../models/devices.model');
const hooks = require('./devices.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  //const paginate = app.get('paginate');

  const options = {
    name: 'devices',
    Model,
    //paginate
  };

  // Initialize our service with any options it requires
  app.use('/devices', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('devices');

  service.hooks(hooks);
};
