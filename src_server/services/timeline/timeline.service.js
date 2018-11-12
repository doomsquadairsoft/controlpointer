// Initializes the `messages` service on path `/messages`
const createService = require('feathers-nedb');
const createModel = require('../../models/timeline.model');
const hooks = require('./timeline.hooks');

module.exports = function(app) {
  const Model = createModel(app);
  //const paginate = app.gt('paginate');

  const options = {
    name: 'timeline',
    Model,
    //paginate
  };

  // Initialize our service with any options it requires
  app.use('/timeline', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('timeline');

  service.hooks(hooks);
};
