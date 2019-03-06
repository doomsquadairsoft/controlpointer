//const { authenticate } = require('@feathersjs/authentication').hooks;
const processTimeline = require('../../hooks/process-timeline');
const populateTimeline = require('../../hooks/populate-timeline');
const calculateMetadata = require('../../hooks/calculate-metadata');
const patchPressedDevice = require('../../hooks/patch-pressed-device');

module.exports = {
  before: {
    //all: [authenticate('jwt')],
    all: [],
    find: [],
    get: [],
    create: [processTimeline()],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    //all: [populateUser()],
    all: [],
    find: [populateTimeline()],
    get: [],
    create: [calculateMetadata(), patchPressedDevice()],
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
