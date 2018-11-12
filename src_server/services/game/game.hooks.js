//const { authenticate } = require('@feathersjs/authentication').hooks;
const processGame = require('../../hooks/process-game');
const populateGame = require('../../hooks/populate-game');


module.exports = {
  before: {
    //all: [authenticate('jwt')],
    all: [],
    find: [],
    get: [],
    create: [processGame()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    //all: [populateUser()],
    all: [],
    find: [populateGame()],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
