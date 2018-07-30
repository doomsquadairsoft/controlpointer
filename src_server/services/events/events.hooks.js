//const { authenticate } = require('@feathersjs/authentication').hooks;
const validateEvent = require('../../hooks/validate-event');
const populateEvent = require('../../hooks/populate-event');


module.exports = {
  before: {
    //all: [authenticate('jwt')],
    all: [],
    find: [],
    get: [],
    create: [validateEvent()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    //all: [populateUser()],
    all: [],
    find: [populateEvent()],
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
