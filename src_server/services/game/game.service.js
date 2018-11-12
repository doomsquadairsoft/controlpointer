// Initializes the `messages` service on path `/messages`
const createService = require('feathers-nedb');
const createModel = require('../../models/game.model');
const hooks = require('./game.hooks');

module.exports = function(app) {
  const Model = createModel(app);
  //const paginate = app.gt('paginate');

  const options = {
    name: 'game',
    Model,
    //paginate
  };

  // Initialize our service with any options it requires
  app.use('/game', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('game');

  service.hooks(hooks);

  service.create({remainingGameTime: 30000}, {});
};
