// Initializes the `messages` service on path `/messages`
const createService = require('feathers-nedb');
const createModel = require('../../models/metadata.model');
const hooks = require('./metadata.hooks');

module.exports = function (app) {
  const Model = createModel(app);
  //const paginate = app.get('paginate');

  const options = {
    name: 'metadata',
    Model,
    //paginate
  };

  // Initialize our service with any options it requires
  app.use('/metadata', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('metadata');

  service.hooks(hooks);

};
