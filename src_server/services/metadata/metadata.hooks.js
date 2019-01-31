//const { authenticate } = require('@feathersjs/authentication').hooks;
const processMetadata = require('../../hooks/process-metadata');
const populateMetadata = require('../../hooks/populate-metadata');
const updateDeviceProgress = require('../../hooks/update-device-progress');

module.exports = {
  before: {
    //all: [authenticate('jwt')],
    all: [],
    find: [],
    get: [],
    create: [processMetadata()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    //all: [populateUser()],
    all: [],
    find: [populateMetadata()],
    get: [],
    create: [updateDeviceProgress()],
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
