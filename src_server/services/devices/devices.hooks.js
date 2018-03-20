//const { authenticate } = require('@feathersjs/authentication').hooks;
const processDevice = require('../../hooks/process-device');
const populateUser = require('../../hooks/populate-user');
const populateDevice = require('../../hooks/populate-device');


module.exports = {
  before: {
    //all: [authenticate('jwt')],
    all: [],
    find: [],
    get: [],
    create: [processDevice()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    //all: [populateUser()],
    all: [],
    find: [populateDevice()],
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
