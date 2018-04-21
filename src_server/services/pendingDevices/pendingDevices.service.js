// Initializes the `messages` service on path `/messages`
const createService = require('feathers-nedb');
const createModel = require('../../models/pendingDevices.model');
const hooks = require('./pendingDevices.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  //const paginate = app.get('paginate');

  const options = {
    name: 'pdevices',
    Model,
    //paginate
  };

  // Initialize our service with any options it requires
  app.use('/pdevices', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('pdevices');

  service.hooks(hooks);
};
