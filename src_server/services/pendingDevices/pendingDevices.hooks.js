//const { authenticate } = require('@feathersjs/authentication').hooks;
const processPendingDevice = require('../../hooks/process-pending-device');
const populatePendingDevice = require('../../hooks/populate-pending-device');


module.exports = {
  before: {
    //all: [authenticate('jwt')],
    all: [],
    find: [],
    get: [],
    create: [processPendingDevice()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    //all: [populateUser()],
    all: [],
    find: [populatePendingDevice()],
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
